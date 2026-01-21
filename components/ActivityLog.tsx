import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Clock, ShieldAlert, Edit2, Check, X, History, ChevronDown, ChevronUp, Filter, Calendar } from 'lucide-react';

export const ActivityLog: React.FC = () => {
  const { systemLogs, userRole, editLog } = useGlobal();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Filters
  const [filterUser, setFilterUser] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [filterDate, setFilterDate] = useState('');

  const startEdit = (id: string, currentDetails: string) => {
    setEditingId(id);
    setEditValue(currentDetails);
  };

  const saveEdit = (id: string) => {
    editLog(id, editValue);
    setEditingId(null);
  };

  // Unique lists for dropdowns
  const uniqueUsers = Array.from(new Set(systemLogs.map(l => l.user)));
  const uniqueModules = Array.from(new Set(systemLogs.map(l => l.module)));

  const filteredLogs = systemLogs.filter(log => {
     const matchesUser = filterUser ? log.user === filterUser : true;
     const matchesModule = filterModule ? log.module === filterModule : true;
     const matchesDate = filterDate ? log.timestamp.includes(new Date(filterDate).toLocaleDateString()) : true; // Simple string match for demo
     return matchesUser && matchesModule && matchesDate;
  });

  return (
    <div className="h-full flex flex-col bg-background-light dark:bg-background-dark text-white p-6 md:p-10">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-3xl font-bold text-white tracking-tight">Unified Activity Feed</h2>
         <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20 font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3 h-3" />
            Immutable Record (Admin Override Active)
         </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-dark p-4 rounded-xl shadow-lg border border-white/5 mb-6 flex flex-wrap gap-4 items-center">
         <div className="flex items-center gap-2 text-zinc-400 font-bold text-sm uppercase tracking-wide">
            <Filter className="w-4 h-4" /> Filters:
         </div>
         
         <div className="relative">
            <select className="bg-surface-highlight border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
               <option value="">All Users</option>
               {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-[16px]">expand_more</span>
         </div>

         <div className="relative">
            <select className="bg-surface-highlight border border-white/10 rounded-lg pl-3 pr-8 py-2 text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none appearance-none cursor-pointer" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
               <option value="">All Modules</option>
               {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none text-[16px]">expand_more</span>
         </div>

         <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input type="date" className="bg-surface-highlight border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
         </div>
         
         <button onClick={() => { setFilterUser(''); setFilterModule(''); setFilterDate(''); }} className="text-sm text-primary font-bold hover:underline ml-auto">Reset Filters</button>
      </div>

      <div className="bg-surface-dark rounded-2xl shadow-xl border border-white/5 overflow-hidden flex-1">
         <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
               <thead className="bg-surface-highlight text-zinc-400 font-medium uppercase tracking-wider text-xs">
                  <tr>
                     <th className="px-6 py-4">Timestamp</th>
                     <th className="px-6 py-4">User</th>
                     <th className="px-6 py-4">Module</th>
                     <th className="px-6 py-4">Action</th>
                     <th className="px-6 py-4">Details</th>
                     {userRole === 'Super Admin' && <th className="px-6 py-4 text-right">Admin</th>}
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {filteredLogs.map(log => (
                     <React.Fragment key={log.id}>
                        <tr className="hover:bg-white/5 transition-colors">
                           <td className="px-6 py-4 text-zinc-400 whitespace-nowrap flex items-center gap-2 font-mono text-xs">
                              <Clock className="w-3 h-3 text-zinc-600" /> {log.timestamp}
                           </td>
                           <td className="px-6 py-4 font-bold text-white">{log.user}</td>
                           <td className="px-6 py-4"><span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wide text-zinc-300">{log.module}</span></td>
                           <td className="px-6 py-4 font-bold text-primary">{log.action}</td>
                           <td className="px-6 py-4 text-zinc-300">
                              {editingId === log.id ? (
                                 <input 
                                    value={editValue} 
                                    onChange={(e) => setEditValue(e.target.value)} 
                                    className="w-full bg-black/20 border border-primary/50 rounded px-2 py-1 text-white focus:outline-none" 
                                    autoFocus 
                                 />
                              ) : (
                                 <span className="max-w-md truncate block" title={log.details}>{log.details}</span>
                              )}
                           </td>
                           {userRole === 'Super Admin' && (
                              <td className="px-6 py-4 text-right">
                                 <div className="flex justify-end items-center gap-2">
                                    {log.editHistory && log.editHistory.length > 0 && (
                                       <button onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)} className="text-zinc-500 hover:text-white" title="View History">
                                          {expandedLogId === log.id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                       </button>
                                    )}
                                    {editingId === log.id ? (
                                       <div className="flex gap-1">
                                          <button onClick={() => saveEdit(log.id)} className="text-green-500 hover:bg-green-500/10 p-1 rounded"><Check className="w-4 h-4"/></button>
                                          <button onClick={() => setEditingId(null)} className="text-red-500 hover:bg-red-500/10 p-1 rounded"><X className="w-4 h-4"/></button>
                                       </div>
                                    ) : (
                                       <button onClick={() => startEdit(log.id, log.details)} className="text-zinc-500 hover:text-primary p-1 rounded transition-colors">
                                          <Edit2 className="w-4 h-4" />
                                       </button>
                                    )}
                                 </div>
                              </td>
                           )}
                        </tr>
                        {expandedLogId === log.id && log.editHistory && (
                           <tr className="bg-black/20 shadow-inner">
                              <td colSpan={6} className="px-6 py-4">
                                 <div className="text-xs text-zinc-400">
                                    <p className="font-bold mb-2 flex items-center gap-1 text-zinc-300"><History className="w-3 h-3"/> Modification History</p>
                                    <div className="space-y-2 pl-4 border-l-2 border-white/10 ml-1">
                                       {log.editHistory.map((h, i) => (
                                          <div key={i} className="flex gap-6 items-center">
                                             <span className="text-zinc-600 font-mono">{h.timestamp}</span>
                                             <span className="font-bold text-zinc-300">{h.editedBy}</span>
                                             <span className="text-zinc-500 line-through opacity-50">Old: {h.oldDetails}</span>
                                          </div>
                                       ))}
                                    </div>
                                 </div>
                              </td>
                           </tr>
                        )}
                     </React.Fragment>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};