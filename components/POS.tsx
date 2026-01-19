import React, { useState, useRef } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Product, CartItem, Customer } from '../types';

export const POS: React.FC = () => {
  const { 
    addSale, addActivity, isShiftOpen, openingBalance, cashCollected, startShift, updateCashCollected, closeShift, 
    products, addProduct, orders, addOrder, deductStock, addInvoice, currency, formatCurrency, customers, addCustomer
  } = useGlobal();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Items');
  const [localOpeningBalance, setLocalOpeningBalance] = useState('');
  const categories = ['All Items', 'Furniture', 'Lighting', 'Decor', 'Accessories', 'Clearance'];

  // Simplified logic for brevity, focus on UI structure
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All Items' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(i => i.id !== id));

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.10;
  const total = subtotal + tax;

  const handlePay = () => {
     if(cart.length === 0) return;
     addSale(total);
     updateCashCollected(total);
     addActivity(`POS Sale: ${formatCurrency(total)}`, 'sale');
     setCart([]);
     alert('Payment Successful!');
  };

  if (!isShiftOpen) {
    return (
      <div className="h-full flex items-center justify-center bg-background-dark p-4">
        <div className="bg-surface-dark p-8 rounded-2xl shadow-xl w-full max-w-md text-center border border-border-dark">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
            <span className="material-symbols-outlined text-3xl">account_balance_wallet</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Start Shift</h2>
          <p className="text-zinc-400 mb-6">Enter opening cash amount.</p>
          <input type="number" value={localOpeningBalance} onChange={e => setLocalOpeningBalance(e.target.value)} className="w-full p-3 bg-background-dark border border-border-dark rounded-xl mb-4 text-center text-xl font-bold text-white focus:outline-none focus:border-primary" placeholder="0.00" />
          <button onClick={() => startShift(localOpeningBalance)} disabled={!localOpeningBalance} className="w-full py-3 bg-primary text-background-dark rounded-xl font-bold hover:bg-[#2ecc71] transition-colors disabled:opacity-50">Open Register</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background-dark text-white">
      {/* LEFT PANEL: Catalog (70%) */}
      <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark overflow-hidden relative border-r border-border-dark">
        {/* Header inside POS */}
        <div className="flex-none px-6 py-4 flex justify-between items-center bg-background-dark z-20">
           <div className="relative flex-1 max-w-md">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">search</span>
              <input 
                className="w-full bg-surface-dark border border-border-dark rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-primary" 
                placeholder="Search inventory..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
           </div>
           <div className="flex gap-2">
              <button onClick={() => closeShift()} className="px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm font-bold hover:bg-red-500/20 transition-colors">Close Shift</button>
           </div>
        </div>

        {/* Filter Chips */}
        <div className="flex-none px-6 py-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-3 min-w-max">
            {categories.map(cat => (
               <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`group flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full pl-5 pr-5 border transition-all ${selectedCategory === cat ? 'bg-primary border-primary text-[#111714] shadow-lg shadow-primary/20' : 'bg-surface-dark border-border-dark text-zinc-400 hover:border-primary/50 hover:text-white'}`}
               >
                  <span className="text-sm font-bold leading-normal">{cat}</span>
               </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {filteredProducts.map(p => (
               <div key={p.id} onClick={() => addToCart(p)} className="flex flex-col gap-3 p-3 bg-surface-dark rounded-[2rem] border border-border-dark group cursor-pointer hover:border-primary/40 transition-all hover:shadow-xl hover:shadow-black/20">
                  <div className="w-full relative bg-center bg-no-repeat aspect-[4/3] bg-cover rounded-[1.5rem] overflow-hidden" style={{backgroundImage: `url('${p.image}')`}}>
                     <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                        {p.stock} in stock
                     </div>
                  </div>
                  <div className="px-1">
                     <div className="flex justify-between items-start mb-1">
                        <p className="text-white text-lg font-bold leading-tight truncate pr-2">{p.name}</p>
                        <p className="text-primary text-lg font-bold">{formatCurrency(p.price)}</p>
                     </div>
                     <p className="text-[#9eb7a8] text-sm font-light">{p.category}</p>
                  </div>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Checkout Cart (30%) */}
      <aside className="w-[30%] min-w-[360px] h-full glass-panel flex flex-col relative z-10 shadow-2xl bg-[#1a1a1a]">
        {/* Customer Selector */}
        <div className="p-4 flex-none border-b border-border-dark">
          <div className="flex flex-col gap-2 p-3 bg-white/5 rounded-[1.5rem] border border-white/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-gradient-to-br from-bronze to-bronze-dark flex items-center justify-center text-white font-bold">SJ</div>
                <div>
                  <p className="text-white text-sm font-bold">Sarah Jenkins</p>
                  <p className="text-[#9eb7a8] text-xs">Platinum Member</p>
                </div>
              </div>
              <button className="text-primary p-2 hover:bg-primary/10 rounded-full transition-colors">
                <span className="material-symbols-outlined">edit</span>
              </button>
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
           {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/5 transition-colors group">
                 <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-16 shrink-0" style={{backgroundImage: `url('${item.image}')`}}></div>
                 <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                       <p className="text-white text-sm font-semibold truncate pr-2">{item.name}</p>
                       <p className="text-white text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <p className="text-[#9eb7a8] text-xs mb-2">{item.sku}</p>
                    <div className="flex items-center justify-between">
                       <div className="flex items-center bg-border-dark rounded-full h-7 w-fit">
                          <button onClick={(e) => {e.stopPropagation(); updateQuantity(item.id, -1)}} className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"><span className="material-symbols-outlined text-[16px]">remove</span></button>
                          <span className="text-xs font-medium text-white px-1 w-4 text-center">{item.quantity}</span>
                          <button onClick={(e) => {e.stopPropagation(); updateQuantity(item.id, 1)}} className="w-7 h-7 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors"><span className="material-symbols-outlined text-[16px]">add</span></button>
                       </div>
                       <button onClick={(e) => {e.stopPropagation(); removeFromCart(item.id)}} className="text-[#9eb7a8] hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                       </button>
                    </div>
                 </div>
              </div>
           ))}
        </div>

        {/* Footer / Totals */}
        <div className="flex-none p-4 pt-2 bg-gradient-to-t from-black/80 to-transparent">
          <div className="space-y-2 mb-4 px-2">
            <div className="flex justify-between text-sm text-[#9eb7a8]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#9eb7a8]">
              <span>Tax (10%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-white mt-2 pt-2 border-t border-white/10">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 mb-4">
             {['payments', 'credit_card', 'qr_code_2', 'bolt'].map((icon, i) => (
               <button key={i} className="flex flex-col items-center justify-center py-3 rounded-2xl bg-gradient-to-br from-bronze to-bronze-dark border border-white/10 text-white gap-1 hover:from-[#e69d58] hover:to-[#b36b3b] transition-all">
                  <span className="material-symbols-outlined text-[20px]">{icon}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">{['Cash', 'Card', 'UPI', 'Razor'][i]}</span>
               </button>
             ))}
          </div>
          
          <button onClick={handlePay} className="w-full flex items-center justify-between h-14 bg-primary hover:bg-[#2dd16e] text-[#111714] rounded-full px-6 transition-all active:scale-[0.99] shadow-lg shadow-primary/20">
            <span className="text-base font-bold">Charge Customer</span>
            <span className="text-lg font-bold font-mono">{formatCurrency(total)}</span>
          </button>
        </div>
      </aside>
    </div>
  );
};