
import React, { useState } from 'react';
import { useInventory, useCreateInventoryItem, useUpdateInventoryItem, useDeleteInventoryItem } from '../hooks/useInventory';
import { Package, Plus, Search, Edit2, Trash2, X, BarChart3, AlertTriangle, ArrowDown, ArrowUp, Scan, Factory } from 'lucide-react';
import { InventoryItem } from '../types';
import toast from 'react-hot-toast';

export const Warehouse: React.FC = () => {
    const { data: invData, isLoading, isError, error } = useInventory();
    const createItem = useCreateInventoryItem();
    const updateItem = useUpdateInventoryItem();
    const deleteItem = useDeleteInventoryItem();

    const inventory: InventoryItem[] = Array.isArray(invData?.data || invData) ? (invData?.data || invData) as InventoryItem[] : [];

    const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

    const [activeTab, setActiveTab] = useState<'inventory' | 'production'>('inventory');
    const [showAdd, setShowAdd] = useState(false);
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const [form, setForm] = useState({
        name: '', sku: '', category: '', quantity: 0, unit: 'pcs',
        cost: 0, reorderLevel: 10, supplier: '', location: '', barcode: ''
    });

    const resetForm = () => setForm({ name: '', sku: '', category: '', quantity: 0, unit: 'pcs', cost: 0, reorderLevel: 10, supplier: '', location: '', barcode: '' });

    const categories = Array.from(new Set(inventory.map(i => i.category)));

    const filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || (item.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
        return matchesSearch && matchesCat;
    });

    const handleSave = () => {
        if (editItem) {
            updateItem.mutate({ id: editItem.id, ...form } as any, {
                onSuccess: () => { setEditItem(null); resetForm(); }
            });
        } else {
            createItem.mutate({
                ...form,
                id: Math.random().toString(36).substr(2, 9),
                barcode: form.barcode || `SKU-${Date.now()}`
            } as any, {
                onSuccess: () => { setShowAdd(false); resetForm(); }
            });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this item?')) {
            deleteItem.mutate(id as any);
        }
    };

    if (isLoading) {
        return (
            <div className="h-full flex flex-col p-6 space-y-6">
                <div className="h-10 bg-slate-100 rounded-xl animate-pulse w-48" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
                </div>
                <div className="flex-1 bg-slate-100 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 font-bold mb-2">Failed to load inventory</p>
                    <p className="text-slate-500 text-sm">{(error as any)?.message || 'Unknown error'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-y-auto pr-2 relative">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Warehouse & Inventory</h2>
                    <p className="text-slate-500 text-sm">{inventory.length} items tracked</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-slate-800 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                        <Plus className="w-4 h-4" /> Add Item
                    </button>
                </div>
            </div>

            {/* KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Items', value: inventory.length, icon: Package, color: 'indigo' },
                    { label: 'Low Stock', value: inventory.filter(i => i.quantity <= i.reorderLevel).length, icon: AlertTriangle, color: 'orange' },
                    { label: 'Total Value', value: formatCurrency(inventory.reduce((sum, i) => sum + (i.cost * i.quantity), 0)), icon: BarChart3, color: 'blue' },
                    { label: 'Categories', value: categories.length, icon: Factory, color: 'green' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className={`p-2 rounded-lg bg-${kpi.color}-50 text-${kpi.color}-600 w-fit mb-2`}>
                            <kpi.icon className="w-5 h-5" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
                        <p className="text-xs text-slate-500">{kpi.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder="Search items..."
                    />
                </div>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-600">
                    <option value="All">All Categories</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Inventory Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-4 py-3">Item</th>
                                <th className="px-4 py-3">Location</th>
                                <th className="px-4 py-3">Stock</th>
                                <th className="px-4 py-3">Unit Cost</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredInventory.map(item => (
                                <tr key={item.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div>
                                            <p className="font-medium text-slate-800">{item.name}</p>
                                            <p className="text-xs text-slate-400">{item.sku || item.barcode}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">{item.location || 'Unassigned'}</td>
                                    <td className="px-4 py-3 text-slate-700">{item.quantity} {item.unit}</td>
                                    <td className="px-4 py-3 text-slate-700">{formatCurrency(item.cost)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.quantity <= item.reorderLevel ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right space-x-2">
                                        <button onClick={() => { setEditItem(item); setForm({ name: item.name, sku: item.sku || '', category: item.category, quantity: item.quantity, unit: item.unit, cost: item.cost, reorderLevel: item.reorderLevel, supplier: item.supplier || '', location: item.location || '', barcode: item.barcode || '' }); }} className="text-indigo-600 hover:underline font-medium text-xs">
                                            <Edit2 className="w-3.5 h-3.5 inline" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:underline font-medium text-xs">
                                            <Trash2 className="w-3.5 h-3.5 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {(showAdd || editItem) && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-lg">{editItem ? 'Edit Item' : 'Add Inventory Item'}</h3>
                            <button onClick={() => { setShowAdd(false); setEditItem(null); resetForm(); }}><X className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Item Name" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                            <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="SKU" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                            <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" value={form.quantity || ''} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })} placeholder="Quantity" className="border border-slate-200 p-2.5 rounded-lg text-sm" />
                                <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="Unit" className="border border-slate-200 p-2.5 rounded-lg text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <input type="number" value={form.cost || ''} onChange={e => setForm({ ...form, cost: Number(e.target.value) })} placeholder="Unit Cost" className="border border-slate-200 p-2.5 rounded-lg text-sm" />
                                <input type="number" value={form.reorderLevel || ''} onChange={e => setForm({ ...form, reorderLevel: Number(e.target.value) })} placeholder="Reorder Level" className="border border-slate-200 p-2.5 rounded-lg text-sm" />
                            </div>
                            <input value={form.supplier} onChange={e => setForm({ ...form, supplier: e.target.value })} placeholder="Supplier" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Location / Bin" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={createItem.isPending || updateItem.isPending}
                            className="w-full mt-4 bg-indigo-600 text-slate-800 py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {(createItem.isPending || updateItem.isPending) ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
