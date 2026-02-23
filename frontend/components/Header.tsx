import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../hooks/useSearch';
import { useNavigate } from 'react-router-dom';

export const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const [query, setQuery] = useState('');
    const { data: results, isFetching: isSearching } = useSearch(query);
    const navigate = useNavigate();

    const firstName = user?.name?.split(' ')[0] || 'User';
    const lastName = user?.name?.split(' ').slice(1).join(' ') || '';

    const handleSelectResult = (path: string) => {
        setQuery('');
        navigate(path);
    }

    return (
        <header className="h-20 bg-surface-elevated/80 backdrop-blur-xl border-b border-border-solid flex items-center justify-between px-8 sticky top-0 z-40">
            {/* Search Bar */}
            <div className="max-w-xl w-full relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors">search</span>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search orders, clients, projects... (Ctrl+K)"
                    className="w-full bg-surface-dark border border-border-solid rounded-xl py-3 pl-12 pr-4 text-sm text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all placeholder-text-muted/50"
                />
                <button className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-surface-hover rounded text-[10px] font-mono text-text-muted border border-border-glass">
                    CTRL K
                </button>

                {/* Search Results Dropdown Overlay */}
                {query.length >= 2 && (
                    <div className="absolute top-14 left-0 w-full bg-surface-elevated border border-border-solid rounded-xl shadow-xl shadow-black/40 overflow-hidden z-50">
                        {isSearching ? (
                            <div className="p-4 text-center text-sm text-text-muted animate-pulse">Searching...</div>
                        ) : results?.data && results.data.length > 0 ? (
                            <ul className="max-h-64 overflow-y-auto custom-scrollbar">
                                {results.data.map((r: any, i: number) => (
                                    <li key={i} onClick={() => handleSelectResult(r.url)} className="px-4 py-3 hover:bg-surface-hover cursor-pointer border-b border-border-solid last:border-0 flex justify-between items-center transition-colors">
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">{r.title}</p>
                                            <p className="text-xs text-text-muted">{r.subtitle || r.id}</p>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-text-muted bg-surface-dark px-2 py-1 rounded">{r.type}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="p-4 text-center text-sm text-text-muted">No results found for "{query}"</div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
                <button className="relative text-text-muted hover:text-white transition-colors group">
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">notifications</span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface-elevated animate-pulse"></span>
                </button>
                <div className="w-px h-8 bg-border-solid"></div>

                <div className="flex items-center gap-4 cursor-pointer group">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-text-primary capitalize">{firstName} {lastName}</p>
                        <p className="text-[11px] text-primary uppercase font-bold tracking-widest">{user?.role || 'Administrator'}</p>
                    </div>
                    <img
                        src={`https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=38e07b&color=122017&bold=true`}
                        alt="Profile"
                        className="w-10 h-10 rounded-xl border border-border-solid group-hover:border-primary transition-colors object-cover"
                    />
                    <button
                        onClick={() => logout()}
                        className="text-text-muted hover:text-error transition-colors ml-2"
                        title="Logout"
                    >
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
};
