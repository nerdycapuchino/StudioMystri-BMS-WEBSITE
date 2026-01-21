
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Search, Plus, Phone, Mail, MapPin, User, X, Edit2 } from 'lucide-react';
import { Customer } from '../types';

export const Customers: React.FC = () => {
  const { customers, addCustomer, updateCustomer, formatCurrency } = useGlobal();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [form, setForm] = useState<Partial<Customer>>({ name: '', phone: '', email: '', address: '' });

  const filteredCustomers = customers.filter(c => 
     c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.phone.includes(searchQuery)
  );

  const handleSave = () => {
     if (editingCustomer) {
        updateCustomer(editingCustomer.id, form);
        setEditingCustomer(null);
     } else {
        addCustomer({
           id: Math.random().toString(36).substr(2,9),
           name: form.name || 'Unknown',
           phone: form.phone || '',
           email: form.email || '',
           address: form.address || '',
           totalSpend: 0,
           status: 'Active'
        });
     }
     setShowModal(false);
     setForm({ name: '', phone: '', email: '', address: '' });
  };

  const startEdit = (c: Customer) => {
     setEditingCustomer(c);
     setForm(c);
     setShowModal(true);
  };

  return (
    <div className="h-full flex flex-col bg-background-dark text-white">
      <div className="p-8 border-b border-white/5 flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-black tracking-tighter text-white">Customer Database</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Manage profiles & purchase history</p>
         </div>
         <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full shadow-glow active:scale-95 transition-transform flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Profile
         </button>
      </div>

      <div className="p-8 pb-0">
         <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
               value={searchQuery}
               onChange={e => setSearchQuery(e.target.value)}
               placeholder="Search by name or phone..."
               className="w-full bg-surface-dark border border-white/10 rounded-full pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary outline-none text-white placeholder-zinc-600"
            />
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {filteredCustomers.map(customer => (
            <div key={customer.id} className="bg-surface-dark border border-white/5 p-6 rounded-[2rem] hover:border-primary/30 transition-all group relative">
               <button onClick={() => startEdit(customer)} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
               <div className="flex items-center gap-4 mb-6">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-surface-highlight to-black border border-white/10 flex items-center justify-center text-2xl font-black text-zinc-600">
                     {customer.name.charAt(0)}
                  </div>
                  <div>
                     <h3 className="text-lg font-bold text-white leading-tight">{customer.name}</h3>
                     <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">{customer.status || 'Active'}</p>
                  </div>
               </div>
               
               <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                     <Phone className="w-4 h-4 text-zinc-600" /> {customer.phone}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-400">
                     <Mail className="w-4 h-4 text-zinc-600" /> {customer.email}
                  </div>
                  {customer.address && (
                     <div className="flex items-center gap-3 text-sm text-zinc-400">
                        <MapPin className="w-4 h-4 text-zinc-600" /> {customer.address}
                     </div>
                  )}
               </div>

               <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Lifetime Value</span>
                  <span className="text-lg font-mono font-bold text-white">{formatCurrency(customer.totalSpend)}</span>
               </div>
            </div>
         ))}
      </div>

      {showModal && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl">
               <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-white">{editingCustomer ? 'Edit Profile' : 'New Customer'}</h3>
                  <button onClick={() => { setShowModal(false); setEditingCustomer(null); setForm({ name: '', phone: '', email: '', address: '' }); }} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
               </div>
               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] text-zinc-500 font-black uppercase ml-4">Full Name</label>
                     <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter name" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] text-zinc-500 font-black uppercase ml-4">Phone Number</label>
                     <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter phone" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] text-zinc-500 font-black uppercase ml-4">Email Address</label>
                     <input value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter email" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] text-zinc-500 font-black uppercase ml-4">Billing Address</label>
                     <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter address" />
                  </div>
               </div>
               <div className="flex gap-4 mt-8">
                  <button onClick={() => { setShowModal(false); setEditingCustomer(null); }} className="flex-1 py-3 bg-white/5 rounded-full font-bold text-white hover:bg-white/10">Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-3 bg-primary text-black rounded-full font-black uppercase text-xs tracking-widest shadow-glow">Save Profile</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
