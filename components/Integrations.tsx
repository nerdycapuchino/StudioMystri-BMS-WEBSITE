import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { RefreshCw, CheckCircle, XCircle, ToggleLeft, ToggleRight, Settings, Loader2 } from 'lucide-react';

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
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">System Integrations</h2>
           <p className="text-slate-500 text-sm">Monitor connections with external services.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isSyncing}
          className="px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 flex items-center gap-2 disabled:opacity-50"
        >
          {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} 
          {isSyncing ? 'Syncing...' : 'Sync All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {integrations.map((integ, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <div className="flex justify-between items-start mb-4">
                  <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold">
                     {integ.name.charAt(0)}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${
                     integ.status === 'Connected' ? 'bg-green-50 text-green-600' : 
                     integ.status === 'Error' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600'
                  }`}>
                     {integ.status === 'Connected' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                     {integ.status}
                  </div>
               </div>
               <h3 className="text-lg font-bold text-slate-800 mb-1">{integ.name}</h3>
               <p className="text-sm text-slate-500 mb-4">Last Synced: {integ.lastSync}</p>
               <div className="flex gap-2 items-center">
                  <button onClick={() => toggleIntegration(integ.name)} className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${integ.status === 'Connected' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                     {integ.status === 'Connected' ? 'Disconnect' : 'Connect'}
                  </button>
                  <button onClick={() => setActiveConfig(integ.name)} className="px-4 py-2 text-sm font-medium bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 flex items-center gap-1">
                     <Settings className="w-4 h-4" /> Config
                  </button>
               </div>
            </div>
         ))}
      </div>

      {/* Mock Config Modal */}
      {activeConfig && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-96 text-center">
               <Settings className="w-10 h-10 text-slate-400 mx-auto mb-4" />
               <h3 className="font-bold text-lg text-slate-800 mb-2">Configure {activeConfig}</h3>
               <p className="text-sm text-slate-500 mb-6">API Key and Secret configuration would go here.</p>
               <button onClick={() => setActiveConfig(null)} className="px-4 py-2 bg-slate-100 text-slate-600 font-bold rounded hover:bg-slate-200">Close</button>
            </div>
         </div>
      )}
    </div>
  );
};