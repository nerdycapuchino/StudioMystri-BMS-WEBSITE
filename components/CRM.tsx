import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Lead } from '../types';

export const CRM: React.FC = () => {
  const { leads, updateLeadStatus, addLead, formatCurrency, deleteLead } = useGlobal();
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState<Partial<Lead>>({ companyName: '', pocName: '', value: 0 });

  const columns: Lead['status'][] = ['New', 'Negotiation', 'Won', 'Lost'];

  const handleCreate = () => {
    addLead({ ...form, id: Math.random().toString(36).substr(2,9), status: 'New', source: 'Direct', lastContact: new Date().toLocaleDateString() } as Lead);
    setShowAdd(false); setForm({ companyName: '', pocName: '', value: 0 });
  };

  return (
    <div className="h-full flex flex-col p-8 bg-background-dark overflow-hidden">
      <div className="flex justify-between items-end mb-8">
        <div><h2 className="text-4xl font-black text-white tracking-tighter">CRM Pipeline</h2><p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Managed Lead Management</p></div>
        <button onClick={() => setShowAdd(true)} className="px-8 py-3 bg-primary text-background-dark rounded-full font-bold shadow-glow hover:scale-105 transition-all transform">+ Capture Lead</button>
      </div>
      <div className="flex-1 overflow-x-auto flex gap-6 pb-6">
        {columns.map(col => (
          <div key={col} className="w-80 h-full flex flex-col shrink-0">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 px-2">{col} / {leads.filter(l => l.status === col).length}</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {leads.filter(l => l.status === col).map(l => (
                <div key={l.id} onClick={() => setSelectedLead(l)} className="bg-surface-dark border border-white/5 p-4 rounded-2xl hover:border-primary/50 transition-all cursor-pointer group shadow-lg">
                  <div className="flex justify-between mb-2"><span className="text-[10px] font-bold text-primary">{l.id}</span><button onClick={(e) => { e.stopPropagation(); deleteLead(l.id); }} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500"><span className="material-symbols-outlined text-[16px]">delete</span></button></div>
                  <h4 className="text-white font-bold text-lg mb-1">{l.companyName}</h4>
                  <p className="text-zinc-500 text-xs mb-3">{l.pocName}</p>
                  <div className="flex justify-between items-end pt-3 border-t border-white/5"><p className="text-zinc-100 font-bold text-sm">{formatCurrency(l.value)}</p><p className="text-[10px] text-zinc-600 font-bold">{l.lastContact}</p></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {selectedLead && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
               <div className="p-8 border-b border-white/10 flex justify-between items-start">
                  <div><h3 className="text-2xl font-bold text-white mb-1">{selectedLead.companyName}</h3><p className="text-zinc-500 text-sm">{selectedLead.pocName} • {selectedLead.email}</p></div>
                  <button onClick={() => setSelectedLead(null)}><span className="material-symbols-outlined text-zinc-500">close</span></button>
               </div>
               <div className="p-8 overflow-y-auto space-y-8 flex-1">
                  <div className="grid grid-cols-2 gap-8"><div className="bg-white/5 p-4 rounded-xl border border-white/5"><p className="text-zinc-500 text-[10px] uppercase font-black mb-2">Deal Size</p><p className="text-2xl font-bold text-primary">{formatCurrency(selectedLead.value)}</p></div><div className="bg-white/5 p-4 rounded-xl border border-white/5"><p className="text-zinc-500 text-[10px] uppercase font-black mb-2">Stage</p><p className="text-2xl font-bold text-white">{selectedLead.status}</p></div></div>
                  <div><h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Requirements & Notes</h4><div className="bg-[#0b100d] p-6 rounded-2xl border border-white/5 text-zinc-300 leading-relaxed min-h-[150px]">{selectedLead.requirements || 'No requirements specified.'}</div></div>
               </div>
               <div className="p-6 bg-surface-highlight flex justify-end gap-3"><button className="px-6 py-2 bg-white/5 text-white rounded-xl font-bold">Edit</button><button onClick={() => setSelectedLead(null)} className="px-6 py-2 bg-primary text-background-dark rounded-xl font-bold">Close</button></div>
            </div>
         </div>
      )}
      {showAdd && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-surface-dark border border-white/10 rounded-2xl p-8 w-full max-w-md shadow-2xl space-y-4">
               <h3 className="text-xl font-bold text-white">Capture New Lead</h3>
               <input value={form.companyName} onChange={e => setForm({...form, companyName: e.target.value})} placeholder="Company Name" className="w-full bg-background-dark border border-white/10 rounded-xl p-3" />
               <input value={form.pocName} onChange={e => setForm({...form, pocName: e.target.value})} placeholder="POC Name" className="w-full bg-background-dark border border-white/10 rounded-xl p-3" />
               <input type="number" value={form.value} onChange={e => setForm({...form, value: Number(e.target.value)})} placeholder="Estimated Value" className="w-full bg-background-dark border border-white/10 rounded-xl p-3" />
               <textarea onChange={e => setForm({...form, requirements: e.target.value})} placeholder="Requirements..." className="w-full bg-background-dark border border-white/10 rounded-xl p-3 h-32" />
               <div className="flex gap-4 pt-4"><button onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-white/10 rounded-xl font-bold">Cancel</button><button onClick={handleCreate} className="flex-1 py-3 bg-primary text-background-dark rounded-xl font-bold">Save Lead</button></div>
            </div>
         </div>
      )}
    </div>
  );
};