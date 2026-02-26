import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { can } from '../src/lib/rbac';

type NavItem = {
    to: string;
    icon: string;
    label: string;
    show: boolean;
    badge?: string;
};

const sectionTitleClass = 'px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1';
const STORAGE_KEY = 'sidebar_collapsed';

const navClass = ({ isActive }: { isActive: boolean }, collapsed: boolean) =>
    [
        'group flex items-center rounded-lg transition-all',
        collapsed ? 'justify-center px-2 py-2.5' : 'gap-3 px-3 py-2.5',
        isActive
            ? 'bg-primary text-white shadow-md shadow-primary/20'
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
    ].join(' ');

const renderItem = (item: NavItem, collapsed: boolean) => (
    <NavLink
        key={item.to}
        to={item.to}
        className={(state) => navClass(state, collapsed)}
        title={collapsed ? item.label : undefined}
    >
        <span className="material-symbols-outlined">{item.icon}</span>
        {!collapsed && (
            <div className="flex items-center justify-between w-full">
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && <span className="bg-red-500/20 text-red-500 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">{item.badge}</span>}
            </div>
        )}
    </NavLink>
);

export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const role = user?.role || 'CUSTOMER';
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === '1') setCollapsed(true);
    }, []);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
            return next;
        });
    };

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
        <aside className={`flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto shrink-0 transition-[width] duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
            <div>
                <div className={`flex items-center px-4 py-6 border-b border-slate-100 dark:border-slate-800 ${collapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined">architecture</span>
                    </div>
                    {!collapsed && (
                        <div className="flex flex-col overflow-hidden">
                            <h1 className="text-base font-semibold leading-none text-slate-900 dark:text-white tracking-tight truncate">Studio Mystri</h1>
                            <p className="mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Management System</p>
                        </div>
                    )}
                </div>

                <nav className={`flex flex-col gap-1.5 mt-6 ${collapsed ? 'px-2' : 'px-4'}`}>
                    <NavLink to="/dashboard" className={(state) => navClass(state, collapsed)} title={collapsed ? 'Dashboard' : undefined}>
                        <span className="material-symbols-outlined" data-weight="fill">dashboard</span>
                        {!collapsed && <span className="text-sm font-medium">Dashboard</span>}
                    </NavLink>

                    <div className="my-2 border-t border-slate-200 dark:border-slate-800 mx-2"></div>
                    {!collapsed && <p className={sectionTitleClass}>Pipeline & Sales</p>}
                    {pipelineItems.filter((item) => item.show).map((item) => renderItem(item, collapsed))}

                    <div className="my-2 border-t border-slate-200 dark:border-slate-800 mx-2"></div>
                    {!collapsed && <p className={sectionTitleClass}>Execution & Supply</p>}
                    {executionItems.filter((item) => item.show).map((item) => renderItem(item, collapsed))}

                    <div className="my-2 border-t border-slate-200 dark:border-slate-800 mx-2"></div>
                    {!collapsed && <p className={sectionTitleClass}>Organization</p>}
                    {orgItems.filter((item) => item.show).map((item) => renderItem(item, collapsed))}
                </nav>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    className={`w-full flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors ${collapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5'}`}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {!collapsed && <span className="text-xs font-bold uppercase tracking-wide">Collapse</span>}
                    {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                </button>
            </div>
        </aside>
    );
};
