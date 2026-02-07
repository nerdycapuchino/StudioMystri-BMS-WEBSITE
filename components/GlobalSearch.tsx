import React, { useState, useEffect, useRef } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Search, X, ChevronRight, Box, Users, Briefcase } from 'lucide-react';
import { AppModule } from '../types';

export const GlobalSearch: React.FC<{ onClose: () => void, onChangeModule: (module: AppModule) => void }> = ({ onClose, onChangeModule }) => {
    const { isSearchOpen, setIsSearchOpen, products, leads, projects } = useGlobal();
    const [query, setQuery] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isSearchOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isSearchOpen]);

    if (!isSearchOpen) return null;

    const results = {
        products: products.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())).slice(0, 3),
        leads: leads.filter(l => l.companyName.toLowerCase().includes(query.toLowerCase()) || l.pocName.toLowerCase().includes(query.toLowerCase())).slice(0, 3),
        projects: projects.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.client.toLowerCase().includes(query.toLowerCase())).slice(0, 3)
    };

    const hasResults = results.products.length > 0 || results.leads.length > 0 || results.projects.length > 0;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-24 bg-black/60 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
            <div className="w-full max-w-2xl bg-surface-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-4 p-4 border-b border-white/10">
                    <Search className="w-5 h-5 text-zinc-500" />
                    <input
                        ref={inputRef}
                        className="flex-1 bg-transparent text-lg text-white placeholder-zinc-500 focus:outline-none"
                        placeholder="Search products, leads, projects... (Type to search)"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                    <button onClick={() => setIsSearchOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white">
                        <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-mono bg-white/10 rounded mr-2">ESC</kbd>
                        <X className="w-5 h-5 inline" />
                    </button>
                </div>

                <div className="max-h-[60vh] overflow-y-auto p-2">
                    {!query && (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            Type at least 2 characters to search across the entire system.
                        </div>
                    )}

                    {query && !hasResults && (
                        <div className="p-8 text-center text-zinc-500 text-sm">
                            No results found for "{query}".
                        </div>
                    )}

                    {query && hasResults && (
                        <div className="space-y-4 p-2">
                            {/* Products */}
                            {results.products.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2"><Box className="w-3 h-3" /> Products</h3>
                                    {results.products.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl cursor-pointer group transition-colors" onClick={() => { onChangeModule(AppModule.POS); setIsSearchOpen(false); }}>
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 bg-zinc-800 rounded-lg overflow-hidden border border-white/10">
                                                    <img src={item.image} className="w-full h-full object-cover" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.name}</p>
                                                    <p className="text-xs text-zinc-500">{item.sku}</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Leads */}
                            {results.leads.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2"><Users className="w-3 h-3" /> CRM Leads</h3>
                                    {results.leads.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl cursor-pointer group transition-colors" onClick={() => { onChangeModule(AppModule.CRM); setIsSearchOpen(false); }}>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.companyName}</p>
                                                <p className="text-xs text-zinc-500">{item.pocName} • {item.value}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Projects */}
                            {results.projects.length > 0 && (
                                <div>
                                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-2"><Briefcase className="w-3 h-3" /> Projects</h3>
                                    {results.projects.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl cursor-pointer group transition-colors" onClick={() => { onChangeModule(AppModule.PROJECTS); setIsSearchOpen(false); }}>
                                            <div>
                                                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{item.name}</p>
                                                <p className="text-xs text-zinc-500">{item.client} • {item.currentStage}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-3 bg-black/20 border-t border-white/5 text-[10px] text-zinc-500 flex justify-between">
                    <span>Use arrows to navigate (coming soon)</span>
                    <span className="flex items-center gap-1">Press <kbd className="bg-white/10 px-1 rounded text-zinc-300">ESC</kbd> to close</span>
                </div>
            </div>
        </div>
    );
};
