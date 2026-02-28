import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../hooks/useSearch';
import { Search, Building2, UserCircle, Package, FolderOpen, ArrowDownLeft, Keyboard } from 'lucide-react';

interface GlobalSearchProps {
    isOpen: boolean;
    onClose: () => void;
    onChangeModule: (module: string) => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ isOpen, onClose, onChangeModule }) => {
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: searchData, isLoading } = useSearch(debouncedQuery || null);
    const results: any = searchData?.data || searchData || { products: [], leads: [], projects: [] };

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedQuery(query), 300);
        return () => clearTimeout(timer);
    }, [query]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setQuery('');
            setDebouncedQuery('');
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const allProducts = Array.isArray(results.products) ? results.products : [];
    const allLeads = Array.isArray(results.leads) ? results.leads : [];
    const allProjects = Array.isArray(results.projects) ? results.projects : [];

    const hasResults = allProducts.length > 0 || allLeads.length > 0 || allProjects.length > 0;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4 backdrop-blur-sm bg-slate-900/40 transition-opacity animate-in fade-in duration-200" onClick={onClose}>
            {/* Modal Container */}
            <div
                className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white dark:bg-[#1e293b] shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5 dark:ring-slate-100/10 flex flex-col max-h-[70vh] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Search Header */}
                <div className="relative border-b border-slate-100 dark:border-slate-700/50">
                    <div className="flex items-center px-4 py-4">
                        <Search className="text-primary w-6 h-6 mr-3 select-none shrink-0" />
                        <input
                            ref={inputRef}
                            autoFocus
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="h-10 w-full bg-transparent border-0 text-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 p-0 outline-none"
                            placeholder="Search projects, clients, inventory, or type a command..."
                            type="text"
                        />
                        <div className="hidden sm:flex items-center gap-1 shrink-0 ml-2">
                            <kbd className="hidden sm:inline-block rounded border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">ESC</kbd>
                        </div>
                    </div>
                </div>

                {/* Results List */}
                <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-2 scroll-smooth min-h-[100px]">
                    {isLoading && debouncedQuery && (
                        <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Searching...</div>
                    )}

                    {!isLoading && debouncedQuery && !hasResults && (
                        <div className="p-8 text-center text-slate-400 text-sm">No results found for "{debouncedQuery}"</div>
                    )}

                    {!debouncedQuery && !hasResults && (
                        <div className="p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-3">
                            <Search className="w-8 h-8 opacity-20" />
                            Start typing to search across your workspace...
                        </div>
                    )}

                    {/* Group: Projects */}
                    {allProjects.length > 0 && (
                        <div className="mb-2">
                            <h3 className="px-3 pb-2 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Projects</h3>
                            {allProjects.slice(0, 5).map((proj: any) => (
                                <div
                                    key={proj.id}
                                    onClick={() => { onChangeModule('Projects'); onClose(); }}
                                    className="group flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                            <FolderOpen className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{proj.name}</span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{proj.client} • {proj.currentStage}</span>
                                        </div>
                                    </div>
                                    <div className="hidden group-hover:flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                                        <span className="text-xs">Jump to</span>
                                        <ArrowDownLeft className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Group: Clients/Leads */}
                    {allLeads.length > 0 && (
                        <div className="mb-2">
                            <h3 className="px-3 pb-2 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Clients</h3>
                            {allLeads.slice(0, 5).map((lead: any) => (
                                <div
                                    key={lead.id}
                                    onClick={() => { onChangeModule('CRM'); onClose(); }}
                                    className="group flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                            <Building2 className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{lead.companyName || lead.pocName}</span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">Contact: {lead.pocName} • {lead.status}</span>
                                        </div>
                                    </div>
                                    <div className="hidden group-hover:flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                                        <span className="text-xs">Jump to</span>
                                        <ArrowDownLeft className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Group: Inventory Items */}
                    {allProducts.length > 0 && (
                        <div className="mb-2">
                            <h3 className="px-3 pb-2 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inventory Items</h3>
                            {allProducts.slice(0, 5).map((item: any) => (
                                <div
                                    key={item.id}
                                    onClick={() => { onChangeModule('Warehouse'); onClose(); }}
                                    className="group flex cursor-pointer select-none items-center justify-between rounded-lg px-3 py-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                                            <Package className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{item.name}</span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">SKU: {item.sku || 'N/A'} • {item.stockQuantity} in stock</span>
                                        </div>
                                    </div>
                                    <div className="hidden group-hover:flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                                        <span className="text-xs">Jump to</span>
                                        <ArrowDownLeft className="w-4 h-4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

                {/* Footer / Shortcuts */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700/50 px-4 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="font-sans rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 shadow-sm text-[10px]">&crarr;</kbd>
                            to select
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="font-sans rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 shadow-sm text-[10px]">&uarr;</kbd>
                            <kbd className="font-sans rounded bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 shadow-sm text-[10px]">&darr;</kbd>
                            to navigate
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};
