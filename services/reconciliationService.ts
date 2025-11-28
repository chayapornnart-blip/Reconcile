import { Transaction, TransactionSource, ReconciliationResult, MatchPair, MatchStatus } from '../types';

export const reconcileData = (bankData: Transaction[], bookData: Transaction[]): ReconciliationResult => {
  const matches: MatchPair[] = [];
  const unmatchedBank: Transaction[] = [...bankData];
  const unmatchedBook: Transaction[] = [...bookData];

  // Helper to remove item from array
  const removeFromArray = (arr: Transaction[], id: string) => {
    const idx = arr.findIndex(t => t.id === id);
    if (idx !== -1) arr.splice(idx, 1);
  };

  // 1. Exact Match: Amount & Date match exactly
  // วนลูป Bank เป็นหลัก (Source of Truth)
  for (const bankTx of [...unmatchedBank]) {
    const exactMatchIndex = unmatchedBook.findIndex(
      bookTx => bookTx.amount === bankTx.amount && bookTx.date === bankTx.date
    );

    if (exactMatchIndex !== -1) {
      const bookTx = unmatchedBook[exactMatchIndex];
      matches.push({
        id: `match-${bankTx.id}-${bookTx.id}`,
        bankTx,
        bookTx,
        status: MatchStatus.MATCHED,
        confidence: 100,
        notes: 'ตรงกันสมบูรณ์'
      });
      removeFromArray(unmatchedBank, bankTx.id);
      removeFromArray(unmatchedBook, bookTx.id);
    }
  }

  // 2. Fuzzy Match: Amount match + Date tolerance (+/- 2 days)
  for (const bankTx of [...unmatchedBank]) {
    const fuzzyMatchIndex = unmatchedBook.findIndex(bookTx => {
      if (bookTx.amount !== bankTx.amount) return false;
      
      const bankDate = new Date(bankTx.date).getTime();
      const bookDate = new Date(bookTx.date).getTime();
      const diffTime = Math.abs(bookDate - bankDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      return diffDays <= 2;
    });

    if (fuzzyMatchIndex !== -1) {
      const bookTx = unmatchedBook[fuzzyMatchIndex];
      matches.push({
        id: `fuzzy-${bankTx.id}-${bookTx.id}`,
        bankTx,
        bookTx,
        status: MatchStatus.FUZZY,
        confidence: 80,
        notes: 'วันที่คลาดเคลื่อนเล็กน้อย'
      });
      removeFromArray(unmatchedBank, bankTx.id);
      removeFromArray(unmatchedBook, bookTx.id);
    }
  }

  // คำนวณ Stats
  const totalDifference = unmatchedBank.reduce((sum, t) => sum + t.amount, 0) - 
                          unmatchedBook.reduce((sum, t) => sum + t.amount, 0);

  return {
    matches,
    unmatchedBank,
    unmatchedBook,
    stats: {
      totalBank: bankData.length,
      totalBook: bookData.length,
      matchedCount: matches.length,
      unmatchedBankCount: unmatchedBank.length,
      unmatchedBookCount: unmatchedBook.length,
      totalDifference
    }
  };
};