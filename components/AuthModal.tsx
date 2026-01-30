
import React, { useState } from 'react';
import { ICONS } from '../constants';
import { User, UserRole } from '../types';
import { store } from '../services/store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      try {
        const user = await store.getUserByPhone(formData.phone);
        if (user) {
          onLogin(user);
          onClose();
        } else {
          alert("User not found. Please sign up!");
          setIsLogin(false);
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Login failed. Please try again.');
      }
    } else {
      try {
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          role: UserRole.CUSTOMER
        };
        await store.createUser(newUser);
        onLogin(newUser);
        onClose();
      } catch (err) {
        console.error('Signup error:', err);
        alert('Signup failed. ' + (err instanceof Error ? err.message : 'Please try again.'));
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
              <p className="text-sm text-slate-500 mt-1">Join the Sweet Treats community</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Full Name</label>
                <input 
                  required
                  type="text" 
                  placeholder="John Doe"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition"
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">WhatsApp Phone</label>
              <input 
                required
                type="tel" 
                placeholder="+1 234 567 890"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition"
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1 ml-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-pink-500 outline-none transition"
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            )}
            
            <button className="w-full py-4 bg-pink-500 hover:bg-pink-600 text-white font-bold rounded-2xl shadow-lg shadow-pink-100 transition-all active:scale-[0.98] mt-4">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-pink-500 font-semibold hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
           <p className="text-[10px] text-slate-400">By continuing, you agree to our Terms of Service</p>
        </div>
      </div>
    </div>
  );
};
