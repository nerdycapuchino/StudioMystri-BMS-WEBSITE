
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';

export const Login: React.FC = () => {
  const { setCurrentUser, companySettings } = useGlobal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background-dark relative overflow-hidden">
      {/* Dynamic Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background-dark via-surface-dark to-black opacity-90"></div>
        <img 
            src={companySettings.loginBackgroundUrl || "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2053&auto=format&fit=crop"} 
            className="w-full h-full object-cover opacity-30" 
            alt="Background" 
        />
      </div>

      <div className="relative z-10 w-full max-w-[400px] bg-surface-dark/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-10 shadow-2xl">
         <div className="text-center mb-8">
            {/* Dynamic Logo Placeholder */}
            <div className="mx-auto mb-6 w-[100px] h-[100px] bg-white rounded-2xl border border-white/10 flex items-center justify-center overflow-hidden p-2">
               {companySettings.logoUrl ? (
                   <img src={companySettings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
               ) : (
                   <div className="font-black text-4xl text-black">M</div>
               )}
            </div>
            <h1 className="text-2xl font-black text-white tracking-tighter uppercase">{companySettings.name}</h1>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Enterprise Login</p>
         </div>

         <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-zinc-400 uppercase ml-3">Email ID</label>
               <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="Enter your email"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                  required
               />
            </div>
            <div className="space-y-1.5">
               <label className="text-[11px] font-bold text-zinc-400 uppercase ml-3">Password</label>
               <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-3.5 text-white text-sm focus:ring-1 focus:ring-primary focus:border-primary transition-all outline-none"
                  required
               />
            </div>

            <div className="flex items-center gap-2 ml-1">
               <input 
                  type="checkbox" 
                  id="remember" 
                  checked={rememberMe} 
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded bg-black/40 border-white/10 text-primary focus:ring-0 cursor-pointer" 
               />
               <label htmlFor="remember" className="text-xs text-zinc-400 font-medium cursor-pointer select-none">Remember Me</label>
            </div>

            <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-primary text-black font-black text-sm uppercase tracking-widest py-4 rounded-xl shadow-glow hover:scale-[1.02] active:scale-95 transition-all mt-2"
            >
               {loading ? 'Logging in...' : 'Login'}
            </button>
         </form>
      </div>
    </div>
  );
};
