import React from 'react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-surface-dark border-r border-border-solid hidden md:flex flex-col h-full shrink-0">
            {/* Logo Area */}
            <div className="h-16 flex items-center px-6 border-b border-border-solid shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center">
                        <span className="text-primary font-bold text-lg">M</span>
                    </div>
                    <span className="font-playfair text-xl font-bold text-white tracking-wide">MYSTRI</span>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 overflow-y-auto custom-scrollbar py-6 px-4">
                <nav className="space-y-1">
                    {/* Dashboard */}
                    <NavLink to="/dashboard" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-primary text-surface-darker font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-white'}`}>
                        <span className="material-symbols-outlined text-xl">dashboard</span>
                        <span className="text-sm">Command Center</span>
                    </NavLink>

                    {/* POS / Sales */}
                    <div className="pt-4 pb-2 px-3">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Sales & POS</span>
                    </div>
                    <NavLink to="/pos" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-primary text-surface-darker font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-white'}`}>
                        <span className="material-symbols-outlined text-xl">point_of_sale</span>
                        <span className="text-sm">Point of Sale</span>
                    </NavLink>
                    <NavLink to="/orders" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-primary text-surface-darker font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-white'}`}>
                        <span className="material-symbols-outlined text-xl">receipt_long</span>
                        <span className="text-sm">Order History</span>
                    </NavLink>
                    <NavLink to="/clients" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-primary text-surface-darker font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-white'}`}>
                        <span className="material-symbols-outlined text-xl">group</span>
                        <span className="text-sm">Client Directory</span>
                    </NavLink>

                    {/* Operations */}
                    <div className="pt-4 pb-2 px-3">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Operations</span>
                    </div>
                    <NavLink to="/projects" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-primary text-surface-darker font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-white'}`}>
                        <span className="material-symbols-outlined text-xl">architecture</span>
                        <span className="text-sm">Project Portfolio</span>
                    </NavLink>
                    <NavLink to="/inventory" className={({ isActive }) => `flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-primary text-surface-darker font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-white'}`}>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-xl">inventory_2</span>
                            <span className="text-sm">Inventory</span>
                        </div>
                        <span className="bg-red-500/20 text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">3 LOW</span>
                    </NavLink>
                    <NavLink to="/finance" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-primary text-surface-darker font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-white'}`}>
                        <span className="material-symbols-outlined text-xl">account_balance</span>
                        <span className="text-sm">Finance & ERP</span>
                    </NavLink>
                    <NavLink to="/hr" className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-primary text-surface-darker font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-white'}`}>
                        <span className="material-symbols-outlined text-xl">badge</span>
                        <span className="text-sm">HR & Staff</span>
                    </NavLink>

                    {/* Communications */}
                    <div className="pt-4 pb-2 px-3">
                        <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Team</span>
                    </div>
                    <NavLink to="/team-hub" className={({ isActive }) => `flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${isActive ? 'bg-primary text-surface-darker font-medium' : 'text-text-secondary hover:bg-surface-hover hover:text-white'}`}>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-xl">forum</span>
                            <span className="text-sm">Team Hub</span>
                        </div>
                        <span className="bg-primary/20 text-primary border border-primary/30 text-[10px] font-bold px-2 py-0.5 rounded-full">5</span>
                    </NavLink>
                </nav>
            </div>

            {/* Bottom System Status */}
            <div className="p-4 border-t border-border-solid shrink-0">
                <div className="bg-surface-elevated rounded-lg p-3 border border-border-glass">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-xs font-mono text-text-muted">System Normal</span>
                    </div>
                    <div className="h-1 bg-surface-dark rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[32%]"></div>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-text-muted">CPU</span>
                        <span className="text-[10px] text-text-muted">32%</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};
