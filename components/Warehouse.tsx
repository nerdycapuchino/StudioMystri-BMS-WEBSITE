import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { InventoryItem } from '../types';

export const Warehouse: React.FC = () => {
  const { inventory, formatCurrency, addInventoryItem, updateInventoryStock, deleteInventoryItem } = useGlobal();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [form, setForm] = useState<Partial<InventoryItem>>({ name: '', quantity: 0, cost: 0, unit: 'pcs', type: 'Raw Material' });

  const handleSave = () => {
    if (editItem) { updateInventoryStock(editItem.id, form.quantity || 0); setEditItem(null); }
    else { addInventoryItem({ ...form, id: Math.random().toString(36).substr(2, 9) } as InventoryItem); setShowAdd(false); }
    setForm({ name: '', quantity: 0, cost: 0, unit: 'pcs', type: 'Raw Material' });
  };

  return (
    <div className="h-full flex flex-col p-8 bg-background-dark overflow-hidden">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight">Warehouse Master</h2>
        <button onClick={() => setShowAdd(true)} className="px-6 py-2.5 bg-primary text-background-dark rounded-full font-bold shadow-glow flex items-center gap-2 transition-all"><span className="material-symbols-outlined">add</span> Add SKU</button>
      </div>
      <div className="flex-1 overflow-y-auto bg-surface-dark border border-white/5 rounded-2xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-highlight text-zinc-500 uppercase text-xs font-bold tracking-widest"><tr className="border-b border-white/5"><th className="p-6">Item</th><th className="p-6">Category</th><th className="p-6 text-center">Stock</th><th className="p-6 text-right">Unit Cost</th><th className="p-6 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {inventory.map(item => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-6 font-bold text-white">{item.name}</td>
                <td className="p-6 text-zinc-400">{item.type}</td>
                <td className={`p-6 text-center font-bold ${item.quantity <= item.reorderLevel ? 'text-amber-500' : 'text-zinc-100'}`}>{item.quantity} {item.unit}</td>
                <td className="p-6 text-right font-mono">{formatCurrency(item.cost)}</td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditItem(item); setForm(item); }} className="p-2 text-zinc-500 hover:text-white bg-white/5 rounded-lg"><span className="material-symbols-outlined text-[18px]">edit</span></button>
                    <button onClick={() => deleteInventoryItem(item.id)} className="p-2 text-zinc-500 hover:text-red-500 bg-white/5 rounded-lg"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(showAdd || editItem) && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="bg-surface-dark border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl space-y-6">
              <h3 className="text-xl font-bold text-white">{editItem ? 'Edit Item' : 'New Item'}</h3>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Item Name" className="w-full bg-background-dark border border-white/10 rounded-xl p-3" />
              <div className="grid grid-cols-2 gap-4">
                <input type="number" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} placeholder="Stock Qty" className="bg-background-dark border border-white/10 rounded-xl p-3" />
                <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} placeholder="Unit (pcs)" className="bg-background-dark border border-white/10 rounded-xl p-3" />
              </div>
              <input type="number" value={form.cost} onChange={e => setForm({...form, cost: Number(e.target.value)})} placeholder="Unit Cost" className="w-full bg-background-dark border border-white/10 rounded-xl p-3" />
              <div className="flex gap-4"><button onClick={() => {setShowAdd(false); setEditItem(null);}} className="flex-1 py-3 bg-white/10 rounded-xl font-bold">Cancel</button><button onClick={handleSave} className="flex-1 py-3 bg-primary text-background-dark rounded-xl font-bold">Save</button></div>
           </div>
        </div>
      )}
    </div>
  );
};