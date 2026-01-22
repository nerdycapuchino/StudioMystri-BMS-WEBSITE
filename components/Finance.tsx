
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Invoice } from '../types';
import { Plus, Wallet, X, Trash2, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Printer } from 'lucide-react';

export const Finance: React.FC = () => {
  const { invoices, formatCurrency, addInvoice, updateInvoicePayment, deleteInvoice } = useGlobal();
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  const [payId, setPayId] = useState<string | null>(null);
  const [payAmt, setPayAmt] = useState<string>(''); 
  const [searchQuery, setSearchQuery] = useState('');
  
  // Robust Manual Invoice Generator State
  const [invGen, setInvGen] = useState({
      clientName: '',
      clientAddress: '',
      clientGst: '',
      invoiceDate: new Date().toISOString().split('T')[0],
      items: [] as { desc: string; qty: number; rate: number }[],
      paymentMode: 'Bank Transfer',
      // Extra Details
      buyerOrderNo: '',
      dispatchDocNo: '',
      dispatchThrough: '',
      destination: '',
      termsOfDelivery: '',
      referenceNo: '',
      referenceDate: ''
  });

  const [newItem, setNewItem] = useState({ desc: '', qty: 1, rate: 0 });

  const filteredInvoices = invoices.filter(inv => 
    inv.client.toLowerCase().includes(searchQuery.toLowerCase()) || 
    inv.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Metrics
  const incomePaid = invoices.filter(i => i.type === 'Income').reduce((acc, i) => acc + i.paidAmount, 0);
  const expensePaid = invoices.filter(i => i.type === 'Expense').reduce((acc, i) => acc + i.paidAmount, 0);
  const profit = incomePaid - expensePaid;

  const pendingReceivables = invoices.filter(i => i.type === 'Income').reduce((acc, i) => acc + (i.amount - i.paidAmount), 0);

  const addItemToGen = () => {
      if(newItem.desc && newItem.rate > 0) {
          setInvGen(prev => ({ ...prev, items: [...prev.items, newItem] }));
          setNewItem({ desc: '', qty: 1, rate: 0 });
      }
  };

  const removeItemFromGen = (idx: number) => {
      setInvGen(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  };

  const saveGeneratedInvoice = () => {
      if(!invGen.clientName || !invGen.items.length) return;
      
      const subtotal = invGen.items.reduce((acc, item) => acc + (item.qty * item.rate), 0);
      const tax = subtotal * 0.18;
      const total = subtotal + tax;
      
      addInvoice({
          id: `MAN-${Math.floor(Math.random()*10000)}`,
          client: invGen.clientName,
          amount: total,
          baseAmount: subtotal,
          taxAmount: tax,
          taxRate: 18,
          paidAmount: 0,
          type: 'Income',
          status: 'Pending',
          date: new Date(invGen.invoiceDate).toLocaleDateString('en-GB'),
          currency: 'INR',
          history: [],
          items: invGen.items.map(i => ({ desc: i.desc, qty: i.qty, rate: i.rate, total: i.qty * i.rate })),
          gstNumber: invGen.clientGst,
          buyerAddress: invGen.clientAddress,
          ...invGen
      } as Invoice);
      
      setShowInvoiceGenerator(false);
      setInvGen({ 
          clientName: '', clientAddress: '', clientGst: '', invoiceDate: new Date().toISOString().split('T')[0], items: [], paymentMode: 'Bank Transfer',
          buyerOrderNo: '', dispatchDocNo: '', dispatchThrough: '', destination: '', termsOfDelivery: '', referenceNo: '', referenceDate: ''
      });
  };

  return (
    <div className="h-full flex flex-col bg-background-dark text-white font-display overflow-hidden p-6 md:p-8">
      <div className="flex justify-between items-end mb-8 shrink-0">
         <div>
            <h2 className="text-3xl font-black tracking-tighter text-white">Financial Hub</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Cashflow & Ledger Management</p>
         </div>
         <button 
            onClick={() => setShowInvoiceGenerator(true)} 
            className="px-6 py-3 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full shadow-glow active:scale-95 transition-transform flex items-center gap-2"
         >
            <Plus className="w-4 h-4" /> Invoice Generator
         </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
            <Wallet className="absolute top-4 right-4 w-8 h-8 text-zinc-600 opacity-50" />
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Net Balance</p>
            <h3 className="text-2xl font-black text-white">{formatCurrency(profit)}</h3>
         </div>
         <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
            <TrendingUp className="absolute top-4 right-4 w-8 h-8 text-green-500/50" />
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Total Income</p>
            <h3 className="text-2xl font-black text-green-400">{formatCurrency(incomePaid)}</h3>
         </div>
         <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
            <TrendingDown className="absolute top-4 right-4 w-8 h-8 text-red-500/50" />
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Total Expenses</p>
            <h3 className="text-2xl font-black text-red-400">{formatCurrency(expensePaid)}</h3>
         </div>
         <div className="bg-surface-dark p-6 rounded-[2rem] border border-white/5 relative overflow-hidden">
            <AlertCircle className="absolute top-4 right-4 w-8 h-8 text-amber-500/50" />
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-1">Receivables</p>
            <h3 className="text-2xl font-black text-amber-400">{formatCurrency(pendingReceivables)}</h3>
         </div>
      </div>

      {/* Transactions Table */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-dark border border-white/5 rounded-[2rem]">
         <table className="w-full text-left">
            <thead className="bg-surface-highlight border-b border-white/5">
               <tr>
                  <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest">Details</th>
                  <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-right">Amount</th>
                  <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-right">Paid</th>
                  <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-center">Status</th>
                  <th className="p-6 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-right">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-white/5 transition-colors cursor-pointer">
                     <td className="p-6">
                        <div className="font-bold text-white">{inv.client}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{inv.id} • {inv.date}</div>
                     </td>
                     <td className="p-6 text-right font-mono font-bold text-white">{formatCurrency(inv.amount)}</td>
                     <td className="p-6 text-right font-mono font-bold text-primary">{formatCurrency(inv.paidAmount)}</td>
                     <td className="p-6 text-center">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${inv.status === 'Paid' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>{inv.status}</span>
                     </td>
                     <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                            <button onClick={(e) => {e.stopPropagation(); setPayId(inv.id);}} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary hover:text-black transition-colors"><CheckCircle className="w-4 h-4"/></button>
                            <button onClick={(e) => {e.stopPropagation(); deleteInvoice(inv.id);}} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Manual Invoice Generator Modal */}
      {showInvoiceGenerator && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
              <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] w-full max-w-4xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                  <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                      <h3 className="text-2xl font-black text-white">Manual Invoice Generator</h3>
                      <button onClick={() => setShowInvoiceGenerator(false)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                      {/* Client Details Section */}
                      <div className="space-y-4">
                          <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-white/5 pb-2">Parties & Dates</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Client / Company Name</label>
                                  <input value={invGen.clientName} onChange={e => setInvGen({...invGen, clientName: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">GSTIN (Optional)</label>
                                  <input value={invGen.clientGst} onChange={e => setInvGen({...invGen, clientGst: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" />
                              </div>
                              <div className="space-y-1 md:col-span-2">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Billing Address</label>
                                  <input value={invGen.clientAddress} onChange={e => setInvGen({...invGen, clientAddress: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" />
                              </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Invoice Date</label>
                                  <input type="date" value={invGen.invoiceDate} onChange={e => setInvGen({...invGen, invoiceDate: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" />
                              </div>
                              <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Payment Terms</label>
                                  <input value={invGen.paymentMode} onChange={e => setInvGen({...invGen, paymentMode: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" />
                              </div>
                          </div>
                      </div>

                      {/* Extra Invoice Details */}
                      <div className="space-y-4">
                          <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-white/5 pb-2">Dispatch & Delivery</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <input value={invGen.buyerOrderNo} onChange={e => setInvGen({...invGen, buyerOrderNo: e.target.value})} placeholder="Buyer Order No." className="bg-background-dark border border-white/10 rounded-xl p-3 text-white text-sm" />
                              <input value={invGen.dispatchDocNo} onChange={e => setInvGen({...invGen, dispatchDocNo: e.target.value})} placeholder="Dispatch Doc No." className="bg-background-dark border border-white/10 rounded-xl p-3 text-white text-sm" />
                              <input value={invGen.dispatchThrough} onChange={e => setInvGen({...invGen, dispatchThrough: e.target.value})} placeholder="Dispatch Through" className="bg-background-dark border border-white/10 rounded-xl p-3 text-white text-sm" />
                              <input value={invGen.destination} onChange={e => setInvGen({...invGen, destination: e.target.value})} placeholder="Destination" className="bg-background-dark border border-white/10 rounded-xl p-3 text-white text-sm" />
                              <input value={invGen.termsOfDelivery} onChange={e => setInvGen({...invGen, termsOfDelivery: e.target.value})} placeholder="Terms of Delivery" className="bg-background-dark border border-white/10 rounded-xl p-3 text-white text-sm" />
                          </div>
                      </div>

                      {/* Line Items Section */}
                      <div className="space-y-4">
                          <h4 className="text-xs font-black text-primary uppercase tracking-widest border-b border-white/5 pb-2">Line Items</h4>
                          
                          {/* Item Input */}
                          <div className="grid grid-cols-12 gap-2 mb-4 bg-white/5 p-4 rounded-xl">
                              <div className="col-span-6">
                                  <input value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} placeholder="Description" className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white" />
                              </div>
                              <div className="col-span-2">
                                  <input type="number" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: Number(e.target.value)})} placeholder="Qty" className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white" />
                              </div>
                              <div className="col-span-3">
                                  <input type="number" value={newItem.rate} onChange={e => setNewItem({...newItem, rate: Number(e.target.value)})} placeholder="Rate" className="w-full bg-background-dark border border-white/10 rounded-lg p-2 text-sm text-white" />
                              </div>
                              <div className="col-span-1">
                                  <button onClick={addItemToGen} className="w-full h-full bg-primary text-black rounded-lg flex items-center justify-center"><Plus className="w-4 h-4"/></button>
                              </div>
                          </div>

                          {/* Items List */}
                          <div className="space-y-2">
                              {invGen.items.length === 0 && <p className="text-center text-zinc-600 text-xs italic py-4">No items added.</p>}
                              {invGen.items.map((item, idx) => (
                                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-black/20 p-3 rounded-lg border border-white/5">
                                      <div className="col-span-6 text-sm text-white font-medium">{item.desc}</div>
                                      <div className="col-span-2 text-sm text-zinc-400 text-center">{item.qty}</div>
                                      <div className="col-span-3 text-sm text-zinc-400 text-right font-mono">{formatCurrency(item.rate)}</div>
                                      <div className="col-span-1 text-center">
                                          <button onClick={() => removeItemFromGen(idx)} className="text-red-500 hover:text-white transition-colors"><Trash2 className="w-4 h-4"/></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          
                          {/* Totals Preview */}
                          {invGen.items.length > 0 && (
                             <div className="flex justify-end pt-4 border-t border-white/5">
                                 <div className="w-64 space-y-2">
                                     <div className="flex justify-between text-xs text-zinc-400">
                                         <span>Subtotal</span>
                                         <span>{formatCurrency(invGen.items.reduce((s, i) => s + (i.qty * i.rate), 0))}</span>
                                     </div>
                                     <div className="flex justify-between text-xs text-zinc-400">
                                         <span>GST (18%)</span>
                                         <span>{formatCurrency(invGen.items.reduce((s, i) => s + (i.qty * i.rate), 0) * 0.18)}</span>
                                     </div>
                                     <div className="flex justify-between text-lg font-bold text-white border-t border-white/10 pt-2">
                                         <span>Total</span>
                                         <span className="text-primary">{formatCurrency(invGen.items.reduce((s, i) => s + (i.qty * i.rate), 0) * 1.18)}</span>
                                     </div>
                                 </div>
                             </div>
                          )}
                      </div>
                  </div>

                  <div className="p-6 border-t border-white/5 shrink-0">
                      <button onClick={saveGeneratedInvoice} className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-glow">Generate & Save Invoice</button>
                  </div>
              </div>
          </div>
      )}

      {/* Partial Payment Modal */}
      {payId && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-10 w-full max-w-md shadow-2xl space-y-6 text-center">
               <h3 className="text-2xl font-black text-white">Record Payment</h3>
               <p className="text-zinc-400 text-sm">Enter amount received from client.</p>
               <input 
                  type="number" 
                  autoFocus
                  value={payAmt}
                  onChange={e => setPayAmt(e.target.value)} 
                  placeholder="0.00" 
                  className="w-full bg-background-dark border border-white/10 rounded-2xl p-6 text-3xl font-black text-primary text-center focus:outline-none focus:border-primary" 
               />
               <div className="flex gap-4 pt-4">
                  <button onClick={() => setPayId(null)} className="flex-1 py-4 bg-white/5 rounded-full font-bold text-white">Cancel</button>
                  <button onClick={() => { if(payId && payAmt) { updateInvoicePayment(payId, Number(payAmt)); setPayId(null); setPayAmt(''); } }} className="flex-1 py-4 bg-primary text-black rounded-full font-black uppercase text-xs tracking-widest shadow-glow">Confirm</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
