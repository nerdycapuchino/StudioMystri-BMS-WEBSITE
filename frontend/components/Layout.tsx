import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const GlobalLayout: React.FC = () => {
    return (
        <div className="flex h-screen w-full flex-row overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display antialiased">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden bg-background-light dark:bg-background-dark relative">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar w-full">
                    <div className="w-full max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
