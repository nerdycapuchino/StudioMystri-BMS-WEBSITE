import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
  const { setUserRole, addActivity } = useGlobal();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Mock Authentication Delay
    setTimeout(() => {
      if (email === 'admin@studiomystri.com' && password === 'admin123') {
        setUserRole('Super Admin');
        addActivity('Super Admin logged in', 'alert');
      } else if (email === 'alex@studiomystri.com') {
         setUserRole('Architect');
      } else if (email === 'sarah@studiomystri.com') {
         setUserRole('Sales');
      } else {
        setError('Invalid credentials');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col md:flex-row max-w-4xl">
         {/* Brand Section */}
         <div className="bg-indigo-600 p-8 md:w-1/2 flex flex-col justify-center text-white">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-600 font-bold text-2xl mb-6">M</div>
            <h1 className="text-3xl font-bold mb-2">Studio Mystri BMS</h1>
            <p className="text-indigo-100 mb-8">Comprehensive management for modern design studios.</p>
            <div className="space-y-4 text-sm opacity-80">
               <div className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full"></div> POS & Sales</div>
               <div className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full"></div> Project Management</div>
               <div className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full"></div> Business ERP</div>
            </div>
         </div>

         {/* Form Section */}
         <div className="p-8 md:w-1/2 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Welcome Back</h2>
            <form onSubmit={handleLogin} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input 
                       type="email" 
                       value={email}
                       onChange={(e) => setEmail(e.target.value)}
                       className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                       placeholder="name@company.com"
                     />
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                  <div className="relative">
                     <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input 
                       type="password" 
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all"
                       placeholder="••••••••"
                     />
                  </div>
               </div>
               
               {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}

               <button 
                 type="submit" 
                 disabled={loading}
                 className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Login <ArrowRight className="w-4 h-4" /></>}
               </button>
            </form>
            <div className="mt-6 text-center text-xs text-slate-400">
               Protected by Enterprise Grade Security
            </div>
         </div>
      </div>
    </div>
  );
};