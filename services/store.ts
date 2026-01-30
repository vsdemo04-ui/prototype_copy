
import { User, Order, ChatMessage, OrderStatus } from '../types';

const API_BASE = 'http://localhost:5001/api';

// This service now calls the backend API instead of localStorage
export const store = {
  // ===== USERS =====
  createUser: async (user: User): Promise<User> => {
    // Check if user already exists
    try {
      const existing = await store.getUserByPhone(user.phone);
      if (existing && existing.id) {
        throw new Error('Account already exists with this phone number');
      }
    } catch (err: any) {
      if (!err.message.includes('already exists')) {
        // Ignore 404 errors, only throw for duplicate error
        if (err.message && err.message.includes('already exists')) {
          throw err;
        }
      }
    }
    
    const response = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!response.ok) throw new Error('User creation failed');
    return response.json();
  },

  getUserByPhone: async (phone: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE}/users/phone/${phone}`);
      if (response.status === 404) return null;
      return response.json();
    } catch {
      return null;
    }
  },

  // ===== ORDERS =====
  createOrder: async (order: Order): Promise<Order> => {
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });
    if (!response.ok) throw new Error('Failed to create order');
    const data = await response.json();
    return data;
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const response = await fetch(`${API_BASE}/orders`);
      if (!response.ok) {
        console.error('Failed to fetch orders:', response.status, response.statusText);
        return [];
      }
      const data = await response.json();
      console.log('📦 Fetched orders:', data.length);
      return data;
    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      return [];
    }
  },

  getOrdersByCustomer: async (id: string): Promise<Order[]> => {
    const response = await fetch(`${API_BASE}/orders/customer/${id}`);
    return response.json();
  },

  updateOrder: async (orderId: string, updates: Partial<Order>): Promise<void> => {
    await fetch(`${API_BASE}/orders/${orderId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  },

  // ===== CHATS/MESSAGES =====
  addChat: async (chat: ChatMessage): Promise<ChatMessage> => {
    const response = await fetch(`${API_BASE}/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(chat)
    });
    return response.json();
  },

  getChats: async (orderId: string): Promise<ChatMessage[]> => {
    const response = await fetch(`${API_BASE}/chats/${orderId}`);
    return response.json();
  },

  // ===== AUTOMATION TOOL (Send WhatsApp) =====
  sendWhatsAppMessage: async (orderId: string, message: string, senderName: string) => {
    const response = await fetch(`${API_BASE}/automation/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, message, senderName })
    });
    return response.json();
  }
};
