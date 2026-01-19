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
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-slate-800">Unified Activity Feed</h2>
         <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            <ShieldAlert className="w-3 h-3" />
            Immutable Record (Admin Override Active)
         </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex gap-4 items-center">
         <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Filter className="w-4 h-4" /> Filters:
         </div>
         <select className="border rounded px-3 py-1.5 text-sm" value={filterUser} onChange={e => setFilterUser(e.target.value)}>
            <option value="">All Users</option>
            {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
         </select>
         <select className="border rounded px-3 py-1.5 text-sm" value={filterModule} onChange={e => setFilterModule(e.target.value)}>
            <option value="">All Modules</option>
            {uniqueModules.map(m => <option key={m} value={m}>{m}</option>)}
         </select>
         <div className="relative">
            <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="date" className="border rounded pl-8 pr-3 py-1.5 text-sm" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
         </div>
         <button onClick={() => { setFilterUser(''); setFilterModule(''); setFilterDate(''); }} className="text-sm text-indigo-600 hover:underline">Reset</button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
         <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
               <tr>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Module</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Details</th>
                  {userRole === 'Super Admin' && <th className="px-6 py-4 text-right">Admin</th>}
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {filteredLogs.map(log => (
                  <React.Fragment key={log.id}>
                     <tr className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap flex items-center gap-2">
                           <Clock className="w-3 h-3" /> {log.timestamp}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-800">{log.user}</td>
                        <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-mono text-slate-600">{log.module}</span></td>
                        <td className="px-6 py-4 font-semibold text-indigo-600">{log.action}</td>
                        <td className="px-6 py-4 text-slate-600">
                           {editingId === log.id ? (
                              <input 
                                 value={editValue} 
                                 onChange={(e) => setEditValue(e.target.value)} 
                                 className="w-full border p-1 rounded" 
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
                                    <button onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)} className="text-slate-400 hover:text-slate-600" title="View History">
                                       {expandedLogId === log.id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                                    </button>
                                 )}
                                 {editingId === log.id ? (
                                    <div className="flex gap-1">
                                       <button onClick={() => saveEdit(log.id)} className="text-green-600"><Check className="w-4 h-4"/></button>
                                       <button onClick={() => setEditingId(null)} className="text-red-600"><X className="w-4 h-4"/></button>
                                    </div>
                                 ) : (
                                    <button onClick={() => startEdit(log.id, log.details)} className="text-slate-400 hover:text-indigo-600">
                                       <Edit2 className="w-4 h-4" />
                                    </button>
                                 )}
                              </div>
                           </td>
                        )}
                     </tr>
                     {expandedLogId === log.id && log.editHistory && (
                        <tr className="bg-slate-50">
                           <td colSpan={6} className="px-6 py-3">
                              <div className="text-xs text-slate-500">
                                 <p className="font-bold mb-2 flex items-center gap-1"><History className="w-3 h-3"/> Modification History</p>
                                 <div className="space-y-1 pl-4 border-l-2 border-slate-200">
                                    {log.editHistory.map((h, i) => (
                                       <div key={i} className="flex gap-4">
                                          <span className="text-slate-400 w-32">{h.timestamp}</span>
                                          <span className="font-medium text-slate-700">{h.editedBy}</span>
                                          <span className="text-slate-600 line-through opacity-70">Old: {h.oldDetails}</span>
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
  );
};