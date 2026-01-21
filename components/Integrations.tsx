import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { RefreshCw, CheckCircle, XCircle, ToggleLeft, ToggleRight, Settings, Loader2, Globe } from 'lucide-react';

export const Integrations: React.FC = () => {
  const { integrations, toggleIntegration, syncIntegrations } = useGlobal();
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeConfig, setActiveConfig] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncIntegrations();
    setIsSyncing(false);
  };

  return (
    <div className="h-full flex flex-col relative bg-background-light dark:bg-background-dark text-white p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">System Integrations</h2>
           <p className="text-zinc-400 text-sm mt-1">Monitor connections with external services & storefronts.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="px-5 py-2.5 bg-surface-dark border border-white/10 text-white rounded-full text-sm font-bold hover:bg-white/5 flex items-center gap-2 disabled:opacity-50 transition-all active:scale-95 shadow-lg"
        >
          {isSyncing ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <RefreshCw className="w-4 h-4 text-primary" />} 
          {isSyncing ? 'Syncing...' : 'Sync All Data'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {integrations.map((integ, i) => (
            <div key={i} className="bg-surface-dark p-6 rounded-2xl shadow-xl border border-white/5 hover:border-primary/30 transition-all group relative overflow-hidden">
               {/* Glow Effect */}
               <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-[50px] transition-opacity opacity-20 group-hover:opacity-40 pointer-events-none ${integ.status === 'Connected' ? 'bg-primary' : 'bg-red-500'}`}></div>

               <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="h-12 w-12 bg-surface-highlight rounded-xl flex items-center justify-center text-white font-bold border border-white/5 shadow-inner">
                     {integ.icon === 'Wordpress' || integ.icon === 'Globe' ? <Globe className="w-6 h-6 text-blue-400"/> : 
                      integ.icon === 'Truck' ? <span className="material-symbols-outlined text-amber-400">local_shipping</span> :
                      integ.icon === 'Terminal' ? <span className="material-symbols-outlined text-green-400">terminal</span> :
                      integ.name.charAt(0)}
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide flex items-center gap-1.5 border ${
                     integ.status === 'Connected' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                     integ.status === 'Error' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20'
                  }`}>
                     <span className={`w-1.5 h-1.5 rounded-full ${integ.status === 'Connected' ? 'bg-green-500 animate-pulse' : 'bg-zinc-500'}`}></span>
                     {integ.status}
                  </div>
               </div>
               
               <h3 className="text-lg font-bold text-white mb-1 relative z-10">{integ.name}</h3>
               <p className="text-xs text-zinc-500 mb-6 font-mono relative z-10">Last Synced: {integ.lastSync}</p>
               
               <div className="flex gap-3 items-center relative z-10">
                  <button onClick={() => toggleIntegration(integ.name)} className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all border ${
                     integ.status === 'Connected' 
                        ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                        : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                  }`}>
                     {integ.status === 'Connected' ? 'Disconnect' : 'Connect'}
                  </button>
                  <button onClick={() => setActiveConfig(integ.name)} className="px-3 py-2.5 text-zinc-400 bg-surface-highlight border border-white/5 rounded-xl hover:text-white hover:bg-white/10 transition-colors">
                     <Settings className="w-4 h-4" />
                  </button>
               </div>
            </div>
         ))}
      </div>

      {/* Config Modal */}
      {activeConfig && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-surface-dark border border-white/10 rounded-2xl shadow-2xl p-8 w-96 text-center">
               <div className="mx-auto w-16 h-16 bg-surface-highlight rounded-full flex items-center justify-center mb-4 border border-white/5">
                  <Settings className="w-8 h-8 text-primary" />
               </div>
               <h3 className="font-bold text-xl text-white mb-2">Configure {activeConfig}</h3>
               <p className="text-sm text-zinc-400 mb-6 leading-relaxed">Enter your API Key and Secret to establish a secure connection.</p>
               
               <div className="space-y-3 mb-6 text-left">
                  <div>
                     <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">API Key</label>
                     <input className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-primary" type="password" value="****************" readOnly />
                  </div>
                  <div>
                     <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">API Secret</label>
                     <input className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-primary" type="password" value="****************" readOnly />
                  </div>
               </div>

               <button onClick={() => setActiveConfig(null)} className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">Close</button>
            </div>
         </div>
      )}
    </div>
  );
};