import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { can } from '../src/lib/rbac';

type NavItem = {
    to: string;
    icon: string;
    label: string;
    show: boolean;
    badge?: string;
};

const navClass = ({ isActive }: { isActive: boolean }) =>
    [
        'group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
        isActive
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
    ].join(' ');

const sectionTitleClass = 'px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1';

export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || 'User';
    const role = user?.role || 'CUSTOMER';

    const pipelineItems: NavItem[] = [
        { to: '/crm', icon: 'rocket_launch', label: 'CRM Pipeline', show: can(role, 'crm', 'read') },
        { to: '/clients', icon: 'group', label: 'Clients', show: can(role, 'crm', 'read') },
        { to: '/pos', icon: 'point_of_sale', label: 'POS Terminal', show: can(role, 'finance', 'create') || can(role, 'crm', 'read') },
        { to: '/orders', icon: 'shopping_cart', label: 'Orders', show: can(role, 'ecommerce', 'read') },
    ];

    const executionItems: NavItem[] = [
        { to: '/projects', icon: 'architecture', label: 'Projects', show: can(role, 'projects', 'read') },
        { to: '/inventory', icon: 'inventory_2', label: 'Warehouse', show: can(role, 'projects', 'read'), badge: '3 LOW' },
        { to: '/logistics', icon: 'local_shipping', label: 'Logistics', show: can(role, 'inventory', 'read') },
        { to: '/scanner', icon: 'qr_code_scanner', label: 'Universal Scanner', show: true },
    ];

    const orgItems: NavItem[] = [
        { to: '/finance', icon: 'payments', label: 'Finance & Invoicing', show: can(role, 'finance', 'read') },
        { to: '/erp', icon: 'settings_suggest', label: 'ERP Core', show: can(role, 'auth', 'read') },
        { to: '/hr', icon: 'badge', label: 'HR Management', show: can(role, 'hr', 'read') },
        { to: '/team-hub', icon: 'forum', label: 'Team Hub', show: can(role, 'teamhub', 'read') },
        { to: '/settings', icon: 'settings', label: 'System Settings', show: can(role, 'auth', 'update') },
    ];

    return (
        <aside className="flex w-64 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto shrink-0">
            <div>
                <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined">architecture</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-base font-semibold leading-none text-slate-900 dark:text-white tracking-tight truncate">Studio Mystri</h1>
                        <p className="mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Management System</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1.5 px-4 mt-6">
                    <NavLink to="/dashboard" className={navClass}>
                        <span className="material-symbols-outlined" data-weight="fill">dashboard</span>
                        <span className="text-sm font-medium">Dashboard</span>
                    </NavLink>

                    <div className="my-2 border-t border-slate-200 dark:border-slate-800 mx-2"></div>
                    <p className={sectionTitleClass}>Pipeline & Sales</p>
                    {pipelineItems.filter((item) => item.show).map((item) => (
                        <NavLink key={item.to} to={item.to} className={navClass}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </NavLink>
                    ))}

                    <div className="my-2 border-t border-slate-200 dark:border-slate-800 mx-2"></div>
                    <p className={sectionTitleClass}>Execution & Supply</p>
                    {executionItems.filter((item) => item.show).map((item) => (
                        <NavLink key={item.to} to={item.to} className={navClass}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <div className="flex items-center justify-between w-full">
                                <span className="text-sm font-medium">{item.label}</span>
                                {item.badge && <span className="bg-red-500/20 text-red-500 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
                            </div>
                        </NavLink>
                    ))}

                    <div className="my-2 border-t border-slate-200 dark:border-slate-800 mx-2"></div>
                    <p className={sectionTitleClass}>Organization</p>
                    {orgItems.filter((item) => item.show).map((item) => (
                        <NavLink key={item.to} to={item.to} className={navClass}>
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Normal</span>
                    </div>
                    <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[32%] transition-all duration-500"></div>
                    </div>
                    <div className="flex justify-between mt-1.5">
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Resource Load</span>
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">32%</span>
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800 p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer group">
                    <img
                        src={`https://ui-avatars.com/api/?name=${firstName}&background=137fec&color=fff&bold=true`}
                        alt="Profile"
                        className="h-9 w-9 rounded-full bg-slate-200 object-cover border border-white dark:border-slate-700"
                    />
                    <div className="flex flex-col overflow-hidden">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{firstName}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wide font-medium">{role}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
