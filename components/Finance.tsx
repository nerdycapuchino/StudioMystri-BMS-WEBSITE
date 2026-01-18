import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Edit2, X, History } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Invoice } from '../types';

export const Finance: React.FC = () => {
  const { invoices, addInvoice, updateInvoicePayment, updateInvoice, currency } = useGlobal();
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  
  // New Transaction Form State
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({ 
    client: '', amount: 0, baseAmount: 0, taxAmount: 0, date: '', status: 'Pending', type: 'Income' 
  });

  const currencySymbol = currency === 'INR' ? '₹' : '$';

  // Logic
  const income = invoices.filter(i => i.type === 'Income').reduce((acc, curr) => acc + curr.paidAmount, 0);
  const expenses = invoices.filter(i => i.type === 'Expense').reduce((acc, curr) => acc + curr.paidAmount, 0);
  const receivables = invoices.filter(i => i.type === 'Income').reduce((acc, curr) => acc + (curr.amount - curr.paidAmount), 0);
  const netProfit = income - expenses;

  const handleAmountChange = (val: string) => {
    const amt = parseFloat(val) || 0;
    const isINR = currency === 'INR';
    const taxRate = isINR ? 0.18 : 0; // 18% GST for INR, 0 for USD mock
    const base = amt; 
    const tax = amt * taxRate;
    const total = base + tax;
    
    setNewInvoice({ ...newInvoice, baseAmount: base, taxAmount: tax, amount: total });
  };

  const handleCreate = () => {
    if (newInvoice.client && newInvoice.amount) {
      addInvoice({
        id: `${newInvoice.type === 'Income' ? 'INV' : 'EXP'}-${Math.floor(Math.random() * 1000)}`,
        client: newInvoice.client,
        amount: newInvoice.amount!,
        baseAmount: newInvoice.baseAmount || 0,
        taxAmount: newInvoice.taxAmount || 0,
        paidAmount: newInvoice.status === 'Paid' ? newInvoice.amount! : 0,
        type: newInvoice.type || 'Income',
        date: newInvoice.date || new Date().toLocaleDateString(),
        status: newInvoice.status || 'Pending',
        currency: currency,
        history: []
      });
      setShowModal(false);
      setNewInvoice({ client: '', amount: 0, baseAmount: 0, taxAmount: 0, date: '', status: 'Pending', type: 'Income' });
    }
  };

  const handleAddPayment = () => {
    if (showEditModal && paymentAmount > 0) {
      updateInvoicePayment(showEditModal.id, paymentAmount);
      setShowEditModal(null);
      setPaymentAmount(0);
    }
  };

  const handleStatusChange = (newStatus: any) => {
    if(showEditModal) {
       updateInvoice(showEditModal.id, { status: newStatus });
       setShowEditModal({...showEditModal, status: newStatus});
    }
  };

  const chartData = [
    { name: 'Income', amount: income, fill: '#10b981' },
    { name: 'Expense', amount: expenses, fill: '#ef4444' },
    { name: 'Net', amount: netProfit, fill: '#6366f1' },
  ];

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-slate-800">Finance & Accounts</h2>
         <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 hover:bg-indigo-700"><Plus className="w-4 h-4" /> Add Transaction</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Total Paid Income</p>
            <p className="text-2xl font-bold text-green-600 flex items-center gap-2"><ArrowUpRight className="w-5 h-5"/> {currencySymbol}{income.toLocaleString()}</p>
         </div>
         <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Total Paid Expenses</p>
            <p className="text-2xl font-bold text-red-600 flex items-center gap-2"><ArrowDownRight className="w-5 h-5"/> {currencySymbol}{expenses.toLocaleString()}</p>
         </div>
         <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500 mb-1">Net Profit</p>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-indigo-600' : 'text-orange-600'}`}>{currencySymbol}{netProfit.toLocaleString()}</p>
         </div>
         <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-orange-400">
            <p className="text-sm text-slate-500 mb-1">Pending Receivables</p>
            <p className="text-2xl font-bold text-slate-700">{currencySymbol}{receivables.toLocaleString()}</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 lg:col-span-1">
            <h3 className="font-bold text-slate-800 mb-4">Financial Snapshot</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{left: 10}}>
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" width={60} />
                     <Tooltip cursor={{fill: 'transparent'}} />
                     <Bar dataKey="amount" radius={[0, 4, 4, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden lg:col-span-2 flex flex-col">
            <div className="p-4 border-b border-slate-100">
               <h3 className="font-bold text-slate-800">Recent Transactions</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Entity</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Total (Inc Tax)</th>
                        <th className="px-6 py-3">Paid</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3 text-right">Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     {invoices.map(inv => (
                        <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50">
                           <td className="px-6 py-3 font-mono text-xs text-slate-500">{inv.id}</td>
                           <td className="px-6 py-3 font-medium text-slate-800">{inv.client}</td>
                           <td className="px-6 py-3"><span className={`px-2 py-1 rounded text-xs ${inv.type === 'Income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{inv.type}</span></td>
                           <td className="px-6 py-3 font-bold">{currencySymbol}{inv.amount.toLocaleString()}</td>
                           <td className="px-6 py-3 text-slate-600">{currencySymbol}{inv.paidAmount.toLocaleString()}</td>
                           <td className="px-6 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${inv.status === 'Paid' ? 'bg-green-100 text-green-700' : inv.status === 'Partial' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                 {inv.status}
                              </span>
                           </td>
                           <td className="px-6 py-3 text-right">
                              <button onClick={() => setShowEditModal(inv)} className="text-indigo-600 hover:text-indigo-800 p-1 bg-indigo-50 rounded">
                                 <Edit2 className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* Edit/Payment Modal */}
      {showEditModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-96 rounded-xl p-6 shadow-2xl">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Update Payment</h3>
                  <button onClick={() => setShowEditModal(null)}><X className="w-5 h-5 text-slate-400"/></button>
               </div>
               
               <div className="mb-4">
                  <label className="text-xs text-slate-500">Status</label>
                  <select className="w-full border p-2 rounded" value={showEditModal.status} onChange={(e) => handleStatusChange(e.target.value)}>
                     <option value="Pending">Pending</option>
                     <option value="Partial">Partially Paid</option>
                     <option value="Paid">Paid</option>
                  </select>
               </div>

               <div className="mb-4 bg-slate-50 p-3 rounded text-sm">
                  <p className="flex justify-between mb-1"><span>Base:</span> <span>{currencySymbol}{showEditModal.baseAmount}</span></p>
                  <p className="flex justify-between mb-1"><span>Tax:</span> <span>{currencySymbol}{showEditModal.taxAmount}</span></p>
                  <p className="flex justify-between mb-1 border-t pt-1 font-bold"><span>Total:</span> <strong>{currencySymbol}{showEditModal.amount}</strong></p>
                  <p className="flex justify-between mb-1"><span>Paid:</span> <strong>{currencySymbol}{showEditModal.paidAmount}</strong></p>
                  <p className="flex justify-between text-orange-600 font-bold"><span>Pending:</span> <span>{currencySymbol}{showEditModal.amount - showEditModal.paidAmount}</span></p>
               </div>
               
               {showEditModal.status !== 'Paid' && (
                  <>
                     <label className="block text-sm text-slate-600 mb-1">Add Payment Amount</label>
                     <input type="number" className="w-full border p-2 mb-4 rounded" value={paymentAmount} onChange={e => setPaymentAmount(parseFloat(e.target.value))} />
                     <button onClick={handleAddPayment} className="w-full py-2 bg-indigo-600 text-white rounded font-bold">Record Payment</button>
                  </>
               )}
               
               <div className="mt-4 border-t pt-2">
                  <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1"><History className="w-3 h-3"/> History</p>
                  <div className="max-h-24 overflow-y-auto text-xs space-y-1">
                     {showEditModal.history.map((h, i) => (
                        <div key={i} className="flex justify-between text-slate-600">
                           <span>{h.date}</span>
                           <span>{currencySymbol}{h.amount}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white w-96 rounded-xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold mb-4">New Transaction</h3>
              <div className="flex gap-2 mb-3">
                 <button onClick={() => setNewInvoice({...newInvoice, type: 'Income'})} className={`flex-1 py-2 rounded border ${newInvoice.type === 'Income' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white'}`}>Income</button>
                 <button onClick={() => setNewInvoice({...newInvoice, type: 'Expense'})} className={`flex-1 py-2 rounded border ${newInvoice.type === 'Expense' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white'}`}>Expense</button>
              </div>
              <input className="w-full border p-2 mb-3 rounded" placeholder="Client / Vendor Name" value={newInvoice.client} onChange={e => setNewInvoice({...newInvoice, client: e.target.value})} />
              
              <div className="mb-3">
                 <label className="text-xs text-slate-500">Base Amount (Before Tax)</label>
                 <input className="w-full border p-2 rounded" type="number" placeholder="0.00" value={newInvoice.baseAmount || ''} onChange={e => handleAmountChange(e.target.value)} />
              </div>
              
              <div className="flex gap-2 mb-3 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                 <div className="flex-1">
                    <span className="block text-xs">GST ({currency === 'INR' ? '18%' : '0%'})</span>
                    <span className="font-bold">{currencySymbol}{newInvoice.taxAmount?.toFixed(2)}</span>
                 </div>
                 <div className="flex-1">
                    <span className="block text-xs">Total</span>
                    <span className="font-bold text-indigo-600">{currencySymbol}{newInvoice.amount?.toFixed(2)}</span>
                 </div>
              </div>

              <select className="w-full border p-2 mb-4 rounded" value={newInvoice.status} onChange={e => setNewInvoice({...newInvoice, status: e.target.value as any})}>
                 <option value="Paid">Paid (Full)</option>
                 <option value="Partial">Partially Paid</option>
                 <option value="Pending">Pending</option>
              </select>
              <div className="flex gap-2">
                 <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                 <button onClick={handleCreate} className="flex-1 py-2 bg-indigo-600 text-white rounded">Save</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};