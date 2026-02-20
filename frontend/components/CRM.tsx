
import React, { useState } from 'react';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead } from '../hooks/useLeads';
import { Lead } from '../types';
import { Plus, Search, FileText, Upload, MoreVertical, Trash2, DollarSign, IndianRupee, Save, Calendar, Globe, Briefcase, Edit2, X } from 'lucide-react';
import { TableSkeleton, InlineError } from './ui/Skeleton';

export const CRM: React.FC = () => {
    const { data: leadsData, isLoading, isError, error, refetch } = useLeads();
    const createLead = useCreateLead();
    const updateLeadMut = useUpdateLead();
    const deleteLeadMut = useDeleteLead();
    const leads: Lead[] = Array.isArray(leadsData?.data || leadsData) ? (leadsData?.data || leadsData) : [];
    const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [isCustomSource, setIsCustomSource] = useState(false);

    // Create Form State
    const [form, setForm] = useState<Partial<Lead>>({ companyName: '', pocName: '', value: 0, source: 'Website', type: 'Inbound', requirements: '', files: [], gstNumber: '' });

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Lead | null>(null);

    const columns: Lead['status'][] = ['New', 'Negotiation', 'Won', 'Lost'];

    const handleCreate = () => {
        if (!form.pocName || !form.value) return;
        createLead.mutate({
            ...form,
            status: 'New',
            lastContact: new Date().toLocaleDateString(),
            files: [],
            dateReceived: new Date().toLocaleDateString()
        } as any, {
            onSuccess: () => {
                setShowAdd(false);
                setForm({ companyName: '', pocName: '', value: 0, source: 'Website', type: 'Inbound', requirements: '', gstNumber: '' });
                setIsCustomSource(false);
            }
        });
    };

    const handleUpdate = () => {
        if (editForm && selectedLead) {
            updateLeadMut.mutate({ id: selectedLead.id, data: editForm }, {
                onSuccess: () => { setSelectedLead(editForm); setIsEditing(false); }
            });
        }
    };

    const startEdit = () => {
        setEditForm(JSON.parse(JSON.stringify(selectedLead))); // Deep copy
        setIsEditing(true);
    };

    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('leadId', id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, status: Lead['status']) => {
        const id = e.dataTransfer.getData('leadId');
        if (id) {
            updateLeadMut.mutate({ id, data: { status } });
        }
    };

    if (isLoading) return <div className="h-full p-10"><TableSkeleton /></div>;
    if (isError) return <div className="h-full p-10"><InlineError message={(error as Error)?.message || 'Failed to load leads'} onRetry={refetch} /></div>;

    return (
        <div className="h-full flex flex-col p-4 md:p-8 bg-background-dark overflow-hidden">
            <div className="flex justify-between items-end mb-8">
                <div><h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">CRM Pipeline</h2><p className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1">Managed Lead Management</p></div>
                <button onClick={() => setShowAdd(true)} className="px-6 md:px-8 py-3 bg-primary text-black rounded-full font-black text-xs uppercase tracking-widest shadow-glow hover:scale-105 transition-all transform flex items-center gap-2 whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Capture Lead
                </button>
            </div>

            <div className="flex-1 overflow-x-auto flex gap-6 pb-6 items-start h-full snap-x snap-mandatory">
                {columns.map(col => (
                    <div
                        key={col}
                        className="w-[85vw] md:w-80 h-full flex flex-col shrink-0 bg-surface-darker/50 rounded-3xl border border-white/5 p-4 snap-center"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col)}
                    >
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 px-2 flex justify-between sticky top-0">
                            {col}
                            <span className="bg-white/10 px-2 py-0.5 rounded-full text-white">{leads.filter(l => l.status === col).length}</span>
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                            {leads.filter(l => l.status === col).map(l => (
                                <div
                                    key={l.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, l.id)}
                                    onClick={() => setSelectedLead(l)}
                                    className="bg-surface-dark border border-white/5 p-5 rounded-2xl hover:border-primary/50 transition-all cursor-grab active:cursor-grabbing group shadow-lg relative"
                                >
                                    <div className="flex justify-between mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${l.type === 'Inbound' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-purple-500/10 text-purple-500 border-purple-500/20'}`}>{l.type}</span>
                                        <button onClick={(e) => { e.stopPropagation(); deleteLeadMut.mutate(l.id); }} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-red-500 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-0.5 leading-tight truncate">{l.companyName || l.pocName}</h4>
                                    <p className="text-zinc-500 text-xs mb-4 truncate">{l.pocName}</p>

                                    {l.source && <p className="text-[10px] text-zinc-600 mb-2 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-zinc-500"></span> Via {l.source}</p>}

                                    <div className="flex justify-between items-end pt-3 border-t border-white/5">
                                        <p className="text-primary font-mono font-bold text-sm">{formatCurrency(l.value)}</p>
                                        <p className="text-[10px] text-zinc-600 font-bold">{l.lastContact}</p>
                                    </div>
                                </div>
                            ))}
                            {leads.filter(l => l.status === col).length === 0 && (
                                <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-zinc-700 text-xs font-bold uppercase tracking-widest">
                                    Drop Here
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lead Detail / Edit Modal */}
            {selectedLead && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] w-full max-w-4xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
                        <div className="p-8 border-b border-white/10 flex justify-between items-start shrink-0">
                            <div className="flex-1 mr-8">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <input value={editForm?.companyName} onChange={e => setEditForm({ ...editForm!, companyName: e.target.value })} className="text-3xl font-black text-white uppercase bg-transparent border-b border-white/10 w-full focus:outline-none focus:border-primary" placeholder="Company Name" />
                                        <div className="flex gap-4">
                                            <input value={editForm?.pocName} onChange={e => setEditForm({ ...editForm!, pocName: e.target.value })} className="bg-transparent border-b border-white/10 text-sm text-white focus:outline-none focus:border-primary w-full" placeholder="Contact Name" />
                                            <input value={editForm?.email} onChange={e => setEditForm({ ...editForm!, email: e.target.value })} className="bg-transparent border-b border-white/10 text-sm text-white focus:outline-none focus:border-primary w-full" placeholder="Email" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <h3 className="text-3xl font-black text-white mb-1 uppercase tracking-tight">{selectedLead.companyName || selectedLead.pocName}</h3>
                                        <div className="text-zinc-500 text-sm font-bold flex gap-2">
                                            {selectedLead.pocName} • {selectedLead.email}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <button onClick={handleUpdate} className="px-4 py-2 bg-primary text-black rounded-full font-bold flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
                                ) : (
                                    <button onClick={startEdit} className="px-4 py-2 bg-white/5 text-white rounded-full hover:bg-white/10 font-bold flex items-center gap-2"><Edit2 className="w-4 h-4" /> Edit</button>
                                )}
                                <button onClick={() => { setSelectedLead(null); setIsEditing(false); }} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                            {/* Status & Value */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="bg-surface-darker p-5 rounded-2xl border border-white/5">
                                    <p className="text-zinc-500 text-[10px] uppercase font-black mb-2 tracking-widest">Project Value</p>
                                    {isEditing ? <input type="number" value={editForm?.value} onChange={e => setEditForm({ ...editForm!, value: Number(e.target.value) })} className="bg-transparent border-b border-white/10 text-primary font-bold text-xl w-full focus:outline-none" /> : <p className="text-2xl font-bold text-primary">{formatCurrency(selectedLead.value)}</p>}
                                </div>
                                <div className="bg-surface-darker p-5 rounded-2xl border border-white/5">
                                    <p className="text-zinc-500 text-[10px] uppercase font-black mb-2 tracking-widest">Stage</p>
                                    {isEditing ? (
                                        <select value={editForm?.status} onChange={e => setEditForm({ ...editForm!, status: e.target.value as any })} className="bg-transparent border-b border-white/10 text-white w-full focus:outline-none">
                                            {columns.map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                                        </select>
                                    ) : <p className="text-2xl font-bold text-white">{selectedLead.status}</p>}
                                </div>
                                <div className="bg-surface-darker p-5 rounded-2xl border border-white/5">
                                    <p className="text-zinc-500 text-[10px] uppercase font-black mb-2 tracking-widest">Source</p>
                                    {isEditing ? <input value={editForm?.source} onChange={e => setEditForm({ ...editForm!, source: e.target.value })} className="bg-transparent border-b border-white/10 text-white w-full focus:outline-none" /> : <p className="text-lg font-bold text-white">{selectedLead.source}</p>}
                                </div>
                                <div className="bg-surface-darker p-5 rounded-2xl border border-white/5">
                                    <p className="text-zinc-500 text-[10px] uppercase font-black mb-2 tracking-widest">Type</p>
                                    {isEditing ? (
                                        <select value={editForm?.type} onChange={e => setEditForm({ ...editForm!, type: e.target.value as any })} className="bg-transparent border-b border-white/10 text-white w-full focus:outline-none">
                                            <option value="Inbound" className="text-black">Inbound</option>
                                            <option value="Outbound" className="text-black">Outbound</option>
                                            <option value="Referral" className="text-black">Referral</option>
                                        </select>
                                    ) : <p className="text-lg font-bold text-white">{selectedLead.type}</p>}
                                </div>
                            </div>

                            {/* Detailed Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="text-zinc-400 font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2"><Briefcase className="w-4 h-4" /> Requirements & Brief</h4>
                                    {isEditing ? (
                                        <textarea value={editForm?.requirements} onChange={e => setEditForm({ ...editForm!, requirements: e.target.value })} className="w-full bg-background-dark p-4 rounded-2xl border border-white/5 text-zinc-300 h-40 focus:outline-none focus:border-primary resize-none" />
                                    ) : (
                                        <div className="bg-background-dark p-6 rounded-2xl border border-white/5 text-zinc-300 leading-relaxed min-h-[160px] text-sm whitespace-pre-wrap">
                                            {selectedLead.requirements || 'No specific requirements recorded.'}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-zinc-400 font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2"><FileText className="w-4 h-4" /> Additional Notes</h4>
                                        {isEditing ? (
                                            <textarea value={editForm?.notes} onChange={e => setEditForm({ ...editForm!, notes: e.target.value })} className="w-full bg-background-dark p-4 rounded-2xl border border-white/5 text-zinc-300 h-24 focus:outline-none focus:border-primary resize-none" placeholder="Internal notes..." />
                                        ) : (
                                            <p className="text-zinc-400 text-sm italic">{selectedLead.notes || 'No notes.'}</p>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-zinc-400 font-bold mb-4 uppercase text-xs tracking-widest flex items-center gap-2"><Upload className="w-4 h-4" /> Attachments</h4>
                                        {selectedLead.files && selectedLead.files.length > 0 ? (
                                            <div className="flex flex-wrap gap-3">
                                                {selectedLead.files.map((f, i) => (
                                                    <div key={i} className="px-4 py-3 bg-white/5 rounded-xl border border-white/10 text-xs font-bold text-white flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-primary" /> {f}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-zinc-600 text-xs italic">No files attached.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Capture Lead Modal - kept same as before but ensured robust */}
            {showAdd && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
                    <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] w-full max-w-xl shadow-2xl p-6 md:p-10 space-y-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight">Capture Lead</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">POC Name</label>
                                <input value={form.pocName} onChange={e => setForm({ ...form, pocName: e.target.value })} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Full Name" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Company (Optional)</label>
                                <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" placeholder="Business Name" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Lead Source</label>
                                {!isCustomSource ? (
                                    <div className="relative">
                                        <select value={form.source} onChange={e => {
                                            if (e.target.value === 'custom') setIsCustomSource(true);
                                            else setForm({ ...form, source: e.target.value });
                                        }} className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary appearance-none">
                                            <option value="Website">Website</option>
                                            <option value="Social Media">Social Media</option>
                                            <option value="Referral">Referral (Friend)</option>
                                            <option value="Walk-in">Walk-in</option>
                                            <option value="custom" className="text-primary font-bold">+ Custom Source</option>
                                        </select>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                        <input autoFocus placeholder="Enter Source" onChange={e => setForm({ ...form, source: e.target.value })} className="flex-1 bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary" />
                                        <button onClick={() => setIsCustomSource(false)} className="px-3 bg-white/10 rounded-xl text-xs hover:bg-white/20">Reset</button>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Est. Value</label>
                                <div className="relative">
                                    <input type="number" value={form.value || ''} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="w-full bg-background-dark border border-white/10 rounded-xl pl-4 pr-3 py-3 text-white focus:outline-none focus:border-primary" placeholder="0.00" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] uppercase font-bold text-zinc-500 ml-2">Requirements / Details</label>
                            <textarea onChange={e => setForm({ ...form, requirements: e.target.value })} placeholder="Project scope, product interests, deadlines..." className="w-full bg-background-dark border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary h-24" />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button onClick={() => setShowAdd(false)} className="flex-1 py-3 bg-white/10 rounded-xl font-bold text-white hover:bg-white/10 transition-colors">Cancel</button>
                            <button onClick={handleCreate} className="flex-1 py-3 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-xl shadow-glow">Save Lead</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
