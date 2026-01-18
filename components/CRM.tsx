import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Phone, Mail, Globe, MessageCircle, Plus, X, User, FileText, Calendar, Edit2, Paperclip, Save } from 'lucide-react';
import { Lead } from '../types';

export const CRM: React.FC = () => {
  const { leads, updateLeadStatus, addLead, formatCurrency } = useGlobal();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Lead>>({});
  
  const [newLead, setNewLead] = useState<Partial<Lead>>({ companyName: '', pocName: '', type: 'Inbound', value: 0, status: 'New', requirements: '', notes: '' });

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
           lastContact: new Date().toLocaleDateString(),
           requirements: newLead.requirements,
           notes: newLead.notes,
           files: []
        });
        setShowAddModal(false);
        setNewLead({ companyName: '', pocName: '', type: 'Inbound', value: 0, requirements: '', notes: '' });
     }
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setEditForm(lead);
    setIsEditing(false);
  };

  const saveEdit = () => {
    // In a real app we'd call updateLead(editForm) in GlobalContext.
    // For now we'll just update the local selected lead to reflect changes in UI momentarily
    // assuming global state update is needed for persistence.
    if(selectedLead) {
       // Mock update - replace this with actual context update if available
       Object.assign(selectedLead, editForm); 
       setIsEditing(false);
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
                    <div onClick={() => handleLeadClick(lead)} className="cursor-pointer hover:bg-slate-50 -m-4 p-4 rounded-lg transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                           <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{lead.companyName}</h4>
                           <p className="text-xs text-slate-500 flex items-center gap-1"><User className="w-3 h-3"/> {lead.pocName}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${lead.type === 'Inbound' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {lead.type}
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 p-2 rounded mb-3 border border-slate-100">
                         <p className="text-xs text-slate-500">Est. Value</p>
                         <p className="font-mono font-bold text-slate-700">{formatCurrency(lead.value)}</p>
                      </div>
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

      {/* Add Modal */}
      {showAddModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]">
               <h3 className="font-bold text-lg mb-4">Add New Lead</h3>
               <div className="space-y-3">
                  <input className="w-full border p-2 rounded" placeholder="Company Name" value={newLead.companyName} onChange={e => setNewLead({...newLead, companyName: e.target.value})} />
                  <input className="w-full border p-2 rounded" placeholder="POC Name" value={newLead.pocName} onChange={e => setNewLead({...newLead, pocName: e.target.value})} />
                  <div className="flex gap-2">
                     <input className="w-full border p-2 rounded" placeholder="Phone" value={newLead.phone} onChange={e => setNewLead({...newLead, phone: e.target.value})} />
                     <input className="w-full border p-2 rounded" placeholder="Email" value={newLead.email} onChange={e => setNewLead({...newLead, email: e.target.value})} />
                  </div>
                  <input className="w-full border p-2 rounded" placeholder="Website" value={newLead.website} onChange={e => setNewLead({...newLead, website: e.target.value})} />
                  
                  {/* Currency aware value input - implicitly base INR but labeled */}
                  <div>
                     <label className="text-xs text-slate-500">Estimated Value (Base INR)</label>
                     <input className="w-full border p-2 rounded" type="number" placeholder="0" value={newLead.value || ''} onChange={e => setNewLead({...newLead, value: parseFloat(e.target.value)})} />
                  </div>
                  
                  <select className="w-full border p-2 rounded" value={newLead.type} onChange={e => setNewLead({...newLead, type: e.target.value as any})}>
                     <option value="Inbound">Inbound</option>
                     <option value="Outbound">Outbound</option>
                     <option value="Referral">Referral</option>
                  </select>
                  <textarea className="w-full border p-2 rounded" rows={3} placeholder="Requirements / Needs" value={newLead.requirements} onChange={e => setNewLead({...newLead, requirements: e.target.value})} />
                  <div className="flex gap-2">
                     <button onClick={() => setShowAddModal(false)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                     <button onClick={handleCreate} className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold">Add Lead</button>
                  </div>
               </div>
            </div>
         </div>
      )}

      {/* View Lead Modal */}
      {selectedLead && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
               <div className="flex justify-between items-start mb-4">
                  <div>
                     <h3 className="font-bold text-xl text-slate-800">{selectedLead.companyName}</h3>
                     <p className="text-sm text-slate-500">{selectedLead.pocName} • <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase ${selectedLead.status === 'Won' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{selectedLead.status}</span></p>
                  </div>
                  <div className="flex gap-2">
                     {isEditing ? (
                        <button onClick={saveEdit} className="text-green-600 hover:bg-green-50 p-2 rounded"><Save className="w-5 h-5"/></button>
                     ) : (
                        <button onClick={() => setIsEditing(true)} className="text-indigo-600 hover:bg-indigo-50 p-2 rounded"><Edit2 className="w-5 h-5"/></button>
                     )}
                     <button onClick={() => setSelectedLead(null)}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
                  </div>
               </div>
               
               <div className="space-y-6 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-lg">
                     <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-400"/> {selectedLead.phone}</div>
                     <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-400"/> {selectedLead.email}</div>
                     <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-slate-400"/> {selectedLead.website || 'N/A'}</div>
                     <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400"/> Last: {selectedLead.lastContact}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                     {/* Requirements */}
                     <div className="border border-slate-200 rounded-lg p-4">
                        <h4 className="font-bold text-sm text-slate-700 mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> Requirements</h4>
                        {isEditing ? (
                           <textarea className="w-full border p-2 rounded text-sm" rows={4} value={editForm.requirements} onChange={e => setEditForm({...editForm, requirements: e.target.value})} />
                        ) : (
                           <p className="text-sm text-slate-600 min-h-[80px]">{selectedLead.requirements || 'No requirements specified.'}</p>
                        )}
                     </div>

                     {/* Internal Notes */}
                     <div className="border border-yellow-200 bg-yellow-50/50 rounded-lg p-4">
                        <h4 className="font-bold text-sm text-yellow-800 mb-2">Internal Notes</h4>
                        {isEditing ? (
                           <textarea className="w-full border p-2 rounded text-sm bg-white" rows={4} value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} />
                        ) : (
                           <p className="text-sm text-yellow-700 min-h-[80px]">{selectedLead.notes || 'No notes added.'}</p>
                        )}
                     </div>
                  </div>

                  {/* Files & References */}
                  <div className="border-t pt-4">
                     <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2"><Paperclip className="w-4 h-4"/> Files & References</h4>
                     <div className="flex flex-wrap gap-2 mb-2">
                        {selectedLead.files?.map((f, i) => (
                           <div key={i} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full text-xs border border-slate-200">
                              <FileText className="w-3 h-3 text-indigo-500" /> {f.name}
                           </div>
                        ))}
                        {(!selectedLead.files || selectedLead.files.length === 0) && <p className="text-sm text-slate-400 italic">No files attached.</p>}
                     </div>
                     {isEditing && (
                        <button className="text-xs text-indigo-600 font-medium flex items-center gap-1 hover:underline">
                           <Plus className="w-3 h-3"/> Attach File
                        </button>
                     )}
                  </div>
               </div>

               <div className="flex justify-end gap-2">
                  <button onClick={() => setSelectedLead(null)} className="px-4 py-2 bg-slate-100 rounded text-slate-600 hover:bg-slate-200">Close</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};