import React, { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useEmployees } from '../hooks/useHR';
import { TableSkeleton, InlineError } from './ui/Skeleton';
import { Plus, CheckCircle, Clock, Trash2, X } from 'lucide-react';

export const TaskManager: React.FC = () => {
    const { data, isLoading, isError, error, refetch } = useTasks();
    const { data: empData } = useEmployees();
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', status: 'To Do', priority: 'Medium', assigneeId: '', dueDate: '' });

    const tasks = data?.data || data || [];
    const employees = empData?.data || empData || [];

    const handleSave = () => {
        if (form.title && form.assigneeId) {
            createTask.mutate(
                { ...form, dueDate: form.dueDate || new Date().toISOString().split('T')[0] },
                { onSuccess: () => { setShowModal(false); setForm({ title: '', status: 'To Do', priority: 'Medium', assigneeId: '', dueDate: '' }); } }
            );
        }
    };

    if (isLoading) return <div className="h-full p-10"><TableSkeleton /></div>;
    if (isError) return <div className="h-full p-10"><InlineError message={(error as Error)?.message || 'Failed to load tasks'} onRetry={refetch} /></div>;

    return (
        <div className="h-full flex flex-col p-6 md:p-10 bg-gradient-to-br from-slate-50 to-blue-50">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black text-slate-800 tracking-tighter">Task Manager</h2>
                <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full shadow-glow flex items-center gap-2">
                    <Plus className="w-4 h-4" /> New Task
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto">
                {['To Do', 'In Progress', 'Done'].map(status => (
                    <div key={status} className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-4 flex flex-col h-full">
                        <h3 className="text-xs font-black uppercase text-slate-500 mb-4 px-2">{status}</h3>
                        <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                            {(Array.isArray(tasks) ? tasks : []).filter((t: any) => t.status === status).map((t: any) => (
                                <div key={t.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 hover:border-primary/30 transition-all group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${t.priority === 'High' ? 'bg-red-500/20 text-red-400' : t.priority === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>{t.priority}</span>
                                        <button onClick={() => deleteTask.mutate(t.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-1">{t.title}</h4>
                                    <p className="text-xs text-slate-500 mb-3">{(Array.isArray(employees) ? employees : []).find((e: any) => e.id === t.assigneeId)?.name || 'Unassigned'}</p>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-200/60">
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500"><Clock className="w-3 h-3" /> {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '-'}</div>
                                        {status !== 'Done' && (
                                            <button onClick={() => updateTask.mutate({ id: t.id, data: { status: status === 'To Do' ? 'In Progress' : 'Done' } })} className="text-primary hover:text-white transition-colors">
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <div className="bg-white/80 backdrop-blur-sm border border-slate-200 rounded-[2rem] w-full max-w-md p-8 shadow-xl shadow-slate-200/50 space-y-4">
                        <div className="flex justify-between">
                            <h3 className="font-bold text-slate-800 text-xl">Create Task</h3>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-slate-500" /></button>
                        </div>
                        <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Task Title" className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-primary focus:outline-none" />
                        <select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })} className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-primary focus:outline-none appearance-none">
                            <option value="">Assign To...</option>
                            {(Array.isArray(employees) ? employees : []).map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-primary focus:outline-none" />
                            <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="bg-gradient-to-br from-slate-50 to-blue-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:border-primary focus:outline-none appearance-none">
                                <option value="Low">Low Priority</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                        <button onClick={handleSave} disabled={createTask.isPending} className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-glow mt-4">
                            {createTask.isPending ? 'Creating...' : 'Create'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
