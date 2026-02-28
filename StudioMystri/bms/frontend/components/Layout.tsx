import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const GlobalLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const location = useLocation();

    // TeamHub manages its own full-height layout, so no padding
    const isFullScreen = location.pathname === '/team-hub';

    return (
        <div className="flex h-[100dvh] w-full flex-row overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased">
            {/* Mobile overlay backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
            <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="flex flex-1 flex-col overflow-hidden bg-background-light dark:bg-background-dark relative min-w-0">
                <Header onMenuToggle={() => setSidebarOpen((v) => !v)} />
                <main className={`flex-1 overflow-y-auto custom-scrollbar w-full ${isFullScreen ? 'p-0' : 'p-3 sm:p-4 md:p-8'}`}>
                    <div className={`w-full ${isFullScreen ? 'h-full' : 'max-w-[1600px] mx-auto'}`}>
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
