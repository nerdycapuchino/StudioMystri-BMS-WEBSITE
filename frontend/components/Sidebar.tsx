import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
    const { user } = useAuth();
    const firstName = user?.name?.split(' ')[0] || 'User';
    const role = user?.role || 'Administrator';

    const ADMIN_ONLY = ['SUPER_ADMIN', 'ADMIN'];
    const SALES_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SALES'];
    const FINANCE_ROLES = ['SUPER_ADMIN', 'ADMIN', 'FINANCE'];
    const HR_ROLES = ['SUPER_ADMIN', 'ADMIN', 'HR'];
    const OPS_ROLES = ['SUPER_ADMIN', 'ADMIN', 'DESIGNER', 'ARCHITECT'];
    const POS_ROLES = [...SALES_ROLES, ...FINANCE_ROLES];

    return (
        <aside className="flex w-64 flex-col justify-between border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto shrink-0 transition-colors duration-300">
            <div>
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex h-10 w-10 min-w-[40px] items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30">
                        <span className="material-symbols-outlined">architecture</span>
                    </div>
                    <div className="flex flex-col overflow-hidden">
                        <h1 className="text-base font-semibold leading-none text-slate-900 dark:text-white tracking-tight truncate">Studio Mystri</h1>
                        <p className="mt-1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Management System</p>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-1.5 px-4 mt-6">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined" data-weight="fill">dashboard</span>
                        <span className="text-sm font-medium">Dashboard</span>
                    </NavLink>

                    <div className="my-2 border-t border-slate-200 dark:border-slate-800 mx-2"></div>
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Pipeline & Sales</p>

                    {SALES_ROLES.includes(role) && (
                        <>
                            <NavLink
                                to="/crm"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <span className="material-symbols-outlined">rocket_launch</span>
                                <span className="text-sm font-medium">CRM Pipeline</span>
                            </NavLink>

                            <NavLink
                                to="/clients"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <span className="material-symbols-outlined">group</span>
                                <span className="text-sm font-medium">Clients</span>
                            </NavLink>
                        </>
                    )}

                    {POS_ROLES.includes(role) && (
                        <NavLink
                            to="/pos"
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined">point_of_sale</span>
                            <span className="text-sm font-medium">POS Terminal</span>
                        </NavLink>
                    )}

                    <NavLink
                        to="/orders"
                        className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">shopping_cart</span>
                        <span className="text-sm font-medium">Orders</span>
                    </NavLink>

                    <div className="my-2 border-t border-slate-200 dark:border-slate-800 mx-2"></div>
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Execution & Supply</p>

                    {OPS_ROLES.includes(role) && (
                        <>
                            <NavLink
                                to="/projects"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <span className="material-symbols-outlined">architecture</span>
                                <span className="text-sm font-medium">Projects</span>
                            </NavLink>

                            <NavLink
                                to="/inventory"
                                className={({ isActive }) =>
                                    `group flex items-center justify-between rounded-lg px-3 py-2.5 transition-all ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined">inventory_2</span>
                                    <span className="text-sm font-medium">Warehouse</span>
                                </div>
                                <span className="bg-red-500/20 text-red-500 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded-full">3 LOW</span>
                            </NavLink>

                            <NavLink
                                to="/logistics"
                                className={({ isActive }) =>
                                    `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                    }`
                                }
                            >
                                <span className="material-symbols-outlined">local_shipping</span>
                                <span className="text-sm font-medium">Logistics</span>
                            </NavLink>
                        </>
                    )}

                    <NavLink
                        to="/scanner"
                        className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">qr_code_scanner</span>
                        <span className="text-sm font-medium">Universal Scanner</span>
                    </NavLink>

                    <div className="my-2 border-t border-slate-200 dark:border-slate-800 mx-2"></div>
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Organization</p>

                    {FINANCE_ROLES.includes(role) && (
                        <NavLink
                            to="/finance"
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined">payments</span>
                            <span className="text-sm font-medium">Finance & Invoicing</span>
                        </NavLink>
                    )}

                    {ADMIN_ONLY.includes(role) && (
                        <NavLink
                            to="/erp"
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined">settings_suggest</span>
                            <span className="text-sm font-medium">ERP Core</span>
                        </NavLink>
                    )}

                    {HR_ROLES.includes(role) && (
                        <NavLink
                            to="/hr"
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined">badge</span>
                            <span className="text-sm font-medium">HR Management</span>
                        </NavLink>
                    )}

                    <NavLink
                        to="/team-hub"
                        className={({ isActive }) =>
                            `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                ? 'bg-primary text-white shadow-md shadow-primary/20'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                            }`
                        }
                    >
                        <span className="material-symbols-outlined">forum</span>
                        <span className="text-sm font-medium">Team Hub</span>
                    </NavLink>

                    {ADMIN_ONLY.includes(role) && (
                        <NavLink
                            to="/settings"
                            className={({ isActive }) =>
                                `group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all ${isActive
                                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined">settings</span>
                            <span className="text-sm font-medium">System Settings</span>
                        </NavLink>
                    )}
                </nav>
            </div>

            {/* Bottom System Status */}
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
