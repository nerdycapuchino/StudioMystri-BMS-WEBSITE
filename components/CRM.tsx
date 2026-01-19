import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Lead } from '../types';

export const CRM: React.FC = () => {
  const { leads, updateLeadStatus, addLead, formatCurrency } = useGlobal();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);

  const columns: { id: Lead['status']; label: string; colorClass: string }[] = [
    { id: 'New', label: 'New Lead', colorClass: 'bg-white' },
    { id: 'Negotiation', label: 'Negotiation', colorClass: 'bg-bronze animate-pulse' },
    { id: 'Won', label: 'Won', colorClass: 'bg-primary shadow-[0_0_10px_#38e07b]' },
    { id: 'Lost', label: 'Lost', colorClass: 'bg-red-500' },
  ];

  const handleDragStart = (e: React.DragEvent, id: string) => { setDraggedLeadId(id); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const handleDrop = (e: React.DragEvent, status: Lead['status']) => { e.preventDefault(); if (draggedLeadId) { updateLeadStatus(draggedLeadId, status); setDraggedLeadId(null); } };

  return (
    <div className="h-full flex flex-col relative bg-background-dark overflow-hidden">
      {/* Header */}
      <header className="relative z-10 flex flex-col gap-6 p-8 pb-0 shrink-0">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-4xl font-black text-white tracking-tighter">Lead Pipeline</h2>
            <div className="flex items-center gap-2">
              <span className="text-text-muted text-sm font-medium">Total Pipeline Value:</span>
              <span className="text-bronze text-lg font-bold font-mono">₹45,00,000</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <input className="bg-surface-dark border border-border-dark text-white text-sm rounded-full pl-10 pr-4 py-2.5 w-64 focus:outline-none focus:border-bronze/50 focus:ring-1 focus:ring-bronze/50 transition-all placeholder-[#5c6b63]" placeholder="Search leads..." type="text"/>
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[#5c6b63] text-[20px]">search</span>
            </div>
            <button className="bg-primary hover:bg-[#2bc968] text-background-dark pl-4 pr-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(56,224,123,0.3)]">
              <span className="material-symbols-outlined text-[20px] font-bold">add</span>
              <span>Add Lead</span>
            </button>
          </div>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-2"></div>
      </header>

      {/* Kanban Board */}
      <div className="kanban-container flex-1 overflow-x-auto overflow-y-hidden p-8 flex gap-6 z-10">
        {columns.map(col => (
          <div key={col.id} className="flex flex-col min-w-[340px] w-[340px] h-full" onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, col.id)}>
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <div className={`size-2 rounded-full ${col.colorClass}`}></div>
                <h3 className={`${col.id === 'Lost' ? 'text-[#5c6b63]' : col.id === 'Won' ? 'text-primary' : 'text-white'} font-bold tracking-tight`}>{col.label}</h3>
              </div>
              <span className="text-[#5c6b63] text-sm font-mono">{leads.filter(l => l.status === col.id).length}</span>
            </div>
            
            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pb-4 pr-2 custom-scrollbar">
              {leads.filter(l => l.status === col.id).map(lead => (
                <div 
                  key={lead.id} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  className={`group relative bg-surface hover:bg-[#233029] rounded-2xl p-4 border border-white/5 hover:border-bronze/30 transition-all duration-300 shadow-lg cursor-grab active:cursor-grabbing ${lead.status === 'Lost' ? 'grayscale opacity-70' : ''}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] font-bold uppercase tracking-wider text-text-muted border border-white/5">{lead.source}</span>
                    <button className="text-[#5c6b63] hover:text-white transition-colors">
                      <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                    </button>
                  </div>
                  <div className="flex gap-4 items-center mb-4">
                    <div className="size-12 rounded-full bg-surface-highlight flex items-center justify-center shrink-0 border-2 border-white/10 text-white font-bold">{lead.pocName.charAt(0)}</div>
                    <div>
                      <h4 className="text-white font-bold text-lg leading-tight">{lead.companyName}</h4>
                      <p className="text-text-muted text-xs mt-0.5">{lead.pocName}</p>
                    </div>
                  </div>
                  <div className="flex items-end justify-between border-t border-white/5 pt-3">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#5c6b63] uppercase tracking-wide">Est. Value</span>
                      <span className="text-primary font-mono font-bold text-lg">{formatCurrency(lead.value)}</span>
                    </div>
                    <span className="text-[10px] text-[#5c6b63]">{lead.lastContact}</span>
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-[#122017]/90 backdrop-blur-[2px] rounded-2xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="size-10 rounded-full bg-primary text-background-dark flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_rgba(56,224,123,0.4)]" title="Call">
                      <span className="material-symbols-outlined text-[20px]">call</span>
                    </button>
                    <button className="size-10 rounded-full bg-surface border border-white/20 text-white flex items-center justify-center hover:scale-110 hover:bg-white hover:text-black transition-all" title="Email">
                      <span className="material-symbols-outlined text-[20px]">mail</span>
                    </button>
                    <button className="size-10 rounded-full bg-bronze text-white flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_rgba(197,165,114,0.4)]" title="Notes">
                      <span className="material-symbols-outlined text-[20px]">edit_note</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};