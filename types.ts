
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
