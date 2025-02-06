export type InvoiceItem = {
  name: string;
  price: number; 
  type: string;
  quantity: number;
  taxes: number;
};

export type Invoice = {
  id: string;
  client_id: number;
  invoice_id: string;
  creation_date: string;
  due_date: string;
  currency: string;
  fiscal_stamp: boolean;
  invoiceItems: InvoiceItem[];
  isExpanded: boolean;
};

