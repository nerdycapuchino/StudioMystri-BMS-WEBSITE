import React, { useState, useMemo } from 'react';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, useConvertLeadToProject } from '../hooks/useLeads';
import { Lead } from '../types';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Grid, Home, Building2, Wrench, MoreHorizontal, Calendar, Trash2, Edit2, X, AlertCircle, Save, CheckCircle, XCircle, Rocket } from 'lucide-react';
import { TableSkeleton, InlineError } from './ui/Skeleton';

export const CRM: React.FC = () => {
    const { data: leadsData, isLoading, isError, error, refetch } = useLeads();
    const createLead = useCreateLead();
    const updateLeadMut = useUpdateLead();
    const deleteLeadMut = useDeleteLead();
    const convertLeadMut = useConvertLeadToProject();
    const leads: Lead[] = Array.isArray(leadsData?.data || leadsData) ? (leadsData?.data || leadsData) : [];

    const formatCurrency = (amount: number) => {
        // Keeping it generic or matching the template's compact styling
        if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
        if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}k`;
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
    };

    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [isCustomSource, setIsCustomSource] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');

    // Create Form State
    const [form, setForm] = useState<Partial<Lead>>({ companyName: '', pocName: '', value: 0, source: 'Website', type: 'Inbound', requirements: '', files: [], gstNumber: '' });

    // Edit Mode State
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<Lead | null>(null);

    // Columns mapping to match template
    const columns: Record<string, { label: string, color: string, style: 'normal' | 'won' | 'lost' }> = {
        'New': { label: 'Leads', color: 'blue', style: 'normal' },
        'Negotiation': { label: 'Negotiation', color: 'red', style: 'normal' },
        'Initial Meeting': { label: 'Initial Meeting', color: 'orange', style: 'normal' },
        'Drafting': { label: 'Proposal', color: 'slate', style: 'normal' },
        'Won': { label: 'Won', color: 'green', style: 'won' },
        'Lost': { label: 'Lost', color: 'slate', style: 'lost' }
    };

    // Actual system statuses. We'll map them visually if needed, but 'New', 'Negotiation', 'Won', 'Lost' are system defaults.
    // To match template, we'll keep the system's simple statuses but render them nicely.
    const activeColumns = ['New', 'Negotiation', 'Won', 'Lost'];

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

    const handleConvert = () => {
        if (!selectedLead) return;
        if (!confirm(`Are you sure you want to convert "${selectedLead.companyName || selectedLead.pocName}" to a project?`)) return;
        convertLeadMut.mutate(selectedLead.id, {
            onSuccess: () => {
                setSelectedLead(null);
            }
        });
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

    const handleDrop = (e: React.DragEvent, status: any) => {
        const id = e.dataTransfer.getData('leadId');
        if (id) {
            updateLeadMut.mutate({ id, data: { status } });
        }
    };

    const filteredLeads = useMemo(() => {
        return leads.filter(l => {
            const matchesSearch = (l.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (l.pocName || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filterType === 'All' || l.type === filterType;
            return matchesSearch && matchesFilter;
        });
    }, [leads, searchTerm, filterType]);

    const totalValue = useMemo(() => leads.reduce((acc, l) => acc + (l.status !== 'Lost' ? (l.value || 0) : 0), 0), [leads]);
    const wonCount = leads.filter(l => l.status === 'Won').length;
    const closedCount = leads.filter(l => l.status === 'Won' || l.status === 'Lost').length;
    const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;
    const openDeals = leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').length;
    const avgDeal = openDeals > 0 ? (leads.filter(l => l.status !== 'Won' && l.status !== 'Lost').reduce((acc, l) => acc + (l.value || 0), 0) / openDeals) : 0;

    if (isLoading) return <div className="h-full p-10"><TableSkeleton /></div>;
    if (isError) return <div className="h-full p-10"><InlineError message={(error as Error)?.message || 'Failed to load pipeline'} onRetry={refetch} /></div>;

    const renderCard = (l: Lead, isWonLostColumn = false) => {
        const cConfig = columns[l.status] || columns['New'];

        if (l.status === 'Won') {
            return (
                <div
                    key={l.id}
                    onClick={() => setSelectedLead(l)}
                    className="group bg-emerald-50/50 dark:bg-emerald-900/10 p-4 rounded-xl shadow-sm border border-emerald-200 dark:border-emerald-900/50 cursor-pointer hover:shadow-md transition-all relative overflow-hidden"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Won
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); deleteLeadMut.mutate(l.id); }} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/50 rounded z-10">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1 truncate pr-6">{l.companyName || l.pocName}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 truncate">{l.pocName}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-emerald-100 dark:border-emerald-900/30">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{l.lastContact}</span>
                        <span className="text-emerald-700 dark:text-emerald-400 font-bold text-sm">{formatCurrency(l.value)}</span>
                    </div>
                </div>
            );
        }

        if (l.status === 'Lost') {
            return (
                <div
                    key={l.id}
                    onClick={() => setSelectedLead(l)}
                    className="group bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 grayscale opacity-60 hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer relative"
                >
                    <div className="flex justify-between items-start mb-2">
                        <span className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Lost
                        </span>
                        <button onClick={(e) => { e.stopPropagation(); deleteLeadMut.mutate(l.id); }} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-white/50 rounded z-10">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1 truncate">{l.companyName || l.pocName}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 truncate">{l.pocName}</p>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                        <span className="text-xs text-slate-500 dark:text-slate-400">{l.lastContact}</span>
                        <span className="text-slate-500 dark:text-slate-400 font-bold text-sm">{formatCurrency(l.value)}</span>
                    </div>
                </div>
            );
        }

        // Active statuses (New, Negotiation)
        const typeColors: Record<string, string> = {
            'Inbound': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
            'Outbound': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
            'Referral': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
        };
        const defaultColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

        return (
            <div
                key={l.id}
                draggable
                onDragStart={(e) => handleDragStart(e, l.id)}
                onClick={() => setSelectedLead(l)}
                className={`group bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 cursor-grab active:cursor-grabbing transition-all hover:border-primary/50 ${l.status === 'Negotiation' ? 'border-l-4 border-l-primary' : ''}`}
            >
                <div className="flex justify-between items-start mb-2">
                    <span className={`${typeColors[l.type] || defaultColor} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide`}>
                        {l.type}
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); deleteLeadMut.mutate(l.id); }} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-slate-50 dark:bg-slate-700 rounded z-10 tooltip" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="text-slate-400 cursor-grab p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1 truncate pr-2">{l.companyName || l.pocName}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3 truncate">{l.requirements ? l.requirements : l.pocName}</p>

                {l.status === 'Negotiation' && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                        <AlertCircle className="w-3.5 h-3.5" />
                        Action Required
                    </div>
                )}

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300 uppercase shrink-0">
                            {l.pocName.substring(0, 2)}
                        </div>
                        <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{l.lastContact}</span>
                    </div>
                    <span className="text-primary font-bold text-sm shrink-0 ml-2">{formatCurrency(l.value)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">

            {/* Header Section */}
            <header className="flex-none px-6 md:px-8 py-6 flex flex-col gap-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 z-10 shrink-0">
                {/* Title and Primary Actions */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Opportunities Pipeline</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage potential contracts from lead to signed deal.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                                <Search className="w-5 h-5" />
                            </span>
                            <input
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="h-10 pl-10 pr-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:border-primary focus:ring-1 focus:ring-primary w-full md:w-64 outline-none text-slate-900 dark:text-white"
                                placeholder="Search opportunities..."
                            />
                        </div>
                        <button className="hidden sm:flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors text-sm font-semibold shadow-sm">
                            <Filter className="w-5 h-5" />
                            <span>Filter</span>
                        </button>
                        <button onClick={() => setShowAdd(true)} className="flex items-center justify-center gap-2 rounded-lg h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-colors text-sm font-bold shadow-sm whitespace-nowrap">
                            <Plus className="w-5 h-5" />
                            <span>New Opportunity</span>
                        </button>
                    </div>
                </div>

                {/* KPI Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Total Pipeline Value</p>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-slate-900 dark:text-white text-xl md:text-2xl font-black">{formatCurrency(totalValue)}</p>
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">+12%</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Open Deals</p>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-slate-900 dark:text-white text-xl md:text-2xl font-black">{openDeals}</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Win Rate</p>
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-slate-900 dark:text-white text-xl md:text-2xl font-black">{winRate}%</p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Avg Deal Size</p>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-slate-900 dark:text-white text-xl md:text-2xl font-black">{formatCurrency(avgDeal)}</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 w-full overflow-x-auto hide-scroll pb-1">
                    <button onClick={() => setFilterType('All')} className={`flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors whitespace-nowrap ${filterType === 'All' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Grid className="w-4 h-4" /> All Leads
                    </button>
                    <button onClick={() => setFilterType('Inbound')} className={`flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors whitespace-nowrap ${filterType === 'Inbound' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Home className="w-4 h-4" /> Inbound
                    </button>
                    <button onClick={() => setFilterType('Outbound')} className={`flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors whitespace-nowrap ${filterType === 'Outbound' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Building2 className="w-4 h-4" /> Outbound
                    </button>
                    <button onClick={() => setFilterType('Referral')} className={`flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors whitespace-nowrap ${filterType === 'Referral' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Wrench className="w-4 h-4" /> Referral
                    </button>
                </div>
            </header>

            {/* Kanban Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 md:p-8 custom-scrollbar">
                <div className="flex h-full gap-6 min-w-max pb-4">
                    {/* Active Columns (New, Negotiation) */}
                    {['New', 'Negotiation'].map(col => {
                        const colLeads = filteredLeads.filter(l => l.status === col);
                        return (
                            <div
                                key={col}
                                className="flex flex-col w-80 shrink-0"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, col)}
                            >
                                <div className="flex items-center justify-between mb-4 px-1">
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">{columns[col].label}</h3>
                                        <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">{colLeads.length}</span>
                                    </div>
                                </div>
                                <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                                    {colLeads.map(l => renderCard(l))}
                                    {colLeads.length === 0 && (
                                        <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                            Drop Here
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => setShowAdd(true)} className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors text-sm font-medium">
                                    <Plus className="w-4 h-4" /> Add Lead
                                </button>
                            </div>
                        )
                    })}

                    {/* Won/Lost Column */}
                    <div
                        className="flex flex-col w-80 shrink-0 opacity-80 hover:opacity-100 transition-opacity"
                        onDragOver={handleDragOver}
                        onDrop={(e) => {
                            // On drop into this column, normally you'd prompt or it's just a combined view
                            // We will default drop to Won, but UI should ideally differentiate
                            handleDrop(e, 'Won');
                        }}
                    >
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">Won / Lost</h3>
                                <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">{filteredLeads.filter(l => l.status === 'Won' || l.status === 'Lost').length}</span>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                            {filteredLeads.filter(l => l.status === 'Won' || l.status === 'Lost').map(l => renderCard(l, true))}
                            {filteredLeads.filter(l => l.status === 'Won' || l.status === 'Lost').length === 0 && (
                                <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                    No Closed Deals
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* View/Edit Lead Modal */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-start bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
                            <div className="flex-1 pr-6">
                                {isEditing ? (
                                    <div className="space-y-4">
                                        <input value={editForm?.companyName || ''} onChange={e => setEditForm({ ...editForm!, companyName: e.target.value })} className="text-2xl font-black text-slate-900 dark:text-white uppercase bg-transparent border-b border-slate-300 dark:border-slate-600 w-full focus:outline-none focus:border-primary pb-1" placeholder="Company Name" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input value={editForm?.pocName || ''} onChange={e => setEditForm({ ...editForm!, pocName: e.target.value })} className="bg-transparent border-b border-slate-300 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary w-full pb-1" placeholder="Contact Name" />
                                            <input value={editForm?.email || ''} onChange={e => setEditForm({ ...editForm!, email: e.target.value })} className="bg-transparent border-b border-slate-300 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary w-full pb-1" placeholder="Email Address" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{selectedLead.companyName || selectedLead.pocName}</h3>
                                            <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${selectedLead.status === 'Won' ? 'bg-emerald-100 text-emerald-700' : selectedLead.status === 'Lost' ? 'bg-slate-200 text-slate-700' : 'bg-blue-100 text-blue-700'}`}>{selectedLead.status}</span>
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{selectedLead.pocName} {selectedLead.email ? `• ${selectedLead.email}` : ''}</p>
                                    </>
                                )}
                            </div>
                            <div className="flex gap-2 shrink-0">
                                {isEditing ? (
                                    <button onClick={handleUpdate} className="px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2 text-sm shadow-sm transition-colors"><Save className="w-4 h-4" /> Save</button>
                                ) : (
                                    <button onClick={startEdit} className="px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 font-bold flex items-center gap-2 text-sm transition-colors"><Edit2 className="w-4 h-4" /> Edit</button>
                                )}
                                {!isEditing && selectedLead.status !== 'Won' && (
                                    <button onClick={handleConvert} disabled={convertLeadMut.isPending} className="px-3 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/50 font-bold flex items-center gap-2 text-sm transition-colors border border-emerald-200 dark:border-emerald-800">
                                        <Rocket className="w-4 h-4" /> {convertLeadMut.isPending ? 'Converting...' : 'Convert to Project'}
                                    </button>
                                )}
                                <button onClick={() => { setSelectedLead(null); setIsEditing(false); }} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 hover:text-slate-900 transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1.5">Value</p>
                                    {isEditing ? <input type="number" value={editForm?.value} onChange={e => setEditForm({ ...editForm!, value: Number(e.target.value) })} className="bg-transparent border-b border-primary text-slate-900 dark:text-white font-bold text-lg w-full focus:outline-none" /> : <p className="text-lg font-bold text-primary">{formatCurrency(selectedLead.value)}</p>}
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1.5">Pipeline Stage</p>
                                    {isEditing ? (
                                        <select value={editForm?.status} onChange={e => setEditForm({ ...editForm!, status: e.target.value as any })} className="bg-transparent border-b border-primary text-slate-900 dark:text-white w-full focus:outline-none font-medium">
                                            {Object.keys(columns).map(c => <option key={c} value={c} className="text-slate-900">{c}</option>)}
                                        </select>
                                    ) : <p className="text-base font-bold text-slate-900 dark:text-white">{selectedLead.status}</p>}
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1.5">Source</p>
                                    {isEditing ? <input value={editForm?.source} onChange={e => setEditForm({ ...editForm!, source: e.target.value })} className="bg-transparent border-b border-primary text-slate-900 dark:text-white w-full focus:outline-none font-medium" /> : <p className="text-base font-bold text-slate-900 dark:text-white">{selectedLead.source}</p>}
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <p className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold tracking-widest mb-1.5">Lead Type</p>
                                    {isEditing ? (
                                        <select value={editForm?.type} onChange={e => setEditForm({ ...editForm!, type: e.target.value as any })} className="bg-transparent border-b border-primary text-slate-900 dark:text-white w-full focus:outline-none font-medium">
                                            <option value="Inbound" className="text-slate-900">Inbound</option>
                                            <option value="Outbound" className="text-slate-900">Outbound</option>
                                            <option value="Referral" className="text-slate-900">Referral</option>
                                        </select>
                                    ) : <p className="text-base font-bold text-slate-900 dark:text-white">{selectedLead.type}</p>}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2"><Building2 className="w-4 h-4" /> Requirements & Notes</h4>
                                {isEditing ? (
                                    <textarea value={editForm?.requirements || ''} onChange={e => setEditForm({ ...editForm!, requirements: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 min-h-[120px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-y" placeholder="Enter requirements or context..." />
                                ) : (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                                        {selectedLead.requirements || <span className="text-slate-400 italic">No notes recorded.</span>}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Lead Modal */}
            {showAdd && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg p-6 md:p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2"><Plus className="w-5 h-5 text-primary" /> New Opportunity</h3>
                            <button onClick={() => setShowAdd(false)} className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Client / POC Name *</label>
                                    <input value={form.pocName} onChange={e => setForm({ ...form, pocName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. John Smith" autoFocus />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Company (Optional)</label>
                                    <input value={form.companyName} onChange={e => setForm({ ...form, companyName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Acme Corp" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Lead Type</label>
                                    <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none">
                                        <option value="Inbound">Inbound</option>
                                        <option value="Outbound">Outbound</option>
                                        <option value="Referral">Referral</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estimated Value *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                        <input type="number" value={form.value || ''} onChange={e => setForm({ ...form, value: Number(e.target.value) })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-8 p-3 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" placeholder="0.00" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Requirements / Brief</label>
                                <textarea value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none min-h-[100px] resize-y" placeholder="Describe project scope, timeline, needs..." />
                            </div>
                        </div>

                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setShowAdd(false)} className="flex-1 py-3 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                            <button onClick={handleCreate} disabled={createLead.isPending || !form.pocName || !form.value} className="flex-1 py-3 px-4 bg-primary text-white font-bold rounded-lg hover:bg-blue-600 transition-colors shadow-sm shadow-primary/20 disabled:opacity-50 flex justify-center items-center gap-2">
                                {createLead.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div> : 'Create Lead'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
