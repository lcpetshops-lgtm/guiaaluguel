
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
  id?: number | string;
  pagbank_enabled: boolean;
  pix_enabled: boolean;
  api_key: string;
  pix_key: string;
  pix_qr_code: string;
  email_enabled: boolean;
  email_service_id: string;
  email_template_id: string;
  email_public_key: string;
  ebook_file_data?: string;
  ebook_file_name?: string;
}

export interface Order {
  id: string;
  name: string;
  email: string;
  phone: string;
  amount: string;
  method: PaymentMethod;
  status: OrderStatus;
  date: string;
}
