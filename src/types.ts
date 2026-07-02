export type TransactionType = 'gave' | 'got';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  note: string;
  isEdited?: boolean;
}

export interface Account {
  id: string;
  name: string;
  phone?: string;
  accountType?: 'individual' | 'business';
  gstin?: string;
  transactions: Transaction[];
  createdAt: string;
}
