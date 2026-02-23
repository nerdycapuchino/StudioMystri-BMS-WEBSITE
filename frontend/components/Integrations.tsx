import React, { useState } from 'react';
import { RefreshCw, CheckCircle, XCircle, Settings, Loader2, Globe, Database, Shield, Bell, BarChart3 } from 'lucide-react';

interface IntegrationItem {
   name: string;
   description: string;
   status: 'Connected' | 'Disconnected';
   icon: React.ReactNode;
   category: string;
}

const INTEGRATIONS: IntegrationItem[] = [
   { name: 'PostgreSQL', description: 'Primary database on Hostinger VPS', status: 'Connected', icon: <Database className="w-6 h-6 text-blue-400" />, category: 'Infrastructure' },
   { name: 'Socket.io', description: 'Real-time chat, notifications & presence', status: 'Connected', icon: <Bell className="w-6 h-6 text-green-400" />, category: 'Infrastructure' },
   { name: 'Sentry', description: 'Error monitoring & performance tracking', status: 'Connected', icon: <Shield className="w-6 h-6 text-purple-400" />, category: 'Monitoring' },
   { name: 'Nginx', description: 'Reverse proxy, SSL & static file serving', status: 'Connected', icon: <Globe className="w-6 h-6 text-cyan-400" />, category: 'Infrastructure' },
   { name: 'PM2', description: 'Process manager with auto-restart', status: 'Connected', icon: <BarChart3 className="w-6 h-6 text-amber-400" />, category: 'Infrastructure' },
   { name: 'Razorpay', description: 'Payment gateway for POS transactions', status: 'Disconnected', icon: <Globe className="w-6 h-6 text-indigo-400" />, category: 'Payments' },
   { name: 'WhatsApp API', description: 'Customer notifications & marketing', status: 'Disconnected', icon: <Globe className="w-6 h-6 text-green-500" />, category: 'Communication' },
   { name: 'Email (SMTP)', description: 'Transactional emails & invoices', status: 'Disconnected', icon: <Globe className="w-6 h-6 text-red-400" />, category: 'Communication' },
];

export const Integrations: React.FC = () => {
   const [isSyncing, setIsSyncing] = useState(false);
   const [activeConfig, setActiveConfig] = useState<string | null>(null);

   const handleSync = async () => {
      setIsSyncing(true);
      await new Promise(r => setTimeout(r, 1500));
      setIsSyncing(false);
   };

   const connectedCount = INTEGRATIONS.filter(i => i.status === 'Connected').length;

   return (
      <div className="h-full flex flex-col relative bg-background-light dark:bg-background-dark text-white p-6 md:p-10">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h2 className="text-3xl font-bold text-white tracking-tight">System Integrations</h2>
               <p className="text-zinc-400 text-sm mt-1">{connectedCount} of {INTEGRATIONS.length} services connected</p>
            </div>
            <button onClick={handleSync} disabled={isSyncing}
               className="px-5 py-2.5 bg-surface-dark border border-white/10 text-white rounded-full text-sm font-bold hover:bg-white/5 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-lg">
               {isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <RefreshCw className="w-4 h-4 text-primary" />}
               {isSyncing ? 'Checking...' : 'Health Check'}
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {INTEGRATIONS.map((integ, i) => (
               <div key={i} className="bg-surface-dark p-6 rounded-2xl shadow-xl border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
                  <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] transition-opacity opacity-20 group-hover:opacity-40 pointer-events-none ${integ.status === 'Connected' ? 'bg-primary' : 'bg-red-500'}`}></div>
                  <div className="flex justify-between items-start mb-6 relative z-10">
                     <div className="h-12 w-12 bg-surface-highlight rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                        {integ.icon}
                     </div>
                     <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border ${integ.status === 'Connected' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${integ.status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`}></span>
                        {integ.status}
                     </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1 relative z-10">{integ.name}</h3>
                  <p className="text-xs text-zinc-500 mb-2 relative z-10">{integ.description}</p>
                  <p className="text-[10px] text-zinc-600 mb-6 font-mono relative z-10">{integ.category}</p>
                  <div className="flex gap-3 items-center relative z-10">
                     <button className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all border ${integ.status === 'Connected'
                           ? 'bg-green-500/10 text-green-400 border-green-500/20 cursor-default'
                           : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                        }`}>
                        {integ.status === 'Connected' ? '● Active' : 'Configure'}
                     </button>
                     <button onClick={() => setActiveConfig(integ.name)} className="px-3 py-2.5 text-zinc-400 bg-surface-highlight border border-white/5 rounded-xl hover:text-white hover:bg-white/10 transition-colors">
                        <Settings className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            ))}
         </div>

         {activeConfig && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
               <div className="bg-surface-dark border border-white/10 rounded-2xl shadow-2xl p-8 w-96 text-center">
                  <div className="mx-auto w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-4 border border-white/5">
                     <Settings className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-bold text-xl text-white mb-2">Configure {activeConfig}</h3>
                  <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Configuration for this integration is managed via environment variables on the VPS.</p>
                  <button onClick={() => setActiveConfig(null)} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">Close</button>
               </div>
            </div>
         )}
      </div>
   );
};