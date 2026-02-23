
import React, { useState, useEffect, useRef } from 'react';
import { useSearch } from '../hooks/useSearch';
import { Search, X, Package, UserCheck, FolderOpen, FileText } from 'lucide-react';

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
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-24 bg-slate-900/30 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Search Input */}
                <div className="flex items-center gap-3 p-4 border-b border-slate-100">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 border-none bg-transparent text-lg focus:ring-0 outline-none placeholder:text-slate-300"
                        placeholder="Search products, leads, projects..."
                    />
                    <button onClick={onClose}>
                        <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                    </button>
                </div>

                {/* Results */}
                <div className="max-h-96 overflow-y-auto p-2">
                    {isLoading && debouncedQuery && (
                        <div className="p-8 text-center text-slate-400 text-sm">Searching...</div>
                    )}

                    {!isLoading && debouncedQuery && !hasResults && (
                        <div className="p-8 text-center text-slate-400 text-sm">No results found for "{debouncedQuery}"</div>
                    )}

                    {!debouncedQuery && !hasResults && (
                        <div className="p-8 text-center text-slate-400 text-sm">Start typing to search across your business...</div>
                    )}

                    {/* Products */}
                    {allProducts.length > 0 && (
                        <div className="mb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase px-3 py-2">Products ({allProducts.length})</p>
                            {allProducts.slice(0, 5).map((item: any) => (
                                <button
                                    key={item.id}
                                    onClick={() => { onChangeModule('Warehouse'); onClose(); }}
                                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                                >
                                    <Package className="w-4 h-4 text-indigo-500" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.category || item.sku || 'Product'}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Leads */}
                    {allLeads.length > 0 && (
                        <div className="mb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase px-3 py-2">Leads ({allLeads.length})</p>
                            {allLeads.slice(0, 5).map((lead: any) => (
                                <button
                                    key={lead.id}
                                    onClick={() => { onChangeModule('CRM'); onClose(); }}
                                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                                >
                                    <UserCheck className="w-4 h-4 text-green-500" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{lead.companyName || lead.pocName}</p>
                                        <p className="text-xs text-slate-400">{lead.status} • {lead.source}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Projects */}
                    {allProjects.length > 0 && (
                        <div className="mb-2">
                            <p className="text-xs font-bold text-slate-400 uppercase px-3 py-2">Projects ({allProjects.length})</p>
                            {allProjects.slice(0, 5).map((proj: any) => (
                                <button
                                    key={proj.id}
                                    onClick={() => { onChangeModule('Projects'); onClose(); }}
                                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                                >
                                    <FolderOpen className="w-4 h-4 text-orange-500" />
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{proj.name}</p>
                                        <p className="text-xs text-slate-400">{proj.client} • {proj.currentStage}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
