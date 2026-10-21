export type Role = "SUPERADMIN" | "COMPANY_ADMIN" | "STAFF";
export type Currency = "MMK" | "USD" | "THB";
export type Status = "DRAFT" | "UNPAID" | "PAID" | "OVERDUE";
export type User = {
  isDemo?: boolean;
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  status: "ACTIVE" | "SUSPENDED";
  version: number;
};
export type Company = {
  products?: { id: string; name: string; price: string; currency: Currency }[];
  financialOverview?: import("./financial-overview").OverviewSettings;
  paymentAccounts?: Partial<
    Record<
      "kpay" | "wavepay" | "bank",
      {
        name: string;
        number: string;
      }
    >
  >;
  invoiceDesign?: import("./invoice-design").InvoiceDesign;
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  taxId: string;
  logo: string;
  signature: string;
  kpay: string;
  wavepay: string;
  bank: string;
};
export type Client = {
  id: string;
  companyId: string;
  name: string;
  email: string;
  address: string;
  phone: string;
};
export type LineItem = {
  id: string;
  description: string;
  quantity: string;
  price: string;
};
export type InvoiceInput = {
  design?: import("./invoice-design").InvoiceDesign;
  clientId: string;
  title: string;
  currency: Currency;
  issueDate: string;
  dueDate: string;
  terms: string;
  items: LineItem[];
  discountType: "PERCENT" | "FIXED";
  discount: string;
  tax: string;
  payment: "" | "kpay" | "wavepay" | "bank";
};
export type Invoice = InvoiceInput & {
  id: string;
  companyId: string;
  number: string;
  status: "DRAFT" | "UNPAID" | "PAID";
  company: Company;
  client: Client;
  createdAt: string;
  paidAt: string | null;
  revision: number;
  totals: Totals;
};
export type Totals = {
  lines: number[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
};
export type Result<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string };
