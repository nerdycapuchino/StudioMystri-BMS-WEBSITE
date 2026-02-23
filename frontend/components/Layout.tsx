import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const GlobalLayout: React.FC = () => {
    return (
        <div className="flex h-screen bg-bg-primary overflow-hidden text-text-primary antialiased selection:bg-primary/30 selection:text-white">
            <Sidebar />
            <div className="flex-1 flex flex-col h-full bg-surface-darker relative overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10 w-full">
                    {/* Atmospheric Glow Effects beneath content */}
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-bronze-DEFAULT/5 rounded-full blur-[100px] pointer-events-none translate-y-1/3"></div>

                    {/* The routed content goes here */}
                    <div className="relative z-10 w-full max-w-[1600px] mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};
