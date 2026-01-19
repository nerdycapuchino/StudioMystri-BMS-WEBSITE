import React from 'react';
import { useGlobal } from '../context/GlobalContext';

export const Warehouse: React.FC = () => {
  const { inventory, currency, formatCurrency, checkAccess } = useGlobal();
  const costAccess = checkAccess('costPrice');
  
  const totalValue = inventory.reduce((sum, i) => sum + (i.cost * i.quantity), 0);
  const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 scroll-smooth">
        <div className="max-w-[1400px] mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
              <a className="hover:text-primary transition-colors" href="#">Studio Mystri</a>
              <span className="material-symbols-outlined text-[12px]">chevron_right</span>
              <span className="text-white">Warehouse A</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <h1 className="text-4xl font-bold text-white tracking-tight">Inventory Management</h1>
              <div className="text-right hidden md:block">
                <p className="text-zinc-500 text-sm">Last synced: Today, 10:42 AM</p>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute right-4 top-4 bg-surface-highlight p-2 rounded-full text-primary opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <p className="text-zinc-400 font-medium mb-1">Total Inventory Value</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-bold text-white tracking-tight tabular-nums">
                   {costAccess !== 'hidden' ? formatCurrency(totalValue) : 'Hidden'}
                </h3>
                <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full text-xs font-bold">+2.4%</span>
              </div>
            </div>
            
            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute right-4 top-4 bg-surface-highlight p-2 rounded-full text-amber-500 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined">warning</span>
              </div>
              <p className="text-zinc-400 font-medium mb-1">Low Stock Alerts</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-bold text-white tracking-tight tabular-nums">{lowStockItems.length} Items</h3>
                <span className="text-amber-500 text-sm font-medium">Action Needed</span>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
              <div className="absolute right-4 top-4 bg-surface-highlight p-2 rounded-full text-blue-400 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined">category</span>
              </div>
              <p className="text-zinc-400 font-medium mb-1">Total SKU Count</p>
              <div className="flex items-baseline gap-3">
                <h3 className="text-3xl font-bold text-white tracking-tight tabular-nums">{inventory.length} SKUs</h3>
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-dark/50 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative group w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-primary transition-colors">search</span>
                <input className="w-full bg-[#111714] border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all" placeholder="Search by SKU, Name or Category..." type="text"/>
              </div>
              <button className="p-2.5 bg-[#111714] text-zinc-400 hover:text-white rounded-full border border-white/10 hover:border-white/30 transition-all"><span className="material-symbols-outlined">tune</span></button>
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto justify-end">
               <button className="flex items-center gap-2 bg-primary hover:bg-[#2ecc71] text-background-dark px-5 py-2.5 rounded-full font-bold text-sm transition-all transform active:scale-95 shadow-[0_0_20px_rgba(56,224,123,0.3)]">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span className="whitespace-nowrap">Add Item</span>
               </button>
            </div>
          </div>

          {/* Table */}
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-surface-dark/80 text-xs uppercase tracking-wider text-zinc-500 font-semibold">
                    <th className="p-4 pl-6">Item Details</th>
                    <th className="p-4">SKU/ID</th>
                    <th className="p-4">Location</th>
                    <th className="p-4 text-right">Unit Cost</th>
                    <th className="p-4 text-center">Stock Level</th>
                    <th className="p-4 pr-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-white/5">
                  {inventory.map(item => (
                    <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6">
                        <p className="text-white font-bold text-base">{item.name}</p>
                        <p className="text-zinc-500 text-xs mt-0.5">{item.type}</p>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-zinc-400 bg-white/5 px-2 py-1 rounded text-xs">{item.id}</span>
                      </td>
                      <td className="p-4 text-zinc-400">{item.location}</td>
                      <td className="p-4 text-right">
                        <span className="text-white font-medium tabular-nums">
                           {costAccess !== 'hidden' ? formatCurrency(item.cost) : 'Hidden'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-white font-mono font-bold text-lg">{item.quantity}</span> <span className="text-xs text-zinc-500">{item.unit}</span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${item.quantity <= item.reorderLevel ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                           <span className={`w-1.5 h-1.5 rounded-full ${item.quantity <= item.reorderLevel ? 'bg-amber-500' : 'bg-primary animate-pulse'}`}></span>
                           {item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                        </span>
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
  );
};