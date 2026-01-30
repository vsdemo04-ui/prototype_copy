import React, { useState, useEffect } from 'react';

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: Array<{ productId: string; quantity: number; price: number }>;
  totalAmount: number;
  status: string;
  createdAt: string;
}

interface ChatMessage {
  id: string;
  orderId: string;
  sender: string;
  text: string;
  timestamp: string;
}

interface Task {
  id: string;
  orderId: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  dueDate: string;
}

export const AutomationTool: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [businessPhone, setBusinessPhone] = useState('9999999999');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [msgInput, setMsgInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTasks, setShowTasks] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [notifications, setNotifications] = useState<Array<{id: string; message: string; type: string}>>([]);

  const API_URL = 'http://localhost:5001/api';
  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  const templates = [
    "Thank you for ordering! Your order has been confirmed. Delivery in 24-48 hours.",
    "Your order is being prepared. We'll update you soon.",
    "Your order is out for delivery!",
    "Your order has been delivered. Thank you for shopping with us! 🎉",
    "Do you have any special requests or customizations?"
  ];

  // Poll orders
  useEffect(() => {
    if (!isLoggedIn) return;

    const loadOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders`);
        const data = await res.json();
        setOrders(data);
        if (!selectedOrderId && data.length > 0) {
          setSelectedOrderId(data[0].id);
        }
        
        // Check for new orders and show notification
        if (data.length > orders.length) {
          const newOrdersCount = data.length - orders.length;
          const notifId = Date.now().toString();
          setNotifications(prev => [...prev, {
            id: notifId,
            message: `${newOrdersCount} new order(s) received! 🔔`,
            type: 'success'
          }]);
          setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notifId));
          }, 4000);
        }
      } catch (err) {
        console.error('Failed to load orders:', err);
      }
    };

    loadOrders();
    const interval = setInterval(loadOrders, 2000);
    return () => clearInterval(interval);
  }, [isLoggedIn, selectedOrderId, orders.length]);

  // Load chats for selected order
  useEffect(() => {
    if (!selectedOrderId) return;

    const loadChats = async () => {
      try {
        const res = await fetch(`${API_URL}/chats?orderId=${selectedOrderId}`);
        const data = await res.json();
        setChats(data);
      } catch (err) {
        console.error('Failed to load chats:', err);
      }
    };

    loadChats();
  }, [selectedOrderId]);

  const handleSend = async (e: React.KeyboardEvent | React.MouseEvent, message?: string) => {
    e.preventDefault();
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;

    const textToSend = message || msgInput.trim();
    if (!selectedOrder || !textToSend || isLoading) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          sender: 'AGENT',
          text: textToSend,
          timestamp: new Date().toISOString()
        })
      });

      if (res.ok) {
        setMsgInput('');
        setShowTemplates(false);
        const chatRes = await fetch(`${API_URL}/chats?orderId=${selectedOrder.id}`);
        const data = await chatRes.json();
        setChats(data);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const claimOrder = async (order: Order) => {
    try {
      await fetch(`${API_URL}/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' })
      });

      await fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          sender: 'SYSTEM',
          text: '✅ Order claimed by automation agent. Processing started!',
          timestamp: new Date().toISOString()
        })
      });

      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error('Error claiming order:', err);
    }
  };

  const addTask = (orderId: string) => {
    if (!newTaskTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      orderId,
      title: newTaskTitle,
      description: '',
      status: 'pending',
      dueDate: new Date().toISOString()
    };
    setTasks([...tasks, task]);
    setNewTaskTitle('');
  };

  const completeTask = (taskId: string) => {
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
  };

  const getStats = () => {
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const confirmed = orders.filter(o => o.status === 'CONFIRMED').length;
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    const revenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    return { pending, confirmed, completed, revenue };
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerPhone.includes(searchTerm);
    const matchesFilter = !filterStatus || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const exportReport = () => {
    const stats = getStats();
    const report = `BakeFlow Order Report\n${new Date().toLocaleString()}\n\nStats:\n- Pending: ${stats.pending}\n- Confirmed: ${stats.confirmed}\n- Completed: ${stats.completed}\n- Total Revenue: ₹${stats.revenue}\n\nOrders:\n${orders.map(o => `${o.customerName} - ₹${o.totalAmount} - ${o.status}`).join('\n')}`;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${Date.now()}.txt`;
    a.click();
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-12 text-white text-center">
              <div className="text-5xl mb-4">📱</div>
              <h1 className="text-3xl font-black mb-2">BakeFlow Automation</h1>
              <p className="text-sm text-white/80">Professional Order Management Platform</p>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Business Phone</label>
                <input
                  type="tel"
                  placeholder="9999999999"
                  value={businessPhone}
                  onChange={e => setBusinessPhone(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-green-500 outline-none text-lg"
                />
              </div>
              <button
                onClick={() => setIsLoggedIn(true)}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-xl transition text-lg"
              >
                🚀 Login to Dashboard
              </button>
              <p className="text-xs text-slate-500 text-center">Demo access for all shop owners</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden flex-col">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(notif => (
            <div key={notif.id} className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-pulse">
              {notif.message}
            </div>
          ))}
        </div>
      )}

      {/* Top Stats Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="px-6 py-4 grid grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700 font-bold uppercase">Pending</p>
            <p className="text-2xl font-black text-yellow-600">{stats.pending}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <p className="text-xs text-green-700 font-bold uppercase">Confirmed</p>
            <p className="text-2xl font-black text-green-600">{stats.confirmed}</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 font-bold uppercase">Completed</p>
            <p className="text-2xl font-black text-blue-600">{stats.completed}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700 font-bold uppercase">Revenue</p>
            <p className="text-2xl font-black text-purple-600">₹{stats.revenue}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: Orders */}
        <div className="w-96 bg-white flex flex-col shadow-lg border-r border-slate-200">
          <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-green-500 to-green-600 text-white">
            <h2 className="text-lg font-black">📦 Orders</h2>
            <p className="text-xs text-white/80 mt-1">{filteredOrders.filter(o => o.status !== 'COMPLETED').length} active</p>
          </div>

          {/* Search & Filter */}
          <div className="p-4 border-b border-slate-200 space-y-3">
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus(null)}
                className={`flex-1 text-xs py-2 rounded-lg font-bold transition ${!filterStatus ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('PENDING')}
                className={`flex-1 text-xs py-2 rounded-lg font-bold transition ${filterStatus === 'PENDING' ? 'bg-yellow-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus('CONFIRMED')}
                className={`flex-1 text-xs py-2 rounded-lg font-bold transition ${filterStatus === 'CONFIRMED' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                Confirmed
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredOrders.filter(o => o.status !== 'COMPLETED').map(order => (
              <div
                key={order.id}
                onClick={() => setSelectedOrderId(order.id)}
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
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
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
            ))}
          </div>

          <div className="p-4 border-t border-slate-200 space-y-2">
            <button
              onClick={exportReport}
              className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition text-sm"
            >
              📊 Export Report
            </button>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="w-full p-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition text-sm"
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Main Area */}
        {selectedOrder ? (
          <div className="flex-1 flex flex-col bg-white">
            {/* Header */}
            <div className="p-5 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex justify-between items-center shadow-sm">
              <div>
                <h3 className="font-black text-lg text-slate-900">{selectedOrder.customerName}</h3>
                <p className="text-xs text-slate-500">📱 {selectedOrder.customerPhone}</p>
              </div>
              <div className="flex gap-3">
                {selectedOrder.status === 'PENDING' && (
                  <button
                    onClick={() => claimOrder(selectedOrder)}
                    className="px-5 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition text-sm"
                  >
                    ✋ Claim
                  </button>
                )}
                <button
                  onClick={() => setShowTasks(!showTasks)}
                  className="px-5 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-full transition text-sm"
                >
                  ✓ Tasks ({tasks.filter(t => t.orderId === selectedOrder.id && t.status === 'pending').length})
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden gap-0">
              {/* Chat */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                  {chats.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <p className="text-4xl mb-3">💬</p>
                        <p className="text-slate-400 text-sm">No messages yet. Start the conversation!</p>
                      </div>
                    </div>
                  ) : (
                    chats.map(chat => (
                      <div key={chat.id} className={`flex ${chat.sender === 'AGENT' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-5 py-3 rounded-2xl ${
                          chat.sender === 'AGENT'
                            ? 'bg-green-500 text-white rounded-br-none'
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

                {/* Input with Templates */}
                <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                  {showTemplates && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2 max-h-32 overflow-y-auto">
                      {templates.map((template, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(new MouseEvent('click') as any, template)}
                          className="w-full text-left text-xs p-2 bg-white hover:bg-green-50 rounded border border-slate-200 transition text-slate-700"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <input
                      value={msgInput}
                      onChange={e => setMsgInput(e.target.value)}
                      onKeyDown={(e) => handleSend(e)}
                      placeholder="Type message..."
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 border border-slate-200 rounded-full focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      title="Message Templates"
                      className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-full transition"
                    >
                      📋
                    </button>
                    <button
                      onClick={(e) => handleSend(e)}
                      disabled={isLoading || !msgInput.trim()}
                      className="px-6 py-3 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-bold rounded-full transition"
                    >
                      📤
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Panel: Order Details + Tasks */}
              <div className="w-80 border-l border-slate-200 bg-slate-50 overflow-y-auto flex flex-col">
                {showTasks ? (
                  <>
                    <div className="p-5 border-b border-slate-200 bg-white sticky top-0">
                      <h4 className="font-black text-slate-900 text-sm">✓ Tasks</h4>
                    </div>
                    <div className="p-5 space-y-4 flex-1">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="New task..."
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                        <button
                          onClick={() => addTask(selectedOrder.id)}
                          className="px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition text-xs"
                        >
                          Add
                        </button>
                      </div>
                      {tasks.filter(t => t.orderId === selectedOrder.id).map(task => (
                        <div key={task.id} className="bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={task.status === 'completed'}
                              onChange={() => completeTask(task.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <p className={`text-sm font-bold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                {task.title}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-5 border-b border-slate-200 bg-white sticky top-0">
                      <h4 className="font-black text-slate-900 text-sm">📋 Order #{selectedOrder.id.slice(-6)}</h4>
                    </div>

                    <div className="p-5 space-y-4 flex-1">
                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase mb-3">Items</p>
                        <div className="space-y-2">
                          {selectedOrder.items.map((item, i) => (
                            <div key={i} className="bg-white p-3 rounded-lg border border-slate-200">
                              <p className="text-sm font-bold text-slate-900">Item #{i + 1}</p>
                              <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-slate-500">Qty: {item.quantity}</p>
                                <p className="text-sm font-bold text-slate-900">₹{item.price * item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                        <p className="text-xs text-slate-600 uppercase font-bold mb-1">Total</p>
                        <p className="text-2xl font-black text-green-600">₹{selectedOrder.totalAmount}</p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase mb-2">Status</p>
                        <p className={`text-sm font-bold px-3 py-2 rounded-lg text-center ${
                          selectedOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          selectedOrder.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {selectedOrder.status}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-bold text-slate-600 uppercase mb-2">Created</p>
                        <p className="text-xs text-slate-700">
                          {new Date(selectedOrder.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <p>Select an order to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomationTool;
