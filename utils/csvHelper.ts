import { Transaction, TransactionSource } from '../types';

// ฟังก์ชันจำลอง ID
const generateId = () => Math.random().toString(36).substring(2, 9);

export const parseCSV = (content: string, source: TransactionSource): Transaction[] => {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Simple heuristic mapping
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('วันที่'));
  const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('detail') || h.includes('รายการ'));
  const amountIdx = headers.findIndex(h => h.includes('amount') || h.includes('จำนวน'));

  if (dateIdx === -1 || amountIdx === -1) {
    throw new Error('CSV Format Invalid: ต้องมีคอลัมน์ Date และ Amount');
  }

  return lines.slice(1).map((line): Transaction | null => {
    const cols = line.split(',').map(c => c.trim());
    if (cols.length < headers.length) return null;

    const rawAmount = cols[amountIdx];
    const cleanAmount = parseFloat(rawAmount.replace(/,/g, ''));

    return {
      id: generateId(),
      date: cols[dateIdx],
      description: descIdx !== -1 ? cols[descIdx] : 'No Description',
      amount: cleanAmount,
      source: source,
      originalText: line
    };
  }).filter((t): t is Transaction => t !== null && !isNaN(t.amount));
};

export const generateSampleData = () => {
  const bankCSV = `Date,Description,Amount
2023-10-01,Opening Balance,10000
2023-10-02,Payment received from Client A,5000
2023-10-03,Utility Bill Payment,-1500
2023-10-05,Bank Fee,-50
2023-10-10,Transfer to Supplier B,-2000
2023-10-12,Interest Income,25`;

  const bookCSV = `Date,Description,Amount
2023-10-01,B/F Balance,10000
2023-10-02,Client A Payment,5000
2023-10-03,Utility Expense,-1500
2023-10-10,Supplier B Payment,-2000
2023-10-12,Unrecorded Interest,0
2023-10-15,Erroneous Entry,-500`;

  return { bankCSV, bookCSV };
};