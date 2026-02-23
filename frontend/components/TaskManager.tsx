import React, { useState } from 'react';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks';
import { useEmployees } from '../hooks/useHR';
import { TableSkeleton, InlineError } from './ui/Skeleton';
import {
    Plus, CheckCircle, Clock, Trash2, X, MoreHorizontal,
    CalendarToday, ChatBubbleOutline, AttachFile,
    Calendar as CalendarIcon, MessageSquare, Paperclip,
    CheckSquare, Search, Filter, ChevronDown, Trello, List
} from 'lucide-react';
import toast from 'react-hot-toast';

// Simple drag & drop handles can be added later, for now we keep the layout visually matching Kanban
export const TaskManager: React.FC = () => {
    const { data, isLoading, isError, error, refetch } = useTasks();
    const { data: empData } = useEmployees();
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', status: 'To Do', priority: 'Medium', assigneeId: '', dueDate: '' });

    const tasks = Array.isArray(data?.data || data) ? (data?.data || data) : [];
    const employees = Array.isArray(empData?.data || empData) ? (empData?.data || empData) : [];

    const handleSave = () => {
        if (form.title && form.assigneeId) {
            createTask.mutate(
                { ...form, dueDate: form.dueDate || new Date().toISOString().split('T')[0] },
                {
                    onSuccess: () => {
                        setShowModal(false);
                        setForm({ title: '', status: 'To Do', priority: 'Medium', assigneeId: '', dueDate: '' });
                        toast.success("Task created");
                    }
                }
            );
        } else {
            toast.error("Please provide a title and assignee");
        }
    };

    if (isLoading) return <div className="h-full p-10"><TableSkeleton /></div>;
    if (isError) return <div className="h-full p-10"><InlineError message={(error as Error)?.message || 'Failed to load tasks'} onRetry={refetch} /></div>;

    const todoTasks = tasks.filter((t: any) => t.status === 'To Do');
    const inProgressTasks = tasks.filter((t: any) => t.status === 'In Progress');
    const doneTasks = tasks.filter((t: any) => t.status === 'Done');

    // Utility to parse priority colors
    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-800';
            case 'Medium': return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800';
            case 'Low': return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
            default: return 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
        }
    };

    const getAssignee = (id: string) => employees.find((e: any) => e.id === id);

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark font-display">
            {/* Header Section */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-10 transition-colors">
                {/* Top Bar */}
                <div className="px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Project Board</h1>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold">Active</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage project tasks and workflows.</p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        {/* Team Avatars Simulator */}
                        <div className="flex -space-x-2 mr-2">
                            {employees.slice(0, 3).map((e: any, i: number) => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase overflow-hidden" title={e.name}>
                                    {e.profilePictureUrl ? <img src={e.profilePictureUrl} className="w-full h-full object-cover" alt={e.name} /> : e.name.substring(0, 2)}
                                </div>
                            ))}
                            {employees.length > 3 && (
                                <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 text-slate-600 text-xs font-medium">+{employees.length - 3}</div>
                            )}
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="ml-2 flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-blue-500/20 whitespace-nowrap"
                        >
                            <Plus className="w-5 h-5" />
                            Create Task
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="px-6 pb-4 flex flex-col md:flex-row gap-3 items-center justify-between overflow-x-auto hide-scroll">
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group shrink-0">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                className="pl-10 pr-4 py-2 w-64 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-shadow"
                                placeholder="Search tasks..."
                                type="text"
                            />
                        </div>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-lg transition-all whitespace-nowrap shrink-0">
                            <Filter className="w-4 h-4 text-slate-400" /> Filter
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <span>Assignee</span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                            <span>Priority</span>
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Kanban Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden kanban-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex h-full gap-6 min-w-[1000px]">

                    {/* Column: To Do */}
                    <KanbanColumn
                        title="To Do"
                        count={todoTasks.length}
                        tasks={todoTasks}
                        getPriorityColor={getPriorityColor}
                        getAssignee={getAssignee}
                        onDelete={(id: string) => deleteTask.mutate(id)}
                        onComplete={(id: string) => updateTask.mutate({ id, data: { status: 'In Progress' } })}
                        badgeColor="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                        onAdd={() => { setForm(prev => ({ ...prev, status: 'To Do' })); setShowModal(true); }}
                    />

                    {/* Column: In Progress */}
                    <KanbanColumn
                        title="In Progress"
                        count={inProgressTasks.length}
                        tasks={inProgressTasks}
                        getPriorityColor={getPriorityColor}
                        getAssignee={getAssignee}
                        onDelete={(id: string) => deleteTask.mutate(id)}
                        onComplete={(id: string) => updateTask.mutate({ id, data: { status: 'Done' } })}
                        badgeColor="bg-primary/10 text-primary"
                        columnBorder="border-t-2 border-t-primary"
                        onAdd={() => { setForm(prev => ({ ...prev, status: 'In Progress' })); setShowModal(true); }}
                    />

                    {/* Column: Done */}
                    <KanbanColumn
                        title="Completed"
                        count={doneTasks.length}
                        tasks={doneTasks}
                        getPriorityColor={getPriorityColor}
                        getAssignee={getAssignee}
                        onDelete={(id: string) => deleteTask.mutate(id)}
                        onComplete={(id: string) => updateTask.mutate({ id, data: { status: 'To Do' } })} // back to to-do? 
                        badgeColor="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                        columnBorder="border-t-2 border-t-emerald-500"
                        isCompletedCol={true}
                        onAdd={() => { setForm(prev => ({ ...prev, status: 'Done' })); setShowModal(true); }}
                    />

                </div>
            </div>

            {/* Create Task Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Create Task</h3>
                            <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Task Title *</label>
                                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Update architectural drafts" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" autoFocus />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Assignee *</label>
                                <select value={form.assigneeId} onChange={e => setForm({ ...form, assigneeId: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none">
                                    <option value="">Select team member...</option>
                                    {employees.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none">
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Done">Completed</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Due Date</label>
                                    <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Priority</label>
                                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none">
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancel</button>
                            <button onClick={handleSave} disabled={createTask.isPending} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm">
                                {createTask.isPending ? 'Saving...' : 'Create Task'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Subcomponent for each Kanban Column
const KanbanColumn = ({ title, count, tasks, getPriorityColor, getAssignee, onDelete, onComplete, badgeColor, columnBorder = "", isCompletedCol = false, onAdd }: any) => {
    return (
        <div className={`flex flex-col w-[320px] shrink-0 bg-slate-50/50 dark:bg-slate-900/10 rounded-xl p-2 h-full ${columnBorder ? 'pt-4 ' + columnBorder : 'pt-4 border-transparent'}`}>
            <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h3>
                    <span className={`${badgeColor} text-xs font-semibold px-2 py-0.5 rounded-full`}>{count}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar pb-4 min-h-[500px]">
                {tasks.map((t: any) => {
                    const assignee = getAssignee(t.assigneeId);

                    if (isCompletedCol) {
                        return (
                            <div key={t.id} className="group bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm opacity-80 hover:opacity-100 transition-all">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide decoration-slate-400 line-through">TK-{t.id.substring(0, 4)}</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onDelete(t.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                        <button onClick={() => onComplete(t.id)} title="Reopen Task" className="text-emerald-500 hover:text-slate-400"><CheckCircle className="w-4 h-4" /></button>
                                    </div>
                                    {!t.id && <CheckCircle className="w-4 h-4 text-emerald-500 group-hover:hidden" />}
                                </div>
                                <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-3 line-through decoration-slate-400">{t.title}</h4>
                                <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700/50 pt-3">
                                    {assignee ? (
                                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500 grayscale uppercase border border-white dark:border-slate-800" title={assignee.name}>
                                            {assignee.name.substring(0, 2)}
                                        </div>
                                    ) : (
                                        <div className="text-[10px] text-slate-400">Unassigned</div>
                                    )}
                                    <span className="text-[10px] text-slate-400">{t.dueDate ? new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}</span>
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={t.id} className="group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing relative overflow-hidden">
                            {/* Color strip on left if high priority */}
                            {t.priority === 'High' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500"></div>}

                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wide">TK-{t.id.substring(0, 4)}</span>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                    <button onClick={() => onDelete(t.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                                    <button onClick={() => onComplete(t.id)} className="text-slate-400 hover:text-emerald-500"><CheckCircle className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3 leading-snug">{t.title}</h4>

                            <div className="flex items-center gap-2 mb-4">
                                <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(t.priority)}`}>
                                    {t.priority}
                                </span>
                                {t.dueDate && (
                                    <div className="flex items-center gap-1 text-slate-400 text-xs bg-slate-50 dark:bg-slate-700/50 px-2 py-1 rounded w-fit">
                                        <CalendarIcon className="w-3 h-3" />
                                        <span>{new Date(t.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-3">
                                {assignee ? (
                                    <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-600 dark:text-slate-300 font-bold uppercase shadow-sm border border-slate-100 dark:border-slate-600" title={assignee.name}>
                                        {assignee.profilePictureUrl ? <img src={assignee.profilePictureUrl} className="w-full h-full rounded-full object-cover" alt={assignee.name} /> : assignee.name.substring(0, 2)}
                                    </div>
                                ) : (
                                    <div className="text-[10px] text-slate-400 italic">Unassigned</div>
                                )}

                                <div className="flex items-center gap-3 text-slate-400">
                                    <div className="flex items-center gap-1 text-xs" title="1 attachment">
                                        <Paperclip className="w-3.5 h-3.5" />
                                        <span>{Math.floor(Math.random() * 3)}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs" title="2 comments">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>{Math.floor(Math.random() * 5)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={onAdd}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium mt-1 bg-white dark:bg-slate-800 shadow-sm group"
                >
                    <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> Add Task
                </button>
            </div>
        </div>
    );
};
