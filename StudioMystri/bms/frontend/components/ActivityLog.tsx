
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, Filter, Search, Edit2, Check, X } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface LogEntry {
   id: string;
   action: string;
   module: string;
   user: string;
   timestamp: string;
   details?: string;
}

// Inline hooks for activity logs (no dedicated hook file)
const useActivityLogs = () =>
   useQuery({
      queryKey: ['activity-logs'],
      queryFn: async () => {
         const { data } = await api.get('/activity/logs');
         return data;
      }
   });

const useUpdateLog = () => {
   const qc = useQueryClient();
   return useMutation({
      mutationFn: async ({ id, details }: { id: string; details: string }) => {
         const { data } = await api.patch(`/activity/logs/${id}`, { details });
         return data;
      },
      onSuccess: () => {
         qc.invalidateQueries({ queryKey: ['activity-logs'] });
         toast.success('Log updated');
      },
      onError: () => toast.error('Failed to update log'),
   });
};

export const ActivityLog: React.FC = () => {
   const { user: currentUser } = useAuth();
   const { data: logData, isLoading, isError, error } = useActivityLogs();
   const updateLog = useUpdateLog();

   const systemLogs: LogEntry[] = Array.isArray(logData?.data || logData) ? (logData?.data || logData) as LogEntry[] : [];

   const [searchQuery, setSearchQuery] = useState('');
   const [selectedModule, setSelectedModule] = useState('All');
   const [editingLogId, setEditingLogId] = useState<string | null>(null);
   const [editNote, setEditNote] = useState('');

   const modules = Array.from(new Set(systemLogs.map(l => l.module)));

   const filteredLogs = systemLogs.filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
         log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (log.details || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesModule = selectedModule === 'All' || log.module === selectedModule;
      return matchesSearch && matchesModule;
   });

   const handleEditSave = (id: string) => {
      updateLog.mutate({ id, details: editNote }, {
         onSuccess: () => setEditingLogId(null)
      });
   };

   const getModuleColor = (module: string): string => {
      const colors: Record<string, string> = {
         'CRM': 'text-blue-500 bg-blue-50',
         'Finance': 'text-green-500 bg-green-50',
         'HR': 'text-purple-500 bg-purple-50',
         'Projects': 'text-orange-500 bg-orange-50',
         'Warehouse': 'text-amber-500 bg-amber-50',
         'Admin': 'text-red-500 bg-red-50',
      };
      return colors[module] || 'text-slate-500 bg-slate-50';
   };

   if (isLoading) {
      return (
         <div className="h-full flex flex-col p-6 space-y-6">
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse w-48" />
            <div className="flex-1 bg-slate-100 rounded-xl animate-pulse" />
         </div>
      );
   }

   if (isError) {
      return (
         <div className="h-full flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-500 font-bold mb-2">Failed to load activity logs</p>
               <p className="text-slate-500 text-sm">{(error as any)?.message || 'Unknown error'}</p>
            </div>
         </div>
      );
   }

   return (
      <div className="h-full flex flex-col overflow-y-auto pr-2">
         <div className="flex justify-between items-center mb-6">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Activity Log</h2>
               <p className="text-slate-500 text-sm">{systemLogs.length} entries</p>
            </div>
         </div>

         {/* Filters */}
         <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                  placeholder="Search logs..."
               />
            </div>
            <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-600">
               <option value="All">All Modules</option>
               {modules.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
         </div>

         {/* Log Entries */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
            <div className="divide-y divide-slate-100">
               {filteredLogs.map(log => (
                  <div key={log.id} className="px-4 py-4 hover:bg-slate-50 transition-colors">
                     <div className="flex items-start gap-4">
                        <div className="mt-1">
                           <Clock className="w-4 h-4 text-slate-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2 mb-1">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getModuleColor(log.module)}`}>
                                 {log.module}
                              </span>
                              <span className="text-xs text-slate-400">{log.timestamp}</span>
                           </div>
                           <p className="text-sm text-slate-800 font-medium">{log.action}</p>
                           <p className="text-xs text-slate-500 mt-0.5">by {log.user}</p>

                           {/* Edit Note */}
                           {editingLogId === log.id ? (
                              <div className="mt-2 flex items-center gap-2">
                                 <input
                                    value={editNote}
                                    onChange={e => setEditNote(e.target.value)}
                                    className="flex-1 border border-slate-200 p-2 rounded text-sm"
                                    placeholder="Add a note..."
                                 />
                                 <button onClick={() => handleEditSave(log.id)} className="text-green-600 hover:text-green-700">
                                    <Check className="w-4 h-4" />
                                 </button>
                                 <button onClick={() => setEditingLogId(null)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-4 h-4" />
                                 </button>
                              </div>
                           ) : (
                              <div className="mt-1 flex items-center gap-2">
                                 {log.details && <p className="text-xs text-slate-400 italic">Note: {log.details}</p>}
                                 {currentUser?.role === 'Super Admin' && (
                                    <button onClick={() => { setEditingLogId(log.id); setEditNote(log.details || ''); }} className="text-indigo-500 hover:underline text-xs">
                                       <Edit2 className="w-3 h-3 inline" /> Edit
                                    </button>
                                 )}
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
               ))}

               {filteredLogs.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-sm">No activity logs found.</div>
               )}
            </div>
         </div>
      </div>
   );
};
