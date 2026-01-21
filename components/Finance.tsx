
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Invoice } from '../types';
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, Calendar, Edit2, Trash2, CheckCircle, AlertCircle, X, Search } from 'lucide-react';

export const Finance: React.FC = () => {
  const { invoices, formatCurrency, addInvoice, updateInvoicePayment, deleteInvoice, updateInvoice } = useGlobal();
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [payId, setPayId] = useState<string | null>(null);
  const [payAmt, setPayAmt] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [form, setForm] = useState<Partial<Invoice>>({ client: '', amount: 0, type: 'Income', status: 'Pending' });

  // Calculated Stats
  const totalIncome = invoices.filter(i => i.type === 'Income').reduce((a,b) => a + b.amount, 0);
  const totalExpense = invoices.filter(i => i.type === 'Expense').reduce((a,b) => a + b.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const pendingReceivables = invoices.filter(i => i.type === 'Income' && i.status !== 'Paid').reduce((a,b) => a + (b.amount - b.paidAmount), 0);

  const filteredInvoices = invoices.filter(inv => 
    inv.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inv.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    if (editMode && form.id) {
       updateInvoice(form.id, form);
    } else {
       addInvoice({ 
         ...form, 
         id: `INV-${Math.floor(Math.random()*9000)+1000}`, 
         date: new Date().toLocaleDateString(), 
         paidAmount: 0, 
         history: [] 
       } as Invoice);
    }
    setShowModal(false); 
    setForm({ client: '', amount: 0, type: 'Income', status: 'Pending' });
    setEditMode(false);
  };

  const openEdit = (invoice: Invoice) => {
     setForm(invoice);
     setEditMode(true);
     setShowModal(true);
  };

  const handlePayment = () => { 
    if(payId) { 
       updateInvoicePayment(payId, payAmt); 
       setPayId(null); 
       setPayAmt(0); 
    } 
  };

  return (
    <div className="h-full flex flex-col bg-background-dark text-white font-display overflow-hidden">
      {/* Header Area */}
      <div className="p-8 pb-0 shrink-0">
         <div className="flex justify-between items-end mb-8">
            <div>
               <h2 className="text-4xl font-black tracking-tighter text-white">Financial Hub</h2>
               <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Cashflow & Ledger Management</p>
            </div>
            <button 
               onClick={() => { setEditMode(false); setForm({ client: '', amount: 0, type: 'Income', status: 'Pending' }); setShowModal(true); }} 
               className="px-8 py-3 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full shadow-glow active:scale-95 transition-transform flex items-center gap-2"
            >
               <Plus className="w-4 h-4" /> New Entry
            </button>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:scale-110 transition-transform"><Wallet className="w-8 h-8 text-zinc-600" /></div>
               <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Net Liquid Balance</p>
               <h3 className="text-2xl font-black text-white">{formatCurrency(netBalance)}</h3>
            </div>
            <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 group">
               <div className="flex items-center gap-2 mb-1">
                  <div className="bg-primary/20 p-1 rounded-full"><ArrowUpRight className="w-3 h-3 text-primary" /></div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Total Income</p>
               </div>
               <h3 className="text-2xl font-black text-primary">{formatCurrency(totalIncome)}</h3>
            </div>
            <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 group">
               <div className="flex items-center gap-2 mb-1">
                  <div className="bg-red-500/20 p-1 rounded-full"><ArrowDownLeft className="w-3 h-3 text-red-500" /></div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Total Expenses</p>
               </div>
               <h3 className="text-2xl font-black text-red-400">{formatCurrency(totalExpense)}</h3>
            </div>
             <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 group">
               <div className="flex items-center gap-2 mb-1">
                  <div className="bg-amber-500/20 p-1 rounded-full"><AlertCircle className="w-3 h-3 text-amber-500" /></div>
                  <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Pending Receivables</p>
               </div>
               <h3 className="text-2xl font-black text-amber-500">{formatCurrency(pendingReceivables)}</h3>
            </div>
         </div>

         {/* Filter Bar */}
         <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1 max-w-sm">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
               <input 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search transactions..." 
                  className="w-full bg-surface-dark border border-white/5 rounded-full pl-10 pr-4 py-2.5 text-sm focus:ring-1 focus:ring-primary outline-none"
               />
            </div>
         </div>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
         <div className="bg-surface-dark border border-white/5 rounded-[2.5rem] overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-surface-highlight border-b border-white/5">
                  <tr>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest">Date / ID</th>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest">Entity / Client</th>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-right">Amount</th>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-right">Paid</th>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-center">Status</th>
                     <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredInvoices.map(inv => (
                     <tr key={inv.id} className="hover:bg-white/5 transition-colors group">
                        <td className="p-6">
                           <div className="flex items-center gap-3">
                              <div className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500">
                                 <Calendar className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="font-bold text-white text-sm">{inv.date}</p>
                                 <p className="text-[10px] text-zinc-500 font-mono tracking-wider">{inv.id}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-6">
                           <p className="font-bold text-white">{inv.client}</p>
                           <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${inv.type === 'Income' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                              {inv.type}
                           </span>
                        </td>
                        <td className="p-6 text-right">
                           <p className="font-mono font-bold text-white text-lg">{formatCurrency(inv.amount)}</p>
                        </td>
                        <td className="p-6 text-right">
                           <p className="font-mono font-bold text-zinc-400">{formatCurrency(inv.paidAmount)}</p>
                        </td>
                        <td className="p-6 text-center">
                           <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                              inv.status === 'Paid' ? 'bg-primary/10 text-primary border-primary/20' : 
                              inv.status === 'Overdue' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              'bg-amber-500/10 text-amber-500 border-amber-500/20'
                           }`}>
                              {inv.status}
                           </span>
                        </td>
                        <td className="p-6 text-right">
                           <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                              {inv.status !== 'Paid' && (
                                 <button onClick={() => setPayId(inv.id)} className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-black rounded-lg transition-colors" title="Record Payment">
                                    <CheckCircle className="w-4 h-4" />
                                 </button>
                              )}
                              <button onClick={() => openEdit(inv)} className="p-2 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white rounded-lg transition-colors" title="Edit">
                                 <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => deleteInvoice(inv.id)} className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors" title="Delete">
                                 <Trash2 className="w-4 h-4" />
                              </button>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl space-y-8">
               <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{editMode ? 'Edit Transaction' : 'New Transaction'}</h3>
                  <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
               </div>
               
               <div className="bg-background-dark p-1 rounded-2xl border border-white/5 flex gap-1">
                  <button onClick={() => setForm({...form, type: 'Income'})} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${form.type === 'Income' ? 'bg-primary text-black' : 'text-zinc-500'}`}>Income</button>
                  <button onClick={() => setForm({...form, type: 'Expense'})} className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${form.type === 'Expense' ? 'bg-red-500 text-white' : 'text-zinc-500'}`}>Expense</button>
               </div>

               <div className="space-y-4">
                  <div className="space-y-1">
                     <label className="text-[10px] text-zinc-500 font-black uppercase ml-4">Entity / Client Name</label>
                     <input value={form.client} onChange={e => setForm({...form, client: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter name" />
                  </div>
                  <div className="space-y-1">
                     <label className="text-[10px] text-zinc-500 font-black uppercase ml-4">Total Amount</label>
                     <input type="number" value={form.amount || ''} onChange={e => setForm({...form, amount: Number(e.target.value)})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-primary" placeholder="0.00" />
                  </div>
                   <div className="space-y-1">
                     <label className="text-[10px] text-zinc-500 font-black uppercase ml-4">Status</label>
                     <div className="relative">
                        <select className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                           <option value="Pending">Pending</option>
                           <option value="Partial">Partial</option>
                           <option value="Paid">Paid</option>
                           <option value="Overdue">Overdue</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">expand_more</span>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-white/5 rounded-full font-bold text-white border border-white/5 hover:bg-white/10">Cancel</button>
                  <button onClick={handleSave} className="flex-1 py-4 bg-primary text-black rounded-full font-black uppercase text-xs tracking-widest shadow-glow">{editMode ? 'Update Entry' : 'Create Entry'}</button>
               </div>
            </div>
         </div>
      )}

      {/* Payment Modal */}
      {payId && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl space-y-6 text-center">
               <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary mx-auto border border-primary/20 shadow-glow mb-4">
                  <Wallet className="w-8 h-8" />
               </div>
               <h3 className="text-2xl font-black text-white">Record Payment</h3>
               <p className="text-zinc-400 text-sm">Enter the amount received/paid against <span className="text-white font-mono">{payId}</span></p>
               
               <input 
                  type="number" 
                  autoFocus
                  onChange={e => setPayAmt(Number(e.target.value))} 
                  placeholder="0.00" 
                  className="w-full bg-background-dark border border-white/10 rounded-2xl p-6 text-3xl font-black text-primary text-center focus:outline-none focus:border-primary" 
               />
               
               <div className="flex gap-4 pt-4">
                  <button onClick={() => setPayId(null)} className="flex-1 py-4 bg-white/5 rounded-full font-bold text-white border border-white/5 hover:bg-white/10">Cancel</button>
                  <button onClick={handlePayment} className="flex-1 py-4 bg-primary text-black rounded-full font-black uppercase text-xs tracking-widest shadow-glow">Confirm</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
