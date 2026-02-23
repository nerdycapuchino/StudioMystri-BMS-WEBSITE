import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
    const { logout } = useAuth();
    const [query, setQuery] = useState('');
    const { data: results, isFetching: isSearching } = useSearch(query);
    const navigate = useNavigate();

    const handleSelectResult = (path: string) => {
        setQuery('');
        navigate(path);
    }

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-8 backdrop-blur-md z-40 sticky top-0 transition-colors duration-300">
            <div className="flex w-full max-w-lg items-center relative group">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-slate-400 text-[20px] group-focus-within:text-primary transition-colors">search</span>
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search modules, projects, or staff..."
                    className="block w-full rounded-lg border-0 bg-slate-100 dark:bg-slate-800 py-2 pl-10 pr-12 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-primary placeholder:text-slate-400 transition-all"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <kbd className="inline-flex items-center rounded border border-slate-300 dark:border-slate-600 px-2 py-0.5 font-sans text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tighter">Ctrl K</kbd>
                </div>

                {/* Search Results Dropdown Overlay */}
                {query.length >= 2 && (
                    <div className="absolute top-12 left-0 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                        {isSearching ? (
                            <div className="p-4 text-center text-sm text-slate-500 animate-pulse">Scanning database...</div>
                        ) : results?.data && results.data.length > 0 ? (
                            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                                {Object.entries(
                                    results.data.reduce((acc: any, item: any) => {
                                        if (!acc[item.type]) acc[item.type] = [];
                                        acc[item.type].push(item);
                                        return acc;
                                    }, {})
                                ).map(([type, items]: [string, any]) => (
                                    <div key={type} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                                        <div className="bg-slate-50/80 dark:bg-slate-800/50 px-5 py-2">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 dark:text-slate-500">
                                                {type === 'staff' ? 'Team Hub' : type === 'lead' ? 'CRM Pipeline' : type}
                                            </span>
                                        </div>
                                        <ul>
                                            {items.map((r: any, i: number) => (
                                                <li key={i} onClick={() => handleSelectResult(r.url)} className="px-5 py-3 hover:bg-primary/5 dark:hover:bg-primary/10 cursor-pointer flex justify-between items-center group transition-colors">
                                                    <div className="flex flex-col gap-0.5">
                                                        <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{r.title}</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{r.subtitle || r.id}</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors text-[18px]">arrow_forward</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-6 text-center text-sm text-slate-500">
                                <span className="material-symbols-outlined block text-3xl mb-2 opacity-20">search_off</span>
                                No results found for "<span className="font-semibold text-slate-900 dark:text-white">{query}</span>"
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <button className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition group">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">notifications</span>
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900"></span>
                </button>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-slate-800 dark:hover:bg-slate-700 transition transform active:scale-95"
                >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Systems Exit</span>
                </button>
            </div>
        </header>
    );
};
