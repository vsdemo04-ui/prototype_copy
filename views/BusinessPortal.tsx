import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { Order, OrderStatus, ChatMessage } from '../types';
import { ICONS, PRODUCTS } from '../constants';

const MessageTemplates = {
  confirmation: (name: string, items: string, orderId: string) => 
    `✅ Hi ${name}! Order #${orderId.slice(-4)} confirmed. Items: ${items}. Preparing fresh now! 🧁`,
  
  delivery: (name: string, orderId: string) => 
    `🚚 Order #${orderId.slice(-4)} is on the way! You'll receive it shortly.`,
  
  ready: (name: string, orderId: string) => 
    `✨ Your order #${orderId.slice(-4)} is ready for pickup! Thank you! 🧁`
};

export const BusinessPortal: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bizNumber, setBizNumber] = useState('9999999999');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const sendInProgress = React.useRef(false);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

  // Real-time polling for orders
  useEffect(() => {
    if (isLoggedIn) {
      const loadOrders = async () => {
        try {
          const data = await store.getOrders();
          setOrders(data);
          if (!selectedOrderId && data.length > 0) {
            setSelectedOrderId(data[0].id);
          }
        } catch (err) {
          console.error('Failed to load orders:', err);
        }
      };
      
      loadOrders();
      const interval = setInterval(loadOrders, 2000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, selectedOrderId]);

  // Load chats when order selected
  useEffect(() => {
    if (selectedOrderId) {
      const loadChats = async () => {
        try {
          const data = await store.getChats(selectedOrderId);
          setChats(data);
        } catch (err) {
          console.error('Failed to load chats:', err);
        }
      };
      loadChats();
    }
  }, [selectedOrderId]);

  const handleClaim = async (order: Order) => {
    try {
      console.log('Claiming order:', order.id);
      await store.updateOrder(order.id, { 
        status: OrderStatus.CONFIRMED
      });
      console.log('Order status updated to CONFIRMED');
      
      await store.addChat({
        id: `agent-join-${Date.now()}`,
        orderId: order.id,
        sender: 'SYSTEM',
        text: '✅ Order has been claimed by the Automation Agent. Processing started!',
        timestamp: new Date().toISOString()
      });
      console.log('System message added');
      
      // Reload orders
      const data = await store.getOrders();
      setOrders(data);
      console.log('Orders reloaded');
    } catch (err) {
      console.error('Error claiming order:', err);
      alert('Failed to claim order: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  const generateQuickMessage = (template: string) => {
    if (!selectedOrder) return;
    
    const customerName = selectedOrder.customerName || 'Customer';
    const orderId = selectedOrder.id || '????';
    const items = selectedOrder.items
      .map(it => {
        const product = PRODUCTS.find(p => p.id === it.productId);
        return product ? product.name : 'Item';
      })
      .join(', ') || 'your order';
    
    switch(template) {
      case 'confirmation':
        setMsgInput(MessageTemplates.confirmation(customerName, items, orderId));
        break;
      case 'inProgress':
        setMsgInput(`🔄 Hi ${customerName}! Your order #${orderId.slice(-4)} is being prepared with love. Estimated time: 30 mins. 🧁`);
        break;
      case 'delivery':
        setMsgInput(MessageTemplates.delivery(customerName, orderId));
        break;
      case 'ready':
        setMsgInput(MessageTemplates.ready(customerName, orderId));
        break;
    }
  };

  const handleSend = async (e?: React.KeyboardEvent | React.MouseEvent) => {
    // Prevent default behavior
    if (e) {
      e.preventDefault();
      if (e.type === 'keydown') {
        const keyEvent = e as React.KeyboardEvent;
        if (keyEvent.key !== 'Enter') return;
      }
    }
    
    // Check if already sending or no order
    if (!selectedOrder || !msgInput.trim() || isLoading || sendInProgress.current) {
      return;
    }
    
    // Block any further sends
    sendInProgress.current = true;
    const messageText = msgInput.trim();
    setMsgInput(''); // Clear immediately
    setIsLoading(true);
    
    try {
      // Only add to chat, don't send WhatsApp (mocked)
      const newChat: ChatMessage = {
        id: `msg-${Date.now()}`,
        orderId: selectedOrder.id,
        sender: 'AGENT',
        text: messageText,
        timestamp: new Date().toISOString()
      };
      
      console.log('Adding chat message:', newChat);
      await store.addChat(newChat);
      console.log('Chat message added successfully');
      
      // Reload only chats (not all orders)
      const chatData = await store.getChats(selectedOrder.id);
      setChats(chatData);
      console.log('Chats reloaded:', chatData.length);
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message');
      setMsgInput(messageText); // Restore on error
    } finally {
      setIsLoading(false);
      sendInProgress.current = false; // Always reset flag
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* Green Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-white text-center">
              <div className="text-5xl mb-4">📱</div>
              <h1 className="text-3xl font-black mb-2">BakeFlow Automation</h1>
              <p className="text-sm text-white/80">Manage orders like WhatsApp Business</p>
            </div>

            {/* Form */}
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Your Business Phone</label>
                <input 
                  type="tel" 
                  placeholder="9999999999"
                  value={bizNumber}
                  onChange={e => setBizNumber(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 focus:ring-0 outline-none text-lg"
                />
              </div>
              
              <button 
                onClick={() => setIsLoggedIn(true)}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition text-lg"
              >
                🚀 Enter Automation Tool
              </button>

              <p className="text-xs text-slate-500 text-center">Demo: Use any number to login. Use 9999999999 to see owner features.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* Sidebar: Orders List (Left) */}
      <div className="w-96 bg-white flex flex-col shadow-lg border-r border-slate-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-green-500 to-green-600 text-white">
          <h2 className="text-lg font-black">📦 Incoming Orders</h2>
          <p className="text-xs text-white/80 mt-1">{orders.filter(o => o.status !== OrderStatus.COMPLETED).length} pending</p>
        </div>

        {/* Orders List */}
        <div className="flex-1 overflow-y-auto">
          {orders.filter(o => o.status !== OrderStatus.COMPLETED).length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p>No pending orders</p>
            </div>
          ) : (
            orders.filter(o => o.status !== OrderStatus.COMPLETED).map(order => (
              <div
                key={order.id}
                onClick={() => {
                  setSelectedOrderId(order.id);
                  setChats([]);
                }}
                className={`p-4 border-b border-slate-100 cursor-pointer transition hover:bg-green-50 ${
                  selectedOrderId === order.id ? 'bg-green-100 border-l-4 border-l-green-500' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-black text-slate-900 text-sm">{order.customerName}</p>
                    <p className="text-xs text-slate-500">📱 {order.customerPhone}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                    order.status === OrderStatus.CONFIRMED ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-2">
                  {order.items.length} items • ₹{order.totalAmount}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(order.createdAt).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>

        {/* Logout Button */}
        <button 
          onClick={() => setIsLoggedIn(false)}
          className="p-4 border-t border-slate-200 text-red-600 font-bold hover:bg-red-50 transition"
        >
          🚪 Logout
        </button>
      </div>

      {/* Main Chat Area (Right) */}
      {selectedOrder ? (
        <div className="flex-1 flex flex-col bg-white">
          {/* Top Header */}
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center shadow-sm">
            <div>
              <h3 className="font-black text-lg text-slate-900">{selectedOrder.customerName}</h3>
              <p className="text-xs text-slate-500">📱 {selectedOrder.customerPhone} • Order #{selectedOrder.id.slice(-6)}</p>
            </div>
            {selectedOrder.status === OrderStatus.PENDING && (
              <button 
                onClick={() => handleClaim(selectedOrder)}
                className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition text-sm"
              >
                ✋ Claim Order
              </button>
            )}
          </div>

          {/* Content Area */}
          <div className="flex-1 flex overflow-hidden gap-0">
            {/* Chat Messages */}
            <div className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                {chats.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-4xl mb-3">💬</p>
                      <p className="text-slate-400 text-sm">No messages yet. Send a quick response below!</p>
                    </div>
                  </div>
                ) : (
                  chats.map(chat => (
                    <div key={chat.id} className={`flex ${chat.sender === 'AGENT' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-5 py-3 rounded-2xl ${
                        chat.sender === 'AGENT' 
                          ? 'bg-green-500 text-white rounded-br-none' 
                          : chat.sender === 'SYSTEM'
                          ? 'bg-slate-300 text-slate-900 rounded-bl-none'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none'
                      }`}>
                        <p className="text-sm">{chat.text}</p>
                        <p className={`text-xs mt-1 ${chat.sender === 'AGENT' ? 'text-white/70' : 'text-slate-500'}`}>
                          {new Date(chat.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Response Buttons */}
              <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => generateQuickMessage('confirmation')}
                  className="px-3 py-2 bg-green-100 text-green-700 text-xs font-bold rounded-lg hover:bg-green-200 transition"
                >
                  ✅ Order Confirmed
                </button>
                <button 
                  onClick={() => generateQuickMessage('inProgress')}
                  className="px-3 py-2 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-200 transition"
                >
                  🔄 Preparing
                </button>
                <button 
                  onClick={() => generateQuickMessage('delivery')}
                  className="px-3 py-2 bg-orange-100 text-orange-700 text-xs font-bold rounded-lg hover:bg-orange-200 transition"
                >
                  🚚 Out for Delivery
                </button>
                <button 
                  onClick={() => generateQuickMessage('ready')}
                  className="px-3 py-2 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg hover:bg-purple-200 transition"
                >
                  ✨ Ready for Pickup
                </button>
              </div>

              {/* Message Input */}
              <div className="p-4 bg-white border-t border-slate-200 flex gap-3">
                <input 
                  value={msgInput}
                  onChange={e => setMsgInput(e.target.value)}
                  onKeyDown={(e) => handleSend(e)}
                  placeholder="Type message..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-green-500 focus:border-0 outline-none"
                />
                <button 
                  onClick={(e) => handleSend(e)}
                  disabled={isLoading || !msgInput.trim()}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-bold rounded-full transition"
                >
                  {isLoading ? '...' : '📤'}
                </button>
              </div>
            </div>

            {/* Right Sidebar: Order Details */}
            <div className="w-80 border-l border-slate-200 bg-slate-50 overflow-y-auto flex flex-col">
              <div className="p-5 border-b border-slate-200 bg-white sticky top-0">
                <h4 className="font-black text-slate-900 text-sm mb-3">📋 Order Details</h4>
              </div>

              <div className="p-5 space-y-4 flex-1">
                {/* Items */}
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-3">Items</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, i) => (
                      <div key={i} className="bg-white p-3 rounded-lg border border-slate-200">
                        <p className="text-sm font-bold text-slate-900">
                          {PRODUCTS.find(p => p.id === item.productId)?.name}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-slate-900">₹{item.price * item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                  <p className="text-xs text-slate-600 uppercase font-bold mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-green-600">₹{selectedOrder.totalAmount}</p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase mb-2">Status</p>
                  <p className={`text-sm font-bold px-3 py-2 rounded-lg text-center ${
                    selectedOrder.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-700' :
                    selectedOrder.status === OrderStatus.CONFIRMED ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedOrder.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <p className="text-5xl mb-3">👈</p>
            <p>Select an order to start managing</p>
          </div>
        </div>
      )}
    </div>
  );
};
