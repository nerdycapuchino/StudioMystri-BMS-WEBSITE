import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Product, CartItem, Customer } from '../types';

export const POS: React.FC = () => {
  const { 
    addSale, addActivity, isShiftOpen, startShift, closeShift, products, deductStock, formatCurrency, customers, addCustomer
  } = useGlobal();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [localOpeningBalance, setLocalOpeningBalance] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState<Partial<Customer>>({ name: '', phone: '', email: '' });

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + 1 > product.stock) {
         alert(`Stock Limit: Only ${product.stock} units available.`);
         return prev;
      }
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        if (delta > 0 && item.quantity + delta > item.stock) return item;
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal * 1.10;

  const handlePay = () => {
     if(cart.length === 0) return;
     deductStock(cart.map(i => ({ id: i.id, quantity: i.quantity })));
     addSale(total);
     addActivity(`POS Sale Complete: ${formatCurrency(total)}`, 'sale');
     setCart([]); setSelectedCustomer(null); alert('Transaction Successful!');
  };

  if (!isShiftOpen) {
    return (
      <div className="h-full flex items-center justify-center bg-background-dark p-4">
        <div className="bg-surface-dark p-10 rounded-3xl border border-white/5 w-full max-w-md text-center shadow-2xl">
          <div className="size-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary"><span className="material-symbols-outlined text-4xl">payments</span></div>
          <h2 className="text-2xl font-bold text-white mb-2">Open Register</h2>
          <input type="number" value={localOpeningBalance} onChange={e => setLocalOpeningBalance(e.target.value)} className="w-full bg-background-dark border border-white/10 rounded-xl p-4 text-center text-xl font-bold mb-6 focus:border-primary focus:outline-none" placeholder="0.00" />
          <button onClick={() => startShift(localOpeningBalance)} className="w-full py-4 bg-primary text-background-dark rounded-xl font-bold hover:bg-[#2ecc71] transition-all">Open Shift</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-background-dark text-white overflow-hidden">
      <div className="flex-1 flex flex-col border-r border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center gap-4">
          <div className="relative flex-1">
             <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">search</span>
             <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-surface-dark border border-white/10 rounded-full pl-10 pr-4 py-2 focus:ring-1 focus:ring-primary" placeholder="Search inventory..." />
          </div>
          <button onClick={closeShift} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-bold border border-red-500/20">Close Shift</button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {filteredProducts.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock === 0} className="bg-surface-dark p-4 rounded-2xl border border-white/5 hover:border-primary/50 text-left transition-all group">
              <div className="aspect-square bg-zinc-800 rounded-xl mb-4 overflow-hidden"><img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
              <h4 className="font-bold text-sm mb-1 truncate">{p.name}</h4>
              <div className="flex justify-between items-center"><p className="text-primary font-bold">{formatCurrency(p.price)}</p><span className="text-[10px] text-zinc-500 font-bold uppercase">{p.stock} In Stock</span></div>
            </button>
          ))}
        </div>
      </div>
      
      <aside className="w-96 flex flex-col bg-surface-darker shadow-2xl relative">
        <div className="p-6 border-b border-white/5">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/10 relative">
             {selectedCustomer ? (
               <div className="flex justify-between items-center">
                 <div><p className="font-bold text-sm">{selectedCustomer.name}</p><p className="text-xs text-zinc-500">{selectedCustomer.phone}</p></div>
                 <button onClick={() => setSelectedCustomer(null)}><span className="material-symbols-outlined text-zinc-500">close</span></button>
               </div>
             ) : (
               <select onChange={e => { if(e.target.value === 'new') setShowAddCustomer(true); else setSelectedCustomer(customers.find(c => c.id === e.target.value) || null); }} className="w-full bg-transparent text-white border-none focus:ring-0 p-0 cursor-pointer">
                  <option value="" disabled selected>Select Customer</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  <option value="new">+ New Customer</option>
               </select>
             )}
           </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex gap-4 items-center bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="size-12 bg-zinc-800 rounded-lg shrink-0 overflow-hidden"><img src={item.image} className="w-full h-full object-cover" /></div>
              <div className="flex-1"><p className="text-sm font-bold truncate">{item.name}</p><p className="text-xs text-primary font-bold">{formatCurrency(item.price * item.quantity)}</p></div>
              <div className="flex items-center bg-black/40 rounded-lg p-1"><button onClick={() => updateQuantity(item.id, -1)} className="px-2 font-bold">-</button><span className="px-2 text-xs font-bold">{item.quantity}</span><button onClick={() => updateQuantity(item.id, 1)} className="px-2 font-bold">+</button></div>
              <button onClick={() => removeFromCart(item.id)} className="text-zinc-600 hover:text-red-500"><span className="material-symbols-outlined text-sm">delete</span></button>
            </div>
          ))}
        </div>
        <div className="p-6 bg-surface-darker border-t border-white/5 space-y-4">
           <div className="flex justify-between text-zinc-400 text-sm"><span>Tax (10%)</span><span>{formatCurrency(subtotal * 0.10)}</span></div>
           <div className="flex justify-between text-white text-xl font-bold"><span>Total</span><span className="text-primary">{formatCurrency(total)}</span></div>
           <button onClick={handlePay} disabled={cart.length === 0} className="w-full py-4 bg-primary text-background-dark rounded-xl font-bold shadow-glow hover:bg-[#2ecc71] transition-all disabled:opacity-50">Complete Order</button>
        </div>
        {showAddCustomer && (
          <div className="absolute inset-0 z-50 bg-black/90 p-8 flex flex-col justify-center">
             <h3 className="text-xl font-bold mb-6">New Customer</h3>
             <div className="space-y-4 mb-8"><input placeholder="Name" onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" /><input placeholder="Phone" onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3" /></div>
             <div className="flex gap-2"><button onClick={() => setShowAddCustomer(false)} className="flex-1 py-3 bg-white/10 rounded-xl font-bold">Cancel</button><button onClick={() => { addCustomer(newCustomer as Customer); setSelectedCustomer(newCustomer as Customer); setShowAddCustomer(false); }} className="flex-1 py-3 bg-primary text-background-dark rounded-xl font-bold">Save</button></div>
          </div>
        )}
      </aside>
    </div>
  );
};