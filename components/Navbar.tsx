
import React from 'react';
import { ICONS } from '../constants';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSwitchMode: () => void;
  cartCount: number;
  onViewCart: () => void;
  onViewProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onSwitchMode, cartCount, onViewCart, onViewProfile }) => {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.hash = '#'}>
        <div className="bg-pink-500 text-white p-2 rounded-lg">
          <ICONS.Shop />
        </div>
        <span className="text-xl font-bold tracking-tight text-slate-800">BakeFlow</span>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            {user.role === UserRole.ADMIN && (
              <button 
                onClick={onSwitchMode}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition text-sm font-medium"
              >
                <ICONS.Admin />
                Dashboard View
              </button>
            )}
            
            <button 
              onClick={onViewCart}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              <ICONS.Cart />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 ml-2 pl-4 border-l border-slate-200">
              <button 
                onClick={onViewProfile}
                className="flex items-center gap-2 group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                  <ICONS.User />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-700 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 leading-tight capitalize">{user.role}</p>
                </div>
              </button>
              <button 
                onClick={onLogout}
                className="text-xs text-red-500 font-medium hover:underline"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <button 
            onClick={() => window.location.hash = '#login'}
            className="px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-full font-semibold transition"
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
};
