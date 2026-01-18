import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Phone, Mail, Globe, MessageCircle, Plus, X, User } from 'lucide-react';
import { Lead } from '../types';

export const CRM: React.FC = () => {
  const { leads, updateLeadStatus, addLead } = useGlobal();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLead, setNewLead] = useState<Partial<Lead>>({ companyName: '', pocName: '', type: 'Inbound', value: 0, status: 'New' });

  const columns: { id: Lead['status']; label: string; color: string }[] = [
    { id: 'New', label: 'New Leads', color: 'bg-blue-500' },
    { id: 'Negotiation', label: 'Negotiation', color: 'bg-yellow-500' },
    { id: 'Won', label: 'Closed Won', color: 'bg-green-500' },
    { id: 'Lost', label: 'Lost', color: 'bg-red-500' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedLeadId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, status: Lead['status']) => { e.preventDefault(); if (draggedLeadId) { updateLeadStatus(draggedLeadId, status); setDraggedLeadId(null); } };

  const handleCreate = () => {
     if(newLead.companyName) {
        addLead({
           id: Math.random().toString(36).substr(2, 9),
           companyName: newLead.companyName || 'Unknown',
           pocName: newLead.pocName || 'Unknown',
           phone: newLead.phone || '',
           email: newLead.email || '',
           website: newLead.website,
           type: newLead.type as any,
           status: 'New',
           value: newLead.value || 0,
           source: 'Manual',
           lastContact: new Date().toLocaleDateString()
        });
        setShowAddModal(false);
        setNewLead({ companyName: '', pocName: '', type: 'Inbound', value: 0 });
     }
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Sales Pipeline</h2>
        <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
           <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max h-full">
          {columns.map(col => (
            <div key={col.id} className="w-80 flex flex-col bg-slate-100 rounded-xl p-3 h-full border border-slate-200" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
              <div className="flex items-center justify-between mb-4 px-1">
                 <div className="flex items-center gap-2">
                   <div className={`w-3 h-3 rounded-full ${col.color}`}></div>
                   <span className="font-bold text-slate-700">{col.label}</span>
                   <span className="bg-white text-slate-600 text-xs px-2 py-0.5 rounded-full border border-slate-200 font-mono">
                     {leads.filter(l => l.status === col.id).length}
                   </span>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3">
                {leads.filter(l => l.status === col.id).map(lead => (
                  <div key={lead.id} draggable onDragStart={(e) => handleDragStart(e, lead.id)} className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-grab active:cursor-grabbing hover:shadow-md transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                         <h4 className="font-bold text-slate-800 text-sm">{lead.companyName}</h4>
                         <p className="text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3"/> {lead.pocName}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${lead.type === 'Inbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                        {lead.type}
                      </span>
                    </div>
                    
                    <div className="bg-slate-50 p-2 rounded mb-3">
                       <p className="text-xs text-slate-500">Est. Value</p>
                       <p className="font-mono font-bold text-slate-700">${lead.value.toLocaleString()}</p>
                    </div>

                    <div className="flex gap-2 mt-2">
                       <a href={`tel:${lead.phone}`} className="flex-1 py-1.5 flex items-center justify-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 rounded hover:bg-green-50 hover:text-green-600 transition-colors border border-slate-100" title="Call">
                         <Phone className="w-3 h-3" />
                       </a>
                       <a href={`mailto:${lead.email}`} className="flex-1 py-1.5 flex items-center justify-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 rounded hover:bg-blue-50 hover:text-blue-600 transition-colors border border-slate-100" title="Email">
                         <Mail className="w-3 h-3" />
                       </a>
                       {lead.website && <a href={`https://${lead.website}`} target="_blank" className="flex-1 py-1.5 flex items-center justify-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 rounded hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-slate-100" title="Website"><Globe className="w-3 h-3" /></a>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
               <h3 className="font-bold text-lg mb-4">Add New Lead</h3>
               <div className="space-y-3">
                  <input className="w-full border p-2 rounded" placeholder="Company Name" value={newLead.companyName} onChange={e => setNewLead({...newLead, companyName: e.target.value})} />
                  <input className="w-full border p-2 rounded" placeholder="POC Name" value={newLead.pocName} onChange={e => setNewLead({...newLead, pocName: e.target.value})} />
                  <div className="flex gap-2">
                     <input className="w-full border p-2 rounded" placeholder="Phone" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
                     <input className="w-full border p-2 rounded" placeholder="Email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
                  </div>
                  <input className="w-full border p-2 rounded" placeholder="Website" value={newLead.website} onChange={e => setNewLead({...newLead, website: e.target.value})} />
                  <input className="w-full border p-2 rounded" type="number" placeholder="Est. Value ($)" value={newLead.value || ''} onChange={e => setNewLead({...newLead, value: parseFloat(e.target.value)})} />
                  <select className="w-full border p-2 rounded" value={newLead.type} onChange={e => setNewLead({...newLead, type: e.target.value as any})}>
                     <option value="Inbound">Inbound</option>
                     <option value="Outbound">Outbound</option>
                     <option value="Referral">Referral</option>
                  </select>
                  <div className="flex gap-2">
                     <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                     <button onClick={handleCreate} className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold">Add Lead</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};