export interface Solopreneur {
  businessName: string;
  whatsappTemplate: string;
  smsTemplate: string;
}

export type ClientStatus = 'Active' | 'Inactive';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: ClientStatus;
  createdAt: string;
}

export type InvoiceStatus = 'Paid' | 'Pending' | 'Overdue';

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: InvoiceStatus;
  dueDate: string;
  description: string;
}

export interface FollowUp {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD format
  description: string;
  completed: boolean;
}
