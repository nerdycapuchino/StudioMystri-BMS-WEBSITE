import React, { useState, useMemo } from 'react';
import { useLeads, useCreateLead, useUpdateLead, useDeleteLead, useConvertLeadToProject } from '../hooks/useLeads';
import { Lead } from '../types';
import { Plus, Search, Filter, TrendingUp, TrendingDown, Grid, Home, Building2, Wrench, MoreHorizontal, Calendar, Trash2, Edit2, X, AlertCircle, Save, CheckCircle, XCircle, Rocket, GripVertical } from 'lucide-react';
import { TableSkeleton, InlineError } from './ui/Skeleton';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, DragStartEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export const CRM: React.FC = () => {
    const { data: leadsData, isLoading, isError, error, refetch } = useLeads();
    const createLead = useCreateLead();
    const updateLeadMut = useUpdateLead();
    const deleteLeadMut = useDeleteLead();
    const convertLeadMut = useConvertLeadToProject();
    const leads: Lead[] = Array.isArray(leadsData?.data || leadsData) ? (leadsData?.data || leadsData) : [];

    const formatCurrency = (amount: number) => {
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
        'Initial Meeting': { label: 'Initial Meeting', color: 'orange', style: 'normal' },
        'Proposal': { label: 'Proposal', color: 'slate', style: 'normal' },
        'Negotiation': { label: 'Negotiation', color: 'red', style: 'normal' },
        'Drafting': { label: 'Drafting', color: 'purple', style: 'normal' },
        'Won': { label: 'Won', color: 'green', style: 'won' },
        'Lost': { label: 'Lost', color: 'slate', style: 'lost' }
    };

    // Actual system statuses. We'll map them visually if needed, but 'New', 'Negotiation', 'Won', 'Lost' are system defaults.
    // To match template, we'll keep the system's simple statuses but render them nicely.
    const activeColumns = ['New', 'Initial Meeting', 'Proposal', 'Negotiation', 'Drafting', 'Won', 'Lost']; // Updated active columns

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor)
    );

    const [activeId, setActiveId] = useState<string | null>(null);

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const leadId = active.id as string;
        const newStatus = over.id as Lead['status'];

        const lead = leads.find(l => l.id === leadId);
        if (lead && lead.status !== newStatus) {
            updateLeadMut.mutate({ id: leadId, data: { status: newStatus } });
        }
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const newLead: Partial<Lead> = {
            companyName: formData.get('companyName') as string,
            pocName: formData.get('pocName') as string,
            value: parseFloat(formData.get('value') as string),
            type: formData.get('type') as Lead['type'],
            source: isCustomSource ? (formData.get('customSource') as string) : (formData.get('source') as string),
            gstNumber: formData.get('gstNumber') as string,
            requirements: formData.get('requirements') as string,
            status: 'New',
            lastContact: new Date().toLocaleDateString(),
            dateReceived: new Date().toLocaleDateString(),
            files: []
        };

        if (!newLead.pocName || !newLead.value) return;
        createLead.mutate(newLead as Lead, {
            onSuccess: () => {
                setShowAdd(false);
                setForm({ companyName: '', pocName: '', value: 0, source: 'Website', type: 'Inbound', requirements: '', gstNumber: '' });
                setIsCustomSource(false);
            }
        });
    };

    const handleUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead) return;

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const updatedLeadData: Partial<Lead> = {
            companyName: formData.get('companyName') as string,
            pocName: formData.get('pocName') as string,
            value: parseFloat(formData.get('value') as string),
            type: formData.get('type') as Lead['type'],
            source: isCustomSource ? (formData.get('customSource') as string) : (formData.get('source') as string),
            gstNumber: formData.get('gstNumber') as string,
            requirements: formData.get('requirements') as string,
        };

        updateLeadMut.mutate({ id: selectedLead.id, data: updatedLeadData }, {
            onSuccess: () => {
                setSelectedLead({ ...selectedLead, ...updatedLeadData } as Lead);
                setIsEditing(false);
            }
        });
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

    // const startEdit = () => { // This function is no longer needed with the new modal structure
    //     setEditForm(JSON.parse(JSON.stringify(selectedLead))); // Deep copy
    //     setIsEditing(true);
    // };

    const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

    const filteredLeads = useMemo(() => {
        return leads.filter(l => {
            const matchesSearch = (l.companyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (l.pocName || '').toLowerCase().includes(searchTerm.toLowerCase());
            // The filterType logic needs to be updated if 'Residential', 'Commercial', 'Renovation' are not directly 'type' values
            // For now, assuming 'type' can match these or 'All'
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

    const renderCard = (l: Lead, isOverlay = false) => {
        return <CRMCard key={l.id} lead={l} setSelectedLead={setSelectedLead} isOverlay={isOverlay} formatCurrency={formatCurrency} />;
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-background-light dark:bg-background-dark relative">

            {/* Header Section */}
            <header className="flex-none px-6 md:px-8 py-6 flex flex-col gap-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 z-10 shrink-0">
                {/* Title and Primary Actions */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-slate-900 dark:text-white text-3xl font-black tracking-tight">Opportunities Pipeline</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Manage potential interior design contracts from lead to signed deal.</p>
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
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">+2%</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Win Rate</p>
                            <TrendingDown className="w-5 h-5 text-red-500" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-slate-900 dark:text-white text-xl md:text-2xl font-black">{winRate}%</p>
                            <span className="text-red-600 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/30 px-1.5 py-0.5 rounded">-5%</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <p className="text-slate-500 dark:text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">Avg Deal Size</p>
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="flex items-baseline gap-2 mt-1">
                            <p className="text-slate-900 dark:text-white text-xl md:text-2xl font-black">{formatCurrency(avgDeal)}</p>
                            <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">+8%</span>
                        </div>
                    </div>
                </div>

                {/* Tabs/Filters */}
                <div className="flex gap-2">
                    <button onClick={() => setFilterType('All')} className={`flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors ${filterType === 'All' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Grid className="w-5 h-5" />
                        All Projects
                    </button>
                    <button onClick={() => setFilterType('Residential')} className={`flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${filterType === 'Residential' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Home className="w-5 h-5" />
                        Residential
                    </button>
                    <button onClick={() => setFilterType('Commercial')} className={`flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${filterType === 'Commercial' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Building2 className="w-5 h-5" />
                        Commercial
                    </button>
                    <button onClick={() => setFilterType('Renovation')} className={`flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors ${filterType === 'Renovation' ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                        <Wrench className="w-5 h-5" />
                        Renovation
                    </button>
                </div>
            </header>

            {/* Kanban Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden p-8 custom-scrollbar">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCorners}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="flex h-full gap-6 min-w-max pb-4">
                        {/* Map all columns from template */}
                        {Object.entries(columns).map(([id, col]) => {
                            // Filter out 'Won' and 'Lost' from individual columns as they are handled in a combined column
                            if (id === 'Won' || id === 'Lost') return null;

                            const colLeads = filteredLeads.filter(l => l.status === id);

                            return (
                                <CRMColumn key={id} id={id} col={col} colLeads={colLeads} renderCard={renderCard} setShowAdd={setShowAdd} />
                            );
                        })}

                        {/* Column: Won / Lost */}
                        <CRMColumn
                            id="WonLost"
                            isCompound={true}
                            col={{ label: 'Won / Lost', color: 'slate', style: 'normal' }}
                            colLeads={filteredLeads.filter(l => l.status === 'Won' || l.status === 'Lost')}
                            renderCard={renderCard}
                            setShowAdd={setShowAdd}
                        />
                    </div>
                    <DragOverlay>
                        {activeLead ? (
                            <div className="opacity-80 scale-105 pointer-events-none">
                                {renderCard(activeLead, true)}
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>

            {/* Add/Edit Modal Layer */}
            {(showAdd || selectedLead) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowAdd(false); setSelectedLead(null); }} />
                    <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedLead ? 'Opportunity Details' : 'New Opportunity'}</h3>
                            <button onClick={() => { setShowAdd(false); setSelectedLead(null); }} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={selectedLead ? handleUpdate : handleCreate} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Company / Project Name</label>
                                    <input
                                        required
                                        name="companyName"
                                        defaultValue={selectedLead?.companyName}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="e.g. Skyline Apartments"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Point of Contact</label>
                                    <input
                                        required
                                        name="pocName"
                                        defaultValue={selectedLead?.pocName}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Full Name"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">GST Number</label>
                                    <input
                                        name="gstNumber"
                                        defaultValue={selectedLead?.gstNumber}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Optional GSTIN"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estimated Value ($)</label>
                                    <input
                                        required
                                        type="number"
                                        name="value"
                                        defaultValue={selectedLead?.value}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Lead Source</label>
                                    {!isCustomSource ? (
                                        <select
                                            name="source"
                                            defaultValue={selectedLead?.source || 'Website'}
                                            onChange={e => e.target.value === 'Custom' && setIsCustomSource(true)}
                                            className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                                        >
                                            <option value="Website">Website</option>
                                            <option value="Referral">Referral</option>
                                            <option value="Walk-in">Walk-in</option>
                                            <option value="Social Media">Social Media</option>
                                            <option value="Custom">Other (Custom)...</option>
                                        </select>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                name="customSource"
                                                placeholder="Enter source..."
                                                className="flex-1 h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                            />
                                            <button type="button" onClick={() => setIsCustomSource(false)} className="h-12 w-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700"><XCircle className="w-5 h-5" /></button>
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Project Type</label>
                                    <select
                                        name="type"
                                        defaultValue={selectedLead?.type || 'Inbound'}
                                        className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                                    >
                                        <option value="Inbound">Inbound</option>
                                        <option value="Outbound">Outbound</option>
                                        <option value="Referral">Referral</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Strategic Requirements & Notes</label>
                                <textarea
                                    name="requirements"
                                    defaultValue={selectedLead?.requirements}
                                    rows={3}
                                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none"
                                    placeholder="Outline the client's architectural vision..."
                                />
                            </div>

                            {selectedLead && (
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <Rocket className="w-5 h-5 text-emerald-500" />
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Convert to Project</p>
                                            <p className="text-xs text-slate-500">Sign contracts and launch execution</p>
                                        </div>
                                    </div>
                                    <button type="button" onClick={handleConvert} disabled={convertLeadMut.isPending} className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-xs font-bold hover:bg-emerald-600 transition-colors">
                                        {convertLeadMut.isPending ? 'Launching...' : 'Promote'}
                                    </button>
                                </div>
                            )}

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => { setShowAdd(false); setSelectedLead(null); setIsEditing(false); }} className="flex-1 h-12 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest text-xs">
                                    Cancel
                                </button>
                                <button type="submit" disabled={createLead.isPending || updateLeadMut.isPending} className="flex-2 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold hover:opacity-90 transition-opacity uppercase tracking-widest text-xs shadow-lg shadow-primary/20">
                                    {selectedLead ? 'Sync Opportunity' : 'Launch Pipeline'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const CRMColumn = ({ id, col, colLeads, renderCard, setShowAdd, isCompound = false }: any) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
    });

    return (
        <div ref={setNodeRef} className={`flex flex-col w-80 shrink-0 transition-colors rounded-xl p-2 -m-2 ${isOver ? 'bg-slate-100 dark:bg-slate-800 ring-2 ring-primary ring-opacity-50' : ''} ${isCompound ? 'opacity-80 hover:opacity-100' : ''}`}>
            <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wider">{col.label}</h3>
                    <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold px-2 py-0.5 rounded-full">{colLeads.length}</span>
                </div>
                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
            <div className="flex-1 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar">
                {colLeads.map((l: any) => renderCard(l))}
            </div>
            {!isCompound && (
                <button onClick={() => setShowAdd(true)} className="mt-2 flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed border-slate-300 hover:border-slate-400 text-slate-500 hover:text-slate-600 transition-colors text-sm font-medium">
                    <Plus className="w-5 h-5" />
                    <span>Add {col.label}</span>
                </button>
            )}
        </div>
    );
};

const CRMCard = ({ lead: l, setSelectedLead, isOverlay, formatCurrency }: any) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: l.id,
    });

    const style = transform ? {
        transform: CSS.Translate.toString(transform),
    } : undefined;

    const typeColors: Record<string, string> = {
        'Inbound': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'Outbound': 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        'Referral': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    };
    const defaultColor = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

    if (l.status === 'Won' || l.status === 'Lost') {
        const isWon = l.status === 'Won';
        return (
            <div
                ref={setNodeRef}
                style={style}
                {...(isOverlay ? {} : listeners)}
                {...(isOverlay ? {} : attributes)}
                onClick={() => !isDragging && setSelectedLead(l)}
                className={`group ${isWon ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/50' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 grayscale opacity-60 hover:grayscale-0 hover:opacity-100'} p-4 rounded-xl shadow-sm border cursor-pointer hover:shadow-md transition-all ${isDragging ? 'opacity-50' : ''}`}
            >
                <div className="flex justify-between items-start mb-2">
                    {isWon ? (
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Won
                        </span>
                    ) : (
                        <span className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Lost
                        </span>
                    )}
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{l.companyName || l.pocName}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{isWon ? 'Architectural Planning' : 'Public Bid'}</p>
                <div className={`flex items-center justify-between mt-4 pt-3 border-t ${isWon ? 'border-green-100 dark:border-green-900/30' : 'border-slate-200 dark:border-slate-700/50'}`}>
                    <div className="flex items-center gap-2">
                        <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">{l.pocName.charAt(0)}</div>
                        <span className="text-xs text-slate-500 dark:text-slate-400">1mo ago</span>
                    </div>
                    <span className={`${isWon ? 'text-green-700 dark:text-green-400' : 'text-slate-500 dark:text-slate-400'} font-bold text-sm`}>{formatCurrency(l.value)}</span>
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...(isOverlay ? {} : listeners)}
            {...(isOverlay ? {} : attributes)}
            onClick={() => !isDragging && setSelectedLead(l)}
            className={`group bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm hover:shadow-md border border-slate-200 dark:border-slate-700 transition-all hover:border-primary/50 ${(l.status as string) === 'Negotiation' ? 'border-l-4 border-l-primary' : ''} ${isDragging ? 'opacity-50' : 'opacity-100'} ${!isOverlay ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className={`${typeColors[l.type] || defaultColor} text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide flex items-center gap-1`}>
                    <GripVertical className="w-3 h-3 text-slate-400/50" />
                    {(l.status as string) === 'New' ? 'New Lead' : l.status}
                </span>
                <button className="text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base mb-1">{l.companyName || l.pocName}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-3">{l.requirements || 'No specific notes'}</p>

            {(l.status as string) === 'Initial Meeting' && (
                <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">Scheduled: {l.lastContact}</span>
                </div>
            )}

            {(l.status as string) === 'Negotiation' && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-xs text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="w-4 h-4" />
                    Budget revision required
                </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50">
                <div className="flex items-center gap-2">
                    <div className="size-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600 uppercase">{l.pocName.charAt(0)}</div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{l.lastContact}</span>
                </div>
                <span className="text-primary font-bold text-sm">{formatCurrency(l.value)}</span>
            </div>
        </div>
    );
};
