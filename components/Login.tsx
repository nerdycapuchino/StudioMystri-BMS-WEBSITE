import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';

export const Login: React.FC = () => {
  const { setCurrentUser, userRoles } = useGlobal();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Demo logic: If email has 'admin', they are Super Admin, otherwise they are Sales
      const isAdmin = email.toLowerCase().includes('admin');
      const isWorker = email.toLowerCase().includes('worker');
      
      let roleId = 'sales';
      if (isAdmin) roleId = 'admin';
      else if (isWorker) roleId = 'worker';

      setCurrentUser({
        id: Math.random().toString(36).substr(2, 9),
        name: email.split('@')[0].toUpperCase(),
        email: email,
        roleId: roleId,
        status: 'Active'
      });
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background-dark relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background-dark via-surface-dark to-black opacity-90"></div>
        <img src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop" className="w-full h-full object-cover opacity-20" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-surface-dark/80 backdrop-blur-2xl border border-white/10 rounded-[3rem] p-10 shadow-2xl">
         <div className="text-center mb-10">
            <div className="size-20 bg-primary/20 rounded-full mx-auto mb-6 flex items-center justify-center text-primary border border-primary/10 shadow-glow">
               <span className="material-symbols-outlined text-4xl">chair</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tighter">STUDIO MYSTRI</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Business Management System</p>
         </div>

         <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
               <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Corporate Identity</label>
               <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="name@studiomystri.com"
                  className="w-full bg-black/40 border border-white/10 rounded-full px-6 py-4 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                  required
               />
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Security Credentials</label>
               <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-full px-6 py-4 text-white focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                  required
               />
            </div>
            <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-primary text-black font-black text-sm uppercase tracking-widest py-5 rounded-full shadow-glow hover:scale-[1.02] active:scale-95 transition-all mt-4"
            >
               {loading ? 'Authorizing...' : 'Establish Connection'}
            </button>
         </form>

         <div className="mt-10 text-center opacity-30">
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Secured by Studio Mystri IT</p>
         </div>
      </div>
    </div>
  );
};