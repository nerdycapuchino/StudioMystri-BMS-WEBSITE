import React from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Invoice } from '../types';

export const Finance: React.FC = () => {
  const { invoices, formatCurrency } = useGlobal();
  
  const income = invoices.filter(i => i.type === 'Income').reduce((acc, curr) => acc + curr.paidAmount, 0);
  const expenses = invoices.filter(i => i.type === 'Expense').reduce((acc, curr) => acc + curr.paidAmount, 0);
  const netProfit = income - expenses;

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark text-white">
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col gap-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-light text-white tracking-tight">Finance Snapshot</h2>
              <p className="text-text-muted mt-1">Profit & Loss Ledger</p>
            </div>
            <div className="flex items-center gap-3">
               <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-surface-dark rounded-full border border-border-dark text-text-muted hover:text-white transition-colors text-sm">
                  <span className="material-symbols-outlined" style={{fontSize: '18px'}}>calendar_today</span>
                  <span>This Quarter</span>
               </button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="group relative overflow-hidden rounded-xl p-6 bg-surface-dark border border-border-dark hover:border-primary/30 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                <span className="material-symbols-outlined text-primary/20 group-hover:text-primary/40 transition-colors" style={{fontSize: '48px'}}>trending_up</span>
              </div>
              <p className="text-text-muted text-sm font-medium uppercase tracking-wider">Total Revenue</p>
              <div className="mt-2 flex items-baseline gap-3">
                <h3 className="text-3xl font-bold text-white tabular-nums tracking-tight">{formatCurrency(income)}</h3>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl p-6 bg-surface-dark border border-border-dark hover:border-white/20 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                <span className="material-symbols-outlined text-white/10 group-hover:text-white/20 transition-colors" style={{fontSize: '48px'}}>trending_down</span>
              </div>
              <p className="text-text-muted text-sm font-medium uppercase tracking-wider">Total Expenses</p>
              <div className="mt-2 flex items-baseline gap-3">
                <h3 className="text-3xl font-bold text-white tabular-nums tracking-tight">{formatCurrency(expenses)}</h3>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-xl p-6 bg-gradient-to-br from-[#2a1c12] to-background-dark border border-bronze/20 hover:border-bronze/50 transition-all">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-bronze/10 rounded-full blur-2xl group-hover:bg-bronze/20 transition-all"></div>
              <div className="absolute top-0 right-0 p-4 opacity-80">
                <span className="material-symbols-outlined text-bronze/30 group-hover:text-bronze/50 transition-colors" style={{fontSize: '48px'}}>diamond</span>
              </div>
              <p className="text-bronze text-sm font-medium uppercase tracking-wider">Net Profit</p>
              <div className="mt-2 flex items-baseline gap-3">
                <h3 className="text-3xl font-bold text-bronze-light tabular-nums tracking-tight">{formatCurrency(netProfit)}</h3>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between p-1">
                <h3 className="text-lg font-bold text-white">Transaction Ledger</h3>
                <div className="flex gap-2">
                   <button className="p-2 rounded-full text-text-muted hover:text-white hover:bg-white/10" title="Export"><span className="material-symbols-outlined">download</span></button>
                </div>
             </div>
             
             <div className="w-full overflow-hidden rounded-xl border border-border-dark bg-surface-dark/30 backdrop-blur-sm">
                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-border-dark bg-surface-dark">
                            <th className="py-4 px-6 text-xs font-medium uppercase tracking-wider text-text-muted w-32">Date</th>
                            <th className="py-4 px-6 text-xs font-medium uppercase tracking-wider text-text-muted w-32">ID</th>
                            <th className="py-4 px-6 text-xs font-medium uppercase tracking-wider text-text-muted w-40">Category</th>
                            <th className="py-4 px-6 text-xs font-medium uppercase tracking-wider text-text-muted">Entity / Client</th>
                            <th className="py-4 px-6 text-xs font-medium uppercase tracking-wider text-right text-text-muted w-32">Amount</th>
                            <th className="py-4 px-6 text-xs font-medium uppercase tracking-wider text-right text-text-muted w-32">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-border-dark/50 text-sm">
                         {invoices.map(inv => (
                            <tr key={inv.id} className="group hover:bg-surface-dark transition-colors">
                               <td className="py-4 px-6 text-white whitespace-nowrap tabular-nums">{inv.date}</td>
                               <td className="py-4 px-6 text-text-muted font-mono text-xs">{inv.id}</td>
                               <td className="py-4 px-6">
                                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${inv.type === 'Income' ? 'bg-primary/10 text-primary ring-primary/20' : 'bg-white/5 text-text-muted ring-white/10'}`}>
                                     {inv.type}
                                  </span>
                               </td>
                               <td className="py-4 px-6 text-white font-medium">{inv.client}</td>
                               <td className={`py-4 px-6 text-right font-medium tabular-nums ${inv.type === 'Income' ? 'text-primary' : 'text-white'}`}>
                                  {inv.type === 'Income' ? '+' : '-'}{formatCurrency(inv.amount)}
                               </td>
                               <td className="py-4 px-6 text-right">
                                  <span className={`text-xs ${inv.status === 'Paid' ? 'text-text-muted' : 'text-bronze font-bold'}`}>{inv.status}</span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};