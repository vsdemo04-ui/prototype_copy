
import React, { useState } from 'react';
import { PRODUCTS, ICONS } from '../constants';
import { User, Order, OrderStatus } from '../types';
import { store } from '../services/store';

interface StorefrontProps {
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  cart: { product: any, quantity: number }[];
  onAddToCart: (p: any) => void;
  onCheckout: () => void;
}

export const Storefront: React.FC<StorefrontProps> = ({ user, onOpenAuth, onLogout, cart, onAddToCart, onCheckout }) => {
  const [activeTab, setActiveTab] = useState<'SHOP' | 'PROFILE'>('SHOP');
  const [myOrders, setMyOrders] = useState<Order[]>([]);

  // Fetch orders when profile tab opens
  React.useEffect(() => {
    if (user && activeTab === 'PROFILE') {
      const loadOrders = async () => {
        try {
          const orders = await store.getOrdersByCustomer(user.id);
          setMyOrders(orders);
        } catch (err) {
          console.error('Failed to load orders:', err);
        }
      };
      loadOrders();
    }
  }, [user, activeTab]);

  return (
    <div className="min-h-screen bg-[#fffcf9]">
      {/* Header - Indian Gold & Rose Theme */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-orange-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('SHOP')}>
           <div className="bg-gradient-to-br from-orange-500 to-rose-600 p-2.5 rounded-2xl text-white shadow-md shadow-orange-100">
             <ICONS.Shop />
           </div>
           <span className="font-black text-2xl tracking-tighter text-slate-900">Mithai<span className="text-orange-600">Magic</span></span>
        </div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('SHOP')} 
            className={`text-sm font-bold transition-colors ${activeTab === 'SHOP' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Menu
          </button>
          {user && (
            <button 
              onClick={() => setActiveTab('PROFILE')} 
              className={`text-sm font-bold transition-colors ${activeTab === 'PROFILE' ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              My Orders
            </button>
          )}
          
          <div className="h-6 w-px bg-slate-200"></div>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                <button onClick={onLogout} className="text-[10px] text-slate-400 hover:text-red-500 hover:underline">Logout</button>
              </div>
              <div className="w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center border border-orange-100 text-orange-500">
                <ICONS.User />
              </div>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-black transition shadow-lg shadow-slate-100 active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {activeTab === 'SHOP' ? (
        <>
          {/* Hero Section */}
          <section className="px-6 py-12 md:py-24 max-w-7xl mx-auto overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-orange-100/30 rounded-full blur-3xl"></div>
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 relative z-10">
                <span className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-200">Authentic Flavors</span>
                <h1 className="text-6xl md:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter">
                  Where Heritage <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-600">Meets Taste.</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-md leading-relaxed">
                  India's first fusion bakery combining artisan French techniques with the rich flavors of Indian heritage.
                </p>
                <div className="flex gap-4">
                   <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-4 bg-orange-600 text-white font-bold rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-700 transition active:scale-95">Shop Now</button>
                   <button className="px-10 py-4 bg-white text-slate-900 border border-slate-200 font-bold rounded-2xl hover:bg-slate-50 transition">The Mithai Story</button>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-rose-400 rounded-[4rem] rotate-3 -z-10 blur-2xl opacity-20"></div>
                <img 
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=1000" 
                  className="rounded-[3rem] shadow-2xl object-cover h-[500px] w-full border-8 border-white"
                />
              </div>
            </div>
          </section>

          {/* Products Grid */}
          <section id="products" className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-100">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tight">Our Signature Bakes</h2>
                <p className="text-slate-500 mt-2 font-medium">Baked fresh every 4 hours</p>
              </div>
              <div className="flex gap-3">
                <button className="p-3.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition shadow-sm">←</button>
                <button className="p-3.5 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-slate-900 transition shadow-sm">→</button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {PRODUCTS.map(product => (
                <div key={product.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-3">
                  <div className="relative overflow-hidden h-72">
                    <img src={product.image} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl text-lg font-black text-slate-900 shadow-xl border border-slate-100">₹{product.price}</div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-black text-xl text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">{product.name}</h3>
                    <p className="text-sm text-slate-500 mb-8 line-clamp-2 leading-relaxed font-medium">{product.description}</p>
                    <button 
                      onClick={() => onAddToCart(product)}
                      className="w-full py-4 bg-slate-50 text-slate-900 text-sm font-black rounded-[1.25rem] group-hover:bg-orange-600 group-hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      Add to Basket
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <div className="max-w-4xl mx-auto px-6 py-24">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">Track Orders</h2>
              <p className="text-slate-500 mt-2 font-medium">Real-time status from our kitchen</p>
            </div>
            <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center border border-orange-100">
              <ICONS.Cart />
            </div>
          </div>

          <div className="space-y-8">
            {myOrders.length === 0 ? (
              <div className="text-center py-40 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                <p className="text-slate-400 font-black text-xl uppercase tracking-widest">No orders yet</p>
                <button onClick={() => setActiveTab('SHOP')} className="text-orange-600 font-black mt-4 hover:underline text-sm uppercase">Explore our Mithai Fusion →</button>
              </div>
            ) : (
              myOrders.map(order => (
                <div key={order.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-50/50 flex flex-col md:flex-row gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">ID: #{order.id.slice(-6)}</span>
                      <span className={`text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-tighter shadow-sm border ${
                        order.status === OrderStatus.PENDING ? 'bg-orange-50 text-orange-600 border-orange-100' :
                        order.status === OrderStatus.CONFIRMED ? 'bg-green-50 text-green-600 border-green-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                      }`}>{order.status}</span>
                    </div>
                    <div className="space-y-3">
                      {order.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-slate-600 font-bold">{it.quantity}x {PRODUCTS.find(p => p.id === it.productId)?.name}</span>
                          <span className="font-black text-slate-900">₹{(it.price * it.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-dashed border-slate-200 pt-6 flex justify-between items-center">
                      <span className="font-black text-slate-400 uppercase text-xs">Final Amount</span>
                      <span className="text-4xl font-black text-orange-600 tracking-tighter">₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="md:w-64 flex flex-col justify-center items-center bg-slate-50 rounded-[2.5rem] p-8 text-center border border-slate-100">
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg ${order.status === OrderStatus.CONFIRMED ? 'bg-green-500 text-white animate-bounce' : 'bg-white text-slate-300'}`}>
                        <ICONS.WhatsApp />
                     </div>
                     <p className="text-sm font-black text-slate-800 leading-tight uppercase tracking-tight">
                       {order.status === OrderStatus.CONFIRMED ? 'WhatsApp Verified' : 'Awaiting Confirmation'}
                     </p>
                     <p className="text-xs text-slate-400 mt-2 font-medium">
                       {order.status === OrderStatus.CONFIRMED ? 'Order is being packed!' : 'Usually within 15 mins'}
                     </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Floating Cart UI */}
      {cart.length > 0 && activeTab === 'SHOP' && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-[60]">
          <div className="bg-slate-900 text-white shadow-[0_40px_100px_rgba(0,0,0,0.3)] rounded-[2.5rem] p-6 flex items-center justify-between animate-in slide-in-from-bottom-10 duration-700">
            <div className="flex items-center gap-5">
              <div className="bg-orange-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">
                {cart.reduce((s,i) => s + i.quantity, 0)}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Your Selection</p>
                <p className="text-3xl font-black text-white mt-1 tracking-tighter">₹{cart.reduce((s,i) => s + (i.product.price * i.quantity), 0).toFixed(2)}</p>
              </div>
            </div>
            <button 
              onClick={onCheckout} 
              className="px-10 py-4 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-2xl shadow-xl shadow-orange-900/40 transition-all active:scale-95 uppercase text-sm tracking-widest"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
