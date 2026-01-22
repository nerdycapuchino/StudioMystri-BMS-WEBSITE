
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Task } from '../types';
import { Plus, CheckCircle, Circle, Clock, Trash2, X } from 'lucide-react';

export const TaskManager: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, employees } = useGlobal();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Partial<Task>>({ title: '', status: 'To Do', priority: 'Medium', assigneeId: '' });

  const handleSave = () => {
      if (form.title && form.assigneeId) {
          addTask({
              id: Math.random().toString(36).substr(2, 9),
              title: form.title,
              assigneeId: form.assigneeId,
              dueDate: form.dueDate || new Date().toISOString().split('T')[0],
              status: 'To Do',
              priority: form.priority as any
          });
          setShowModal(false);
          setForm({ title: '', status: 'To Do', priority: 'Medium', assigneeId: '' });
      }
  };

  return (
    <div className="h-full flex flex-col p-6 md:p-10 bg-background-dark">
      <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-black text-white tracking-tighter">Task Manager</h2>
         <button onClick={() => setShowModal(true)} className="px-6 py-3 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full shadow-glow flex items-center gap-2">
            <Plus className="w-4 h-4"/> New Task
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-y-auto">
          {['To Do', 'In Progress', 'Done'].map(status => (
              <div key={status} className="bg-surface-dark border border-white/5 rounded-2xl p-4 flex flex-col h-full">
                  <h3 className="text-xs font-black uppercase text-zinc-500 mb-4 px-2">{status}</h3>
                  <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                      {tasks.filter(t => t.status === status).map(t => (
                          <div key={t.id} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-primary/30 transition-all group relative">
                              <div className="flex justify-between items-start mb-2">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${t.priority === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>{t.priority}</span>
                                  <button onClick={() => deleteTask(t.id)} className="text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3"/></button>
                              </div>
                              <h4 className="font-bold text-white mb-1">{t.title}</h4>
                              <p className="text-xs text-zinc-500 mb-3">{employees.find(e => e.id === t.assigneeId)?.name || 'Unassigned'}</p>
                              
                              <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-400"><Clock className="w-3 h-3"/> {t.dueDate}</div>
                                  {status !== 'Done' && (
                                      <button onClick={() => updateTask(t.id, { status: status === 'To Do' ? 'In Progress' : 'Done' })} className="text-primary hover:text-white transition-colors">
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
              <div className="bg-surface-dark border border-white/10 rounded-[2rem] w-full max-w-md p-8 shadow-2xl space-y-4">
                  <div className="flex justify-between">
                      <h3 className="font-bold text-white text-xl">Create Task</h3>
                      <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-zinc-500"/></button>
                  </div>
                  <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Task Title" className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none" />
                  <select value={form.assigneeId} onChange={e => setForm({...form, assigneeId: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none appearance-none">
                      <option value="">Assign To...</option>
                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                  <div className="grid grid-cols-2 gap-4">
                      <input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} className="bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none" />
                      <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})} className="bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:border-primary focus:outline-none appearance-none">
                          <option value="Low">Low Priority</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                      </select>
                  </div>
                  <button onClick={handleSave} className="w-full py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-glow mt-4">Create</button>
              </div>
          </div>
      )}
    </div>
  );
};
