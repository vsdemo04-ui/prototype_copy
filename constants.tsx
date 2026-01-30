
import React from 'react';
import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Gulab Jamun Fusion Cake',
    description: 'A decadent cardamom-infused sponge layered with real gulab jamun chunks and rose-petal cream.',
    price: 850.00,
    image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&q=80&w=800',
    category: 'Cakes'
  },
  {
    id: 'p2',
    name: 'Rasgulla',
    description: 'Soft, spongy, and juicy cottage cheese balls soaked in sugar syrup. A Bengali classic!',
    price: 1200.00,
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&q=80&w=800',
    category: 'Sweets'
  },
  {
    id: 'p3',
    name: 'Jalebi',
    description: 'Crispy, syrupy spirals of deep-fried dough, a festive favorite across India.',
    price: 650.00,
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=800',
    category: 'Sweets'
  },
  {
    id: 'p4',
    name: 'Masala Chai Cookies',
    description: 'Crispy butter cookies infused with hand-ground chai spices and ginger.',
    price: 350.00,
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=800',
    category: 'Cookies'
  }
];

export const ICONS = {
  Cart: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
  User: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
  Shop: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H22m-12.939-9.21a.75.75 0 00-1.12 0l-7.499 7.499a.75.75 0 001.06 1.06l1.258-1.259v5.223a.75.75 0 00.75.75h3a.75.75 0 00.75-.75v-5.223a.75.75 0 00-.44-.682l-2.62-2.63L9 11.75l2.62 2.63c.123.123.284.184.44.184h3.061c.156 0 .317-.061.44-.184l2.62-2.63 2.62 2.63a.75.75 0 001.06-1.06l-7.499-7.499z" /></svg>,
  Admin: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" /></svg>,
  Chat: () => <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.023c.09-.457.133-.923.133-1.393C6.03 13.556 10.03 9.875 15 9.875c4.97 0 9 3.681 9 8.125z" /></svg>,
  WhatsApp: () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="text-green-500"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.313 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.44-9.889 9.886-.001 1.93.524 3.767 1.542 5.31l-.982 3.587 3.693-.969zm11.367-7.38c-.313-.158-1.853-.914-2.139-1.02-.285-.106-.492-.158-.698.158-.207.317-.799 1.005-.98 1.217-.181.212-.361.238-.675.08-.313-.158-1.324-.488-2.522-1.556-.931-.83-1.559-1.855-1.741-2.172-.181-.317-.019-.489.138-.646.141-.141.313-.365.469-.547.156-.183.208-.313.313-.52.105-.208.052-.391-.026-.548-.078-.158-.698-1.684-.957-2.308-.252-.607-.508-.524-.698-.534-.18-.01-.387-.011-.594-.011-.207 0-.543.078-.827.391-.285.313-1.085 1.06-1.085 2.585 0 1.526 1.111 2.999 1.266 3.21.155.212 2.186 3.338 5.297 4.682.74.32 1.317.51 1.767.653.743.236 1.419.203 1.953.123.595-.089 1.853-.758 2.113-1.455.26-.698.26-1.298.182-1.425-.078-.127-.285-.204-.598-.362z"/></svg>,
};
