
import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { Order, OrderStatus, User, ChatMessage, UserRole } from '../types';
import { ICONS, PRODUCTS } from '../constants';

interface AdminDashboardProps {
  admin: User;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedOrder = orders.find(o => o.id === selectedOrderId) || null;

  const loadData = async () => {
    try {
      const data = await store.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

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
      await store.updateOrder(order.id, { status: OrderStatus.CLAIMED, claimedBy: admin.id });
      
      const systemMsg: ChatMessage = {
        id: Date.now().toString(),
        orderId: order.id,
        sender: 'SYSTEM',
        text: `${admin.name} is now handling this request.`,
        timestamp: new Date().toISOString()
      };
      
      await store.addChat(systemMsg);
      await loadData();
    } catch (err) {
      console.error('Error claiming order:', err);
    }
  };

  const generateAiReply = async () => {
    if (!selectedOrder) return;
    setIsAiLoading(true);
    try {
      const items = selectedOrder.items
        .map(it => PRODUCTS.find(p => p.id === it.productId)?.name)
        .join(', ');
      
      // Use predefined template instead of AI
      setMsgInput(`✅ Namaste ${selectedOrder.customerName}! Your order for ${items} is confirmed at our bakery. We are preparing it fresh! 🧁`);
    } catch (err) {
      console.error(err);
      setMsgInput("✅ Your order is confirmed! We're preparing it now.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendMsg = async (textOverride?: string) => {
    const textToSend = textOverride || msgInput;
    if (!selectedOrder || !textToSend.trim()) return;

    try {
      const newChat: ChatMessage = {
        id: Date.now().toString(),
        orderId: selectedOrder.id,
        sender: 'AGENT',
        text: textToSend,
        timestamp: new Date().toISOString()
      };
      
      await store.addChat(newChat);
      
      if (textToSend.includes('confirmed')) {
        await store.updateOrder(selectedOrder.id, { status: OrderStatus.CONFIRMED });
      }
      
      const chatData = await store.getChats(selectedOrder.id);
      setChats(chatData);
      setMsgInput('');
      
      const orderData = await store.getOrders();
      setOrders(orderData);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const getProductNames = (order: Order) => {
    return order.items.map(item => {
      const p = PRODUCTS.find(prod => prod.id === item.productId);
      return p ? `${item.quantity}x ${p.name}` : 'Item';
    }).join(', ');
  };

  return (
    <div className="flex h-[calc(100vh-65px)] overflow-hidden bg-slate-100">
      {/* Sidebar: Navigation Icons (Respond.io Style) */}
      <div className="w-16 bg-[#075e54] flex flex-col items-center py-6 gap-6 text-white/70">
        <div className="p-2 bg-white/10 rounded-xl text-white"><ICONS.Chat /></div>
        <div className="p-2 hover:bg-white/10 rounded-xl transition cursor-not-allowed"><ICONS.User /></div>
        <div className="p-2 hover:bg-white/10 rounded-xl transition cursor-not-allowed"><ICONS.Admin /></div>
        <div className="mt-auto p-2 hover:bg-white/10 rounded-xl transition cursor-pointer"><ICONS.Shop /></div>
      </div>

      {/* Sidebar: Shared Inbox List */}
      <div className="w-80 md:w-96 border-r border-slate-200 bg-white flex flex-col h-full">
        <div className="p-5 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">Shared Inbox</h2>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 py-1.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">All</button>
            <button className="flex-1 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-400">Mine</button>
            <button className="flex-1 py-1.5 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-400">Unassigned</button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrderId(order.id)}
              className={`p-4 border-b border-slate-50 cursor-pointer transition flex items-start gap-3 ${
                selectedOrderId === order.id ? 'bg-teal-50/50 border-l-4 border-l-[#075e54]' : 'hover:bg-slate-50'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold relative flex-shrink-0">
                {order.customerName.charAt(0)}
                {order.status === OrderStatus.PENDING && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="font-semibold text-slate-800 truncate text-sm">{order.customerName}</h3>
                  <span className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-slate-500 truncate">{getProductNames(order)}</p>
                <div className="mt-1 flex items-center gap-2">
                   <span className="text-[10px] text-slate-400 italic">#{order.id.slice(-4)}</span>
                   {order.claimedBy && <span className="text-[10px] px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded-md font-medium">Claimed</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Chat Window */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {selectedOrder ? (
          <>
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#075e54] flex items-center justify-center text-white font-bold">
                  {selectedOrder.customerName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">{selectedOrder.customerName}</h3>
                  <p className="text-[11px] text-slate-400">{selectedOrder.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!selectedOrder.claimedBy ? (
                  <button 
                    onClick={() => handleClaim(selectedOrder)}
                    className="px-4 py-2 bg-[#075e54] hover:bg-[#064e46] text-white text-xs font-bold rounded-lg shadow-sm"
                  >
                    Claim Conversation
                  </button>
                ) : (
                  <div className="text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    Assigned to you
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
              {/* Messages Area */}
              <div className="flex-1 flex flex-col whatsapp-bg">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                  {chats.map(chat => (
                    // FIX: Changed sender check from 'ADMIN' to 'AGENT'
                    <div key={chat.id} className={`flex ${chat.sender === 'AGENT' ? 'justify-end' : chat.sender === 'SYSTEM' ? 'justify-center' : 'justify-start'}`}>
                      {chat.sender === 'SYSTEM' ? (
                        <div className="bg-white/80 backdrop-blur px-4 py-1 rounded-full text-[10px] font-bold text-slate-500 border border-slate-100 shadow-sm">
                          {chat.text}
                        </div>
                      ) : (
                        // FIX: Changed sender check from 'ADMIN' to 'AGENT'
                        <div className={`max-w-[70%] p-3 rounded-xl shadow-sm relative ${
                          chat.sender === 'AGENT' ? 'bg-[#dcf8c6] text-slate-800 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none'
                        }`}>
                          <p className="text-sm leading-relaxed">{chat.text}</p>
                          <div className="flex justify-end items-center gap-1 mt-1">
                            <span className="text-[9px] text-slate-400">
                              {new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {/* FIX: Changed sender check from 'ADMIN' to 'AGENT' */}
                            {chat.sender === 'AGENT' && <span className="text-blue-500 text-[10px]">✓✓</span>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-slate-200">
                  <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                    <button 
                      onClick={generateAiReply}
                      disabled={isAiLoading || !selectedOrder.claimedBy}
                      className="whitespace-nowrap px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg text-xs font-bold border border-purple-100 flex items-center gap-2 disabled:opacity-50"
                    >
                      {isAiLoading ? 'Thinking...' : '✨ Suggest AI Reply'}
                    </button>
                    <button 
                      onClick={() => setMsgInput("✅ Your order is confirmed!")}
                      className="whitespace-nowrap px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200"
                    >
                      Quick Confirm
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      value={msgInput}
                      disabled={!selectedOrder.claimedBy}
                      onChange={(e) => setMsgInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMsg()}
                      placeholder={selectedOrder.claimedBy ? "Type a message..." : "Claim to start chatting"}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#075e54] focus:outline-none focus:bg-white"
                    />
                    <button 
                      onClick={() => handleSendMsg()}
                      disabled={!msgInput.trim()}
                      className="w-10 h-10 bg-[#075e54] text-white rounded-xl flex items-center justify-center shadow-lg disabled:opacity-50"
                    >
                      ➔
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Contact & Order Info */}
              <div className="w-80 border-l border-slate-200 bg-white p-6 overflow-y-auto hidden xl:block custom-scrollbar">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Contact Profile</h4>
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-3xl mx-auto mb-4">
                    {selectedOrder.customerName.charAt(0)}
                  </div>
                  <h3 className="font-bold text-lg text-slate-800">{selectedOrder.customerName}</h3>
                  <p className="text-sm text-slate-500">{selectedOrder.customerPhone}</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Order Details</h5>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      {selectedOrder.items.map((item, idx) => {
                        const p = PRODUCTS.find(prod => prod.id === item.productId);
                        return (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-slate-600 font-medium">{item.quantity}x {p?.name}</span>
                            <span className="text-slate-800 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        );
                      })}
                      <div className="border-t border-slate-200 pt-2 flex justify-between">
                        <span className="text-xs font-bold text-slate-800">Total</span>
                        <span className="text-sm font-black text-[#075e54]">${selectedOrder.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-[10px] font-bold text-slate-400 uppercase mb-3">Tags</h5>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-teal-50 text-teal-600 text-[10px] font-bold rounded-md">Vip Customer</span>
                      <span className="px-2 py-1 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-md">Pending Payment</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
             <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                <ICONS.Chat />
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Welcome to your Shared Inbox</h3>
             <p className="text-slate-500 max-w-sm">Select a conversation from the left to start managing orders and communicating with customers.</p>
          </div>
        )}
      </div>
    </div>
  );
};