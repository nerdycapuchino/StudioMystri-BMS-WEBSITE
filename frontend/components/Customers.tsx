
import React, { useState } from 'react';
import { useCustomers, useCreateCustomer, useUpdateCustomer } from '../hooks/useCustomers';
import { Search, Plus, Mail, Edit2, ShoppingBag, X } from 'lucide-react';
import { Customer } from '../types';
import { TableSkeleton, InlineError } from './ui/Skeleton';

export const Customers: React.FC = () => {
   const { data: custData, isLoading, isError, error, refetch } = useCustomers();
   const createCustomer = useCreateCustomer();
   const updateCustomerMut = useUpdateCustomer();
   const customers: Customer[] = Array.isArray(custData?.data || custData) ? (custData?.data || custData) : [];
   const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
   const [searchQuery, setSearchQuery] = useState('');
   const [showModal, setShowModal] = useState(false);
   const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
   const [viewHistoryCustomer, setViewHistoryCustomer] = useState<Customer | null>(null);
   const [form, setForm] = useState<Partial<Customer>>({ name: '', phone: '', email: '', address: '', gstNumber: '' });

   const filteredCustomers = customers.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
   );

   const handleSave = () => {
      if (editingCustomer) {
         updateCustomerMut.mutate({ id: editingCustomer.id, data: form }, {
            onSuccess: () => { setEditingCustomer(null); setShowModal(false); setForm({ name: '', phone: '', email: '', address: '', gstNumber: '' }); }
         });
      } else {
         createCustomer.mutate({
            name: form.name || 'Unknown',
            phone: form.phone || '',
            email: form.email || '',
            address: form.address || '',
            gstNumber: form.gstNumber || '',
            totalSpend: 0,
            status: 'Active',
            history: []
         } as any, {
            onSuccess: () => { setShowModal(false); setForm({ name: '', phone: '', email: '', address: '', gstNumber: '' }); }
         });
      }
   };

   const startEdit = (c: Customer) => {
      setEditingCustomer(c);
      setForm(c);
      setShowModal(true);
   };
   if (isLoading) return <div className="h-full p-6"><TableSkeleton /></div>;
   if (isError) return <div className="h-full p-6"><InlineError message={(error as Error)?.message || 'Failed to load'} onRetry={refetch} /></div>;

   return (
      <div className="h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">
         <div className="p-4 border-b border-slate-200/60 flex justify-between items-center bg-slate-50/80">
            <div>
               <h2 className="text-xl font-black tracking-tighter text-slate-800">Customers</h2>
               <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest">Database</p>
            </div>
            <div className="flex gap-4">
               <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     placeholder="Search..."
                     className="w-full bg-white/80 backdrop-blur-sm border border-slate-200 rounded-full pl-9 pr-4 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none text-slate-800 placeholder-zinc-600"
                  />
               </div>
               <button onClick={() => setShowModal(true)} className="px-4 py-1.5 bg-primary text-black font-black text-[10px] uppercase tracking-widest rounded-full shadow-glow active:scale-95 transition-transform flex items-center gap-2">
                  <Plus className="w-3 h-3" /> Add
               </button>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
               {filteredCustomers.map(customer => (
                  <div key={customer.id} onClick={() => setViewHistoryCustomer(customer)} className="bg-white/80 backdrop-blur-sm border border-slate-200/60 p-3 rounded-xl hover:border-primary/30 transition-all group relative cursor-pointer flex flex-col h-full">
                     <button onClick={(e) => { e.stopPropagation(); startEdit(customer); }} className="absolute top-2 right-2 p-1 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Edit2 className="w-3 h-3" /></button>

                     <div className="flex items-center gap-3 mb-2">
                        <div className="size-8 rounded-lg bg-gradient-to-br from-surface-highlight to-black border border-slate-200 flex items-center justify-center text-xs font-black text-slate-500">
                           {customer.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                           <h3 className="text-xs font-bold text-slate-800 truncate">{customer.name}</h3>
                           <p className="text-[10px] text-slate-500 truncate">{customer.phone}</p>
                        </div>
                     </div>

                     <div className="mt-auto pt-2 border-t border-slate-200/60 flex justify-between items-center">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wide">Total Spend</span>
                        <span className="text-xs font-mono font-bold text-primary">{formatCurrency(customer.totalSpend)}</span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Add/Edit Modal */}
         {showModal && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
               <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-[2.5rem] w-full max-w-lg p-8 shadow-xl shadow-slate-200/50">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black text-slate-800">{editingCustomer ? 'Edit Profile' : 'New Customer'}</h3>
                     <button onClick={() => { setShowModal(false); setEditingCustomer(null); setForm({ name: '', phone: '', email: '', address: '', gstNumber: '' }); }} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-4">
                     <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-full px-6 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Full Name" />
                     <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-full px-6 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Phone Number" />
                     <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-full px-6 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Email Address" />
                     <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-full px-6 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Billing Address" />
                     <input value={form.gstNumber} onChange={e => setForm({ ...form, gstNumber: e.target.value })} className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-full px-6 py-3 text-slate-800 focus:outline-none focus:ring-1 focus:ring-primary" placeholder="GST Number" />
                  </div>
                  <div className="flex gap-4 mt-8">
                     <button onClick={() => { setShowModal(false); setEditingCustomer(null); }} className="flex-1 py-3 bg-slate-50 rounded-full font-bold text-slate-800 hover:bg-slate-100">Cancel</button>
                     <button onClick={handleSave} className="flex-1 py-3 bg-primary text-black rounded-full font-black uppercase text-xs tracking-widest shadow-glow">Save Profile</button>
                  </div>
               </div>
            </div>
         )}

         {/* History Modal */}
         {viewHistoryCustomer && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
               <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-[2.5rem] w-full max-w-2xl p-8 shadow-xl shadow-slate-200/50 h-[80vh] flex flex-col">
                  <div className="flex justify-between items-start mb-6 shrink-0">
                     <div>
                        <h3 className="text-2xl font-black text-slate-800">{viewHistoryCustomer.name}</h3>
                        <p className="text-slate-500 text-sm">Purchase History</p>
                     </div>
                     <button onClick={() => setViewHistoryCustomer(null)} className="text-slate-500 hover:text-white"><X className="w-6 h-6" /></button>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                     {viewHistoryCustomer.history && viewHistoryCustomer.history.length > 0 ? (
                        viewHistoryCustomer.history.map((h, i) => (
                           <div key={i} className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                              <div className="flex justify-between items-center mb-2">
                                 <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 font-mono">{h.id}</span>
                                 </div>
                                 <span className="text-sm font-bold text-slate-800">{h.date}</span>
                              </div>
                              <div className="mb-2">
                                 <div className="flex flex-wrap gap-2">
                                    {h.items.map((item, idx) => (
                                       <span key={idx} className="text-xs bg-black/20 px-2 py-1 rounded text-slate-600">{item}</span>
                                    ))}
                                 </div>
                              </div>
                              <div className="text-right border-t border-slate-200/60 pt-2 mt-2">
                                 <span className="text-sm font-bold text-primary">{formatCurrency(h.total)}</span>
                              </div>
                           </div>
                        ))
                     ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-50">
                           <ShoppingBag className="w-12 h-12 mb-2" />
                           <p className="text-sm">No purchase history available.</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
