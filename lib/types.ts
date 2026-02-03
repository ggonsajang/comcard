export type ExpenseCategory = '중식' | '석식' | '숙박비' | 'KTX' | '택시' | '자차' | '회식비' | '기타';
export type WorkType = '감리' | '내근' | '기타';

export interface Expense {
  id: string;
  date: string; // ISO 2025-12-29T12:56:00
  category: ExpenseCategory;
  amount: number;
  workType: WorkType;
  projectName: string;
  participants: string;
  remarks: string;
  receiptImage: string | null; // Data URL
  createdAt: number;
}
