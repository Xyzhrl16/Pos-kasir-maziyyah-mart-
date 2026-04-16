
export enum Category {
  KITCHEN = 'Kebutuhan Dapur',
  SCHOOL = 'Perlengkapan Sekolah',
  HOUSEHOLD = 'Kebutuhan Rumah Tangga',
  FOOD = 'Makanan',
  BEVERAGE = 'Minuman'
}

export enum PaymentMethod {
  CASH = 'Tunai',
  QRIS = 'QRIS',
  DEBIT = 'Debit',
  EWALLET = 'E-Wallet'
}

export interface Product {
  id: string;
  barcode: string;
  name: string;
  category: Category;
  price: number;
  costPrice: number; // Harga modal untuk hitung profit
  stock: number;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  totalCost: number; // Total modal pada saat transaksi
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  customerName?: string;
}

export interface Expense {
  id: string;
  timestamp: Date;
  description: string;
  amount: number;
  category: string;
}
