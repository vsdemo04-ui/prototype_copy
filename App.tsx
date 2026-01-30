
import React, { useState, useEffect } from 'react';
import { User, Order, OrderStatus } from './types';
import { Storefront } from './views/Storefront';
import { BusinessPortal } from './views/BusinessPortal';
import { store } from './services/store';
import { ICONS } from './constants';
import { AuthModal } from './components/AuthModal';


const OWNER_PHONE = '9999999999'; // Shop owner's phone number
const LAUNCH_MODE = new URLSearchParams(window.location.search).get('mode') || 'shop'; // 'shop' or 'automation'

const App: React.FC = () => {
  

  // Otherwise, show the shop
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<{product: any, quantity: number}[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Check if owner is logged in
  const isOwner = user?.phone === OWNER_PHONE;

  // Real-time order polling with notifications (for customers only)
  useEffect(() => {
    if (user && !isOwner) {
      const interval = setInterval(async () => {
        try {
          const myOrders = await store.getOrdersByCustomer(user.id);
          const latest = myOrders[0];
          // If order confirmed and notification not shown yet
          if (latest && latest.status === OrderStatus.CONFIRMED && !notification) {
            setNotification(`✅ BakeFlow: Hi ${user.name}, your order #${latest.id.slice(-4)} is confirmed! We are starting the bake now! 🧁`);
            setTimeout(() => setNotification(null), 10000);
          }
        } catch (err) {
          console.error('Failed to fetch orders:', err);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [user, isOwner, notification]);

  const addToCart = (product: any) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id);
      if (ex) return prev.map(i => i.product.id === product.id ? {...i, quantity: i.quantity + 1} : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleCheckout = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (cart.length === 0) return;

    const items = cart.map(c => ({
      productId: c.product.id,
      quantity: c.quantity,
      price: c.product.price
    }));
    const total = items.reduce((s, i) => s + (i.price * i.quantity), 0);
    
    const newOrder: Order = {
      id: 'ORD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      customerId: user.id,
      customerName: user.name,
      customerPhone: user.phone,
      items,
      totalAmount: total,
      status: OrderStatus.PENDING,
      createdAt: new Date().toISOString()
    };
    
    try {
      await store.createOrder(newOrder);
      setCart([]);
      alert(`✅ Success! Your order ${newOrder.id} has been received. Please check WhatsApp for updates.`);
      window.location.hash = '#profile';
    } catch (err) {
      console.error('Checkout error:', err);
      alert('❌ Failed to create order. Please try again.');
    }
  };

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    window.location.hash = '#';
  };

  // === NO USER LOGGED IN: Show Customer Storefront Only ===
  if (!user) {
    return (
      <>
        <Storefront 
          user={null}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={() => {}}
          cart={cart}
          onAddToCart={addToCart}
          onCheckout={handleCheckout}
        />
        
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onLogin={handleLogin}
        />
      </>
    );
  }

  // === OWNER LOGGED IN: Show Only Business Portal (Automation Tool) ===
  if (isOwner) {
    return (
      <>
        <BusinessPortal />
        
        {/* Owner Logout Button */}
        <button
          onClick={handleLogout}
          className="fixed top-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 z-50 font-bold shadow-lg"
        >
          🚪 Logout
        </button>
      </>
    );
  }

  // === CUSTOMER LOGGED IN: Show Customer Storefront Only ===
  return (
    <>
      <Storefront 
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        cart={cart}
        onAddToCart={addToCart}
        onCheckout={handleCheckout}
      />
      
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin}
      />

      {/* Order Confirmation Notification */}
      {notification && (
        <div className="fixed top-28 right-6 left-6 sm:left-auto sm:w-[28rem] bg-white border-l-[12px] border-green-500 shadow-[0_40px_100px_rgba(0,0,0,0.2)] p-8 z-[200] rounded-[2.5rem] animate-in slide-in-from-right-10 duration-700">
          <div className="flex items-start gap-6">
            <div className="bg-green-100 text-green-600 p-4 rounded-[1.5rem] shadow-sm"><ICONS.WhatsApp /></div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                 <p className="text-xs font-black text-slate-800 uppercase tracking-[0.2em] flex items-center gap-2">
                   BakeFlow Shop
                   <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                 </p>
                 <span className="text-[10px] text-slate-400 font-black">JUST NOW</span>
              </div>
              <p className="text-base text-slate-700 font-bold leading-relaxed">{notification}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );};

export default App;