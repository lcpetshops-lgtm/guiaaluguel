
export interface FAQItem {
  question: string;
  answer: string;
}

export interface Benefit {
  title: string;
  description: string;
  icon: string;
}

export type PaymentMethod = 'PIX' | 'PAGBANK';
export type OrderStatus = 'PENDING' | 'PAID' | 'SENT';

export interface PaymentSettings {
  // Added optional id property to support Supabase upsert logic and resolve type errors
  id?: number | string;
  pagbankEnabled: boolean;
  pixEnabled: boolean;
  apiKey: string;
  pixKey: string;
  pixQrCode: string;
  // E-mail SMTP/API Settings
  emailEnabled: boolean;
  emailServiceId: string;
  emailTemplateId: string;
  emailPublicKey: string;
  // E-book Storage
  ebookFileData?: string;
  ebookFileName?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amount: string;
  method: PaymentMethod;
  status: OrderStatus;
  date: string;
}
