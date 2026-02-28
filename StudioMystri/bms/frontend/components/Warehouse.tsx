import React, { useState } from 'react';
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem, useSuppliers, useRecordStockTransaction } from '../hooks/useInventory';
import { useShipments } from '../hooks/useLogistics';
import { InventoryItem, Supplier } from '../types';
import toast from 'react-hot-toast';

export const Warehouse: React.FC = () => {
    const { data: invData, isLoading, isError, error } = useInventory();
    const createItem = useCreateInventoryItem();
    const updateItem = useUpdateInventoryItem();
    const deleteItem = useDeleteInventoryItem();
    const recordStockTransaction = useRecordStockTransaction();
    const { data: suppliersData } = useSuppliers();
    const { data: shipmentsData } = useShipments();

    const inventory: InventoryItem[] = Array.isArray(invData?.data || invData) ? (invData?.data || invData) as InventoryItem[] : [];
    const suppliersList: Supplier[] = Array.isArray(suppliersData?.data || suppliersData) ? (suppliersData?.data || suppliersData) as Supplier[] : [];
    const shipmentsList: any[] = Array.isArray(shipmentsData?.data || shipmentsData) ? (shipmentsData?.data || shipmentsData) as any[] : [];

    const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

    const [activeTab, setActiveTab] = useState<'inventory' | 'logistics' | 'suppliers'>('inventory');
    const [showAdd, setShowAdd] = useState(false);
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [transactionItem, setTransactionItem] = useState<InventoryItem | null>(null);
    const [transactionForm, setTransactionForm] = useState({ type: 'IN', quantity: '', reason: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSupplier, setSelectedSupplier] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');

    const [form, setForm] = useState({
        name: '', sku: '', category: '', quantity: 0, unit: 'pcs',
        cost: 0, reorderPoint: 10, supplierId: '', location: '', barcode: '', image: '', type: 'RAW'
    });

    const resetForm = () => setForm({ name: '', sku: '', category: '', quantity: 0, unit: 'pcs', cost: 0, reorderPoint: 10, supplierId: '', location: '', barcode: '', image: '', type: 'RAW' });

    const categories = Array.from(new Set(inventory.map(i => i.category || 'Uncategorized')));
    const suppliers = Array.from(new Set(inventory.filter(i => i.supplier).map(i => i.supplier?.name || 'Unknown')));

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'All' || item.category === selectedCategory || (!item.category && selectedCategory === 'Uncategorized');
        const matchesSup = selectedSupplier === 'All' || item.supplier?.name === selectedSupplier;

        let matchesStatus = true;
        const rp = item.reorderPoint || 0;
        if (selectedStatus === 'In Stock') matchesStatus = item.quantity > rp;
        if (selectedStatus === 'Low Stock') matchesStatus = item.quantity <= rp && item.quantity > 0;
        if (selectedStatus === 'Out of Stock') matchesStatus = item.quantity <= 0;

        return matchesSearch && matchesCat && matchesSup && matchesStatus;
    });

    const handleSave = () => {
        const { image, ...submitData } = form;

        if (editItem) {
            updateItem.mutate({ id: editItem.id, data: { ...submitData, barcode: submitData.barcode || undefined } } as any, {
                onSuccess: () => { setEditItem(null); setShowAdd(false); resetForm(); toast.success('Item updated'); }
            });
        } else {
            createItem.mutate({
                ...submitData,
                barcode: submitData.barcode || `SKU-${Date.now()}`
            } as any, {
                onSuccess: () => { setShowAdd(false); resetForm(); toast.success('Item added'); }
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this item?')) {
            deleteItem.mutate(id as any, { onSuccess: () => toast.success('Item deleted') });
        }
    };

    const handleTransaction = () => {
        if (!transactionItem || !transactionForm.quantity || Number(transactionForm.quantity) <= 0) {
            toast.error('Valid positive quantity required');
            return;
        }
        recordStockTransaction.mutate({
            id: transactionItem.id,
            data: { type: transactionForm.type, quantity: Number(transactionForm.quantity), reason: transactionForm.reason }
        } as any, {
            onSuccess: () => {
                setTransactionItem(null);
                setTransactionForm({ type: 'IN', quantity: '', reason: '' });
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col p-6 space-y-6">
                <div className="h-10 bg-slate-200 rounded-xl animate-pulse w-48" />
                <div className="h-16 bg-slate-200 rounded-xl animate-pulse w-full max-w-2xl" />
                <div className="flex-1 bg-slate-200 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                    <p className="text-rose-600 font-bold mb-2">Failed to load inventory data</p>
                    <p className="text-slate-500 text-sm">{(error as any)?.message || 'Unknown error occurs'}</p>
                </div>
            </div>
        );
    }

    // Pagination (Static for UI showcase)
    const itemsPerPage = 8;
    const paginatedItems = filteredInventory.slice(0, itemsPerPage);

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light overflow-hidden animation-fade-in relative z-10 w-full text-slate-900">
            {/* Header */}
            <header className="flex-none bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex flex-col gap-4">
                    {/* Top Row: Title */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-slate-900 text-xl font-bold leading-tight">Inventory & Supply Ledger</h2>
                            <p className="text-slate-500 text-sm">Manage materials, furniture, and stock levels.</p>
                        </div>
                    </div>

                    {/* Bottom Row: Controls */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                        {/* Tabs */}
                        <div className="flex border-b border-slate-200 w-full md:w-auto overflow-x-auto custom-scrollbar">
                            <button
                                onClick={() => setActiveTab('inventory')}
                                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'inventory' ? 'text-primary border-primary' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
                            >
                                Inventory List
                            </button>
                            <button
                                onClick={() => setActiveTab('logistics')}
                                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'logistics' ? 'text-primary border-primary' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
                            >
                                Logistics & Shipments
                            </button>
                            <button
                                onClick={() => setActiveTab('suppliers')}
                                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'suppliers' ? 'text-primary border-primary' : 'text-slate-500 hover:text-slate-800 border-transparent hover:border-slate-300'}`}
                            >
                                Suppliers
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 self-end md:self-auto">
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-[18px]">download</span>
                                <span className="hidden sm:inline">Export Report</span>
                            </button>
                            <button
                                onClick={() => { resetForm(); setShowAdd(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200"
                            >
                                <span className="material-symbols-outlined text-[18px]">add</span>
                                <span>Add Item</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-auto custom-scrollbar p-6">

                {activeTab === 'inventory' && (
                    <>
                        {/* Filters Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder-slate-400 text-slate-900"
                                        placeholder="Search by SKU, Name, or Material..."
                                    />
                                </div>

                                {/* Dropdowns */}
                                <div className="flex flex-wrap gap-3">
                                    <div className="relative group">
                                        <select
                                            value={selectedCategory}
                                            onChange={e => setSelectedCategory(e.target.value)}
                                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-slate-100 transition-colors min-w-[140px]"
                                        >
                                            <option value="All">Category: All</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[18px]">expand_more</span>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            value={selectedSupplier}
                                            onChange={e => setSelectedSupplier(e.target.value)}
                                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-slate-100 transition-colors min-w-[140px]"
                                        >
                                            <option value="All">Supplier: All</option>
                                            {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[18px]">expand_more</span>
                                    </div>
                                    <div className="relative group">
                                        <select
                                            value={selectedStatus}
                                            onChange={e => setSelectedStatus(e.target.value)}
                                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer hover:bg-slate-100 transition-colors min-w-[140px]"
                                        >
                                            <option value="All">Status: All</option>
                                            <option value="In Stock">In Stock</option>
                                            <option value="Low Stock">Low Stock</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[18px]">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Data Table */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[40%]">Item Name & SKU</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[15%]">Category</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[25%]">Stock Level</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[15%] text-right">Unit Price</th>
                                            <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[5%]"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {paginatedItems.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-8 text-center text-slate-500 text-sm">No items found matching your filters.</td>
                                            </tr>
                                        ) : (
                                            paginatedItems.map(item => {
                                                const rp = item.reorderPoint || 0;
                                                const maxStockForBar = Math.max(item.quantity, rp * 2, 100);
                                                const stockPercentage = Math.min(100, Math.round((item.quantity / maxStockForBar) * 100));

                                                let statusLabel = 'Healthy';
                                                let statusColor = 'text-emerald-600';
                                                let barColor = 'bg-emerald-500';

                                                if (item.quantity <= 0) {
                                                    statusLabel = 'Out of Stock';
                                                    statusColor = 'text-rose-600';
                                                    barColor = 'bg-rose-500';
                                                } else if (item.quantity <= rp) {
                                                    statusLabel = 'Low Stock';
                                                    statusColor = 'text-rose-600';
                                                    barColor = 'bg-rose-500';
                                                } else if (item.quantity <= rp * 1.5) {
                                                    statusLabel = 'Medium';
                                                    statusColor = 'text-primary';
                                                    barColor = 'bg-primary';
                                                }

                                                let catBg = 'bg-slate-100';
                                                let catText = 'text-slate-700';
                                                let catBorder = 'border-slate-200';

                                                if (item.category === 'Raw Material') { catBg = 'bg-amber-50'; catText = 'text-amber-700'; catBorder = 'border-amber-100'; }
                                                else if (item.category === 'Finished Good') { catBg = 'bg-purple-50'; catText = 'text-purple-700'; catBorder = 'border-purple-100'; }

                                                return (
                                                    <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                                                        <td className="py-4 px-6">
                                                            <div className="flex items-center gap-4">
                                                                <div
                                                                    className="w-12 h-12 rounded-lg bg-slate-200 bg-cover bg-center shrink-0 border border-slate-200 flex items-center justify-center overflow-hidden"
                                                                    style={item.image ? { backgroundImage: `url('${item.image}')` } : {}}
                                                                >
                                                                    {!item.image && <span className="material-symbols-outlined text-slate-400">image</span>}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors cursor-pointer" onClick={() => { setEditItem(item); setForm({ name: item.name, sku: item.sku || '', category: item.category || '', image: item.image || '', quantity: item.quantity, cost: item.cost, reorderPoint: item.reorderPoint || 0, unit: item.unit || 'pcs', supplierId: item.supplierId || '', location: item.location || '', barcode: item.barcode || '', type: item.type || 'RAW' as any }); }}>{item.name}</p>
                                                                    <p className="text-sm text-slate-500 font-mono mt-0.5">SKU: {item.sku || item.barcode || item.id}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${catBg} ${catText} ${catBorder}`}>
                                                                {item.category || 'Uncategorized'}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-6">
                                                            <div className="flex flex-col gap-2">
                                                                <div className="flex justify-between items-end">
                                                                    <span className="text-sm font-medium text-slate-700">{item.quantity} <span className="text-xs text-slate-400 font-normal">{(item.unit || 'units').toLowerCase()}</span></span>
                                                                    <span className={`text-xs font-medium flex items-center gap-1 ${statusColor}`}>
                                                                        {item.quantity <= (item.reorderPoint || 0) && <span className="material-symbols-outlined text-[14px]">warning</span>} {statusLabel}
                                                                    </span>
                                                                </div>
                                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                                    <div className={`${barColor} h-1.5 rounded-full`} style={{ width: `${Math.max(2, stockPercentage)}%` }}></div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-6 text-right">
                                                            <p className="font-medium text-slate-900 tabular-nums">{formatCurrency(item.cost)}</p>
                                                            <p className="text-xs text-slate-400">per {(item.unit || 'unit').toLowerCase()}</p>
                                                        </td>
                                                        <td className="py-4 px-6 text-right relative group/menu">
                                                            <button className="text-slate-400 hover:text-primary transition-colors p-1 rounded-full hover:bg-slate-100">
                                                                <span className="material-symbols-outlined">more_vert</span>
                                                            </button>
                                                            {/* Dropdown Menu styling could be added here, for now using direct action buttons on hover */}
                                                            <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden group-hover/menu:flex items-center gap-2 bg-white shadow-md border border-slate-200 rounded-lg p-1 z-10 transition-all">
                                                                <button onClick={() => { setTransactionItem(item); setTransactionForm({ type: 'IN', quantity: '', reason: '' }); }} className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-50 rounded" title="Adjust Stock">
                                                                    <span className="material-symbols-outlined text-[18px]">swap_horiz</span>
                                                                </button>
                                                                <button onClick={() => { setEditItem(item); setForm({ name: item.name, sku: item.sku || '', category: item.category || '', image: item.image || '', quantity: item.quantity, cost: item.cost, reorderPoint: item.reorderPoint || 0, unit: item.unit || 'pcs', supplierId: item.supplierId || '', location: item.location || '', barcode: item.barcode || '', type: item.type || 'RAW' as any }); }} className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-50 rounded" title="Edit">
                                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                                </button>
                                                                <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-50 rounded" title="Delete">
                                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            <div className="bg-white px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                                <p className="text-sm text-slate-500">Showing <span className="font-medium text-slate-900">{paginatedItems.length > 0 ? 1 : 0}-{paginatedItems.length}</span> of <span className="font-medium text-slate-900">{filteredInventory.length}</span> items</p>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1 text-sm border border-slate-200 rounded text-slate-500 hover:bg-slate-50 disabled:opacity-50" disabled>Previous</button>
                                    <button className="px-3 py-1 text-sm border border-slate-200 rounded text-slate-500 hover:bg-slate-50">Next</button>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'logistics' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">
                                    <th className="py-4 px-6">Tracking #</th>
                                    <th className="py-4 px-6">Carrier</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6">Origin</th>
                                    <th className="py-4 px-6">Destination</th>
                                    <th className="py-4 px-6">Est. Delivery</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-sm">
                                {shipmentsList.length === 0 ? (
                                    <tr><td colSpan={6} className="py-8 text-center text-slate-500">No shipments found.</td></tr>
                                ) : (
                                    shipmentsList.map(s => (
                                        <tr key={s.id}>
                                            <td className="py-4 px-6 font-mono text-xs">{s.trackingNumber || 'PENDING'}</td>
                                            <td className="py-4 px-6">{s.carrier || 'N/A'}</td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${s.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-slate-600">{s.origin}</td>
                                            <td className="py-4 px-6 text-slate-600">{s.destination}</td>
                                            <td className="py-4 px-6">{s.estimatedDelivery ? new Date(s.estimatedDelivery).toLocaleDateString() : 'TBD'}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'suppliers' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {suppliersList.length === 0 ? (
                                <div className="col-span-full py-20 text-center text-slate-400">No suppliers registered.</div>
                            ) : (
                                suppliersList.map(s => (
                                    <div key={s.id} className="p-5 border border-slate-100 rounded-xl hover:shadow-md transition-shadow bg-slate-50/30">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {s.name.charAt(0)}
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ID: {s.id.substring(0, 8)}</span>
                                        </div>
                                        <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2 mb-3">{s.name}</h4>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="material-symbols-outlined text-[16px]">person</span>
                                                {s.contactPerson || 'No Contact'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="material-symbols-outlined text-[16px]">call</span>
                                                {s.phone || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="material-symbols-outlined text-[16px]">mail</span>
                                                {s.email || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-slate-600">
                                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                <span className="truncate">{s.address || 'No Address'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add / Edit Item Modal */}
            {(showAdd || editItem) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowAdd(false); setEditItem(null); resetForm(); }}></div>

                    {/* Modal Content */}
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">{editItem ? 'edit_square' : 'add_box'}</span>
                                {editItem ? 'Edit Inventory Item' : 'Add New Item'}
                            </h3>
                            <button onClick={() => { setShowAdd(false); setEditItem(null); resetForm(); }} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">Item Name *</label>
                                    <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Carrara Marble Slab" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">SKU / Item ID</label>
                                    <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="e.g. S-114" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">Category</label>
                                    <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="e.g. Raw Material, Hardware" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">Supplier</label>
                                    <select value={form.supplierId} onChange={e => setForm({ ...form, supplierId: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900">
                                        <option value="">No Supplier</option>
                                        {suppliersList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <hr className="border-slate-100 my-2" />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">Quantity *</label>
                                    <input type="number" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="0" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">Unit</label>
                                    <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="e.g. units, sqft, lbs" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">Low Stock Alert Level</label>
                                    <input type="number" value={form.reorderPoint || ''} onChange={e => setForm({ ...form, reorderPoint: Number(e.target.value) })} placeholder="10" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">Unit Cost ($) *</label>
                                    <input type="number" value={form.cost || ''} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} placeholder="0.00" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-600 ml-1">Storage Location / Bin</label>
                                    <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="e.g. Aisle 4, Bin B" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900" />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                            <button
                                onClick={() => { setShowAdd(false); setEditItem(null); resetForm(); }}
                                className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={createItem.isPending || updateItem.isPending || !form.name || form.quantity === null || form.cost === null}
                                className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors shadow-sm shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {(createItem.isPending || updateItem.isPending) ? (
                                    <span className="material-symbols-outlined animate-spin text-[18px]">loop</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">save</span>
                                )}
                                {editItem ? 'Save Changes' : 'Confirm Addition'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stock Transaction Modal */}
            {transactionItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setTransactionItem(null); }}></div>

                    {/* Modal Content */}
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm relative z-10 flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 rounded-t-xl">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                <span className="material-symbols-outlined text-emerald-600">swap_horiz</span>
                                Adjust Stock
                            </h3>
                            <button onClick={() => { setTransactionItem(null); }} className="text-slate-400 hover:text-slate-700 transition-colors p-1 rounded-full hover:bg-slate-200">
                                <span className="material-symbols-outlined text-[18px]">close</span>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="text-sm text-slate-500">Item</p>
                                <p className="font-bold text-slate-900">{transactionItem.name}</p>
                                <p className="text-xs text-slate-500 font-mono mt-0.5">Current Stock: {transactionItem.quantity} {transactionItem.unit || 'units'}</p>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 ml-1">Type *</label>
                                <select value={transactionForm.type} onChange={e => setTransactionForm({ ...transactionForm, type: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900">
                                    <option value="IN">Receive (Stock In)</option>
                                    <option value="OUT">Dispatch (Stock Out)</option>
                                    <option value="ADJUSTMENT">Adjustment (Set Exact)</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 ml-1">Quantity *</label>
                                <input type="number" value={transactionForm.quantity} onChange={e => setTransactionForm({ ...transactionForm, quantity: e.target.value })} placeholder="0" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900" />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600 ml-1">Reason</label>
                                <input value={transactionForm.reason} onChange={e => setTransactionForm({ ...transactionForm, reason: e.target.value })} placeholder="e.g. Scrapped, Restocked" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-900" />
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-3 rounded-b-xl">
                            <button
                                onClick={() => { setTransactionItem(null); }}
                                className="px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleTransaction}
                                disabled={recordStockTransaction.isPending || !transactionForm.quantity}
                                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {recordStockTransaction.isPending ? (
                                    <span className="material-symbols-outlined animate-spin text-[18px]">loop</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[18px]">check</span>
                                )}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

