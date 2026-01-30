
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  businessNumber?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CLAIMED = 'CLAIMED',
  CONFIRMED = 'CONFIRMED',
  COMPLETED = 'COMPLETED'
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: { productId: string; quantity: number; price: number }[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  claimedBy?: string; // Agent ID
}

export interface ChatMessage {
  id: string;
  orderId: string;
  sender: 'AGENT' | 'CUSTOMER' | 'SYSTEM';
  text: string;
  timestamp: string;
}