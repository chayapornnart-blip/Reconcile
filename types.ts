export enum TransactionSource {
  BANK = 'BANK',
  BOOK = 'BOOK',
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  source: TransactionSource;
  originalText?: string;
}

export enum MatchStatus {
  MATCHED = 'MATCHED', // Exact match
  FUZZY = 'FUZZY',     // Probable match (e.g. slight date diff)
  UNMATCHED = 'UNMATCHED',
}

export interface MatchPair {
  id: string;
  bankTx: Transaction;
  bookTx: Transaction;
  status: MatchStatus;
  confidence: number; // 0-100
  notes?: string;
}

export interface ReconciliationResult {
  matches: MatchPair[];
  unmatchedBank: Transaction[];
  unmatchedBook: Transaction[];
  stats: {
    totalBank: number;
    totalBook: number;
    matchedCount: number;
    unmatchedBankCount: number;
    unmatchedBookCount: number;
    totalDifference: number;
  };
}

export interface AIAnalysisResult {
  insights: string[]; // Key takeaways (e.g., "Found 2 unrecorded fees")
  suggestions: {
    id: string; // Transaction ID
    category: 'TIMING' | 'FEE' | 'ERROR' | 'MISSING' | 'OTHER';
    reason: string; // Why it didn't match
    action: 'ADJUST_BOOK' | 'INVESTIGATE' | 'IGNORE';
    confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}