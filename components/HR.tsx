
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Employee, UserRole, AppModule } from '../types';
import { FileText, Download } from 'lucide-react';

export const HR: React.FC = () => {
  const { employees, addEmployee, userRoles, addRole, formatCurrency, policies } = useGlobal();
  const [activeTab, setActiveTab] = useState<'staff' | 'roles' | 'policies'>('staff');
  
  // Modals
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);

  // Forms
  const [newStaff, setNewStaff] = useState<Partial<Employee>>({ name: '', email: '', roleId: '', salary: 0 });
  const [newRole, setNewRole] = useState<Partial<UserRole>>({ name: '', allowedModules: [AppModule.DASHBOARD] });

  const handleAddStaff = () => {
    if(newStaff.name && newStaff.email && newStaff.roleId) {
      addEmployee({
        ...newStaff, id: Math.random().toString(36).substr(2, 9), joinDate: new Date().toLocaleDateString(), status: 'Active', attendance: 'Absent'
      } as Employee);
      setShowAddStaff(false);
      setNewStaff({ name: '', email: '', roleId: '', salary: 0 });
    }
  };

  const handleAddRole = () => {
    if(newRole.name) {
      addRole({
        ...newRole, 
        id: newRole.name.toLowerCase().replace(/\s+/g, '-'), 
        description: `Custom access for ${newRole.name}`
      } as UserRole);
      setShowAddRole(false);
      setNewRole({ name: '', allowedModules: [AppModule.DASHBOARD] });
    }
  };

  const toggleModule = (mod: AppModule) => {
    const current = newRole.allowedModules || [];
    if (current.includes(mod)) setNewRole({...newRole, allowedModules: current.filter(m => m !== mod)});
    else setNewRole({...newRole, allowedModules: [...current, mod]});
  };

  return (
    <div className="h-full flex flex-col bg-background-dark overflow-hidden">
      {/* Module Header */}
      <div className="p-6 md:p-10 pb-0 border-b border-white/5 bg-surface-dark/30 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
             <h2 className="text-4xl font-black text-white tracking-tighter">Human Resources</h2>
             <div className="flex gap-8 mt-6 overflow-x-auto no-scrollbar">
                <button 
                  onClick={() => setActiveTab('staff')} 
                  className={`text-xs font-black uppercase tracking-widest pb-3 border-b-2 transition-all shrink-0 ${activeTab === 'staff' ? 'border-primary text-primary' : 'border-transparent text-zinc-600'}`}
                >
                  Staff Directory
                </button>
                <button 
                  onClick={() => setActiveTab('roles')} 
                  className={`text-xs font-black uppercase tracking-widest pb-3 border-b-2 transition-all shrink-0 ${activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-zinc-600'}`}
                >
                  Employee Types & Access
                </button>
                <button 
                  onClick={() => setActiveTab('policies')} 
                  className={`text-xs font-black uppercase tracking-widest pb-3 border-b-2 transition-all shrink-0 ${activeTab === 'policies' ? 'border-primary text-primary' : 'border-transparent text-zinc-600'}`}
                >
                  Corporate Policies
                </button>
             </div>
          </div>
          {activeTab !== 'policies' && (
            <button 
              onClick={() => activeTab === 'staff' ? setShowAddStaff(true) : setShowAddRole(true)} 
              className="px-8 py-4 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full shadow-glow active:scale-95 transition-transform"
            >
               + {activeTab === 'staff' ? 'Onboard Staff' : 'Define New Type'}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 bg-[#0c1410]">
        {activeTab === 'staff' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-20">
              {employees.map(emp => (
                <div key={emp.id} className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group relative">
                   <div className="size-14 bg-white/5 rounded-full mb-4 flex items-center justify-center font-black text-zinc-500 text-lg border border-white/5">
                      {emp.name.charAt(0)}
                   </div>
                   <h3 className="text-white font-bold text-lg leading-tight">{emp.name}</h3>
                   <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-1 mb-4">
                      {userRoles.find(r => r.id === emp.roleId)?.name || 'Generic Staff'}
                   </p>
                   <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                         <span className="material-symbols-outlined text-sm">mail</span>
                         {emp.email}
                      </div>
                   </div>
                   <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-[10px] font-black text-zinc-600 uppercase">Monthly Salary</span>
                      <span className="text-white font-mono font-bold">{formatCurrency(emp.salary)}</span>
                   </div>
                </div>
              ))}
              {employees.length === 0 && (
                <div className="col-span-full py-20 text-center text-zinc-600 italic">No employees found.</div>
              )}
           </div>
        ) : activeTab === 'roles' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 pb-20">
             {userRoles.map(role => (
               <div key={role.id} className="bg-surface-darker p-8 rounded-3xl border border-white/10 hover:border-primary/30 transition-all flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white tracking-tight">{role.name}</h3>
                    <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-[10px] font-black uppercase">Role</div>
                  </div>
                  <p className="text-zinc-500 text-sm mb-8 leading-relaxed">{role.description}</p>
                  
                  <div className="mt-auto">
                     <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Module Permissions</p>
                     <div className="flex flex-wrap gap-2">
                        {role.allowedModules.map(mod => (
                           <span key={mod} className="text-[10px] font-bold text-zinc-300 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">{mod}</span>
                        ))}
                     </div>
                  </div>
               </div>
             ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {policies.map(policy => (
               <div key={policy.id} className="bg-surface-dark border border-white/5 rounded-3xl p-6 hover:border-primary/30 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-6">
                     <div className="size-14 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                        <FileText className="w-7 h-7" />
                     </div>
                     <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-black/20 px-3 py-1 rounded-full">{policy.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{policy.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-zinc-500 font-medium">
                     <span>Updated: {policy.lastUpdated}</span>
                     <span>•</span>
                     <span>{policy.size}</span>
                  </div>
                  <button className="w-full mt-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 text-white group-hover:bg-primary group-hover:text-black transition-colors">
                     <Download className="w-4 h-4" /> Download PDF
                  </button>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
           <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-10 w-full max-w-lg shadow-2xl space-y-6">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-2xl font-black text-white tracking-tight">Onboard Staff</h3>
                 <button onClick={() => setShowAddStaff(false)} className="text-zinc-500 hover:text-white"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="space-y-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Full Legal Name</label>
                    <input value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="John Doe" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Corporate Email</label>
                    <input value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="name@studiomystri.com" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Employment Type (Role)</label>
                    <select value={newStaff.roleId} onChange={e => setNewStaff({...newStaff, roleId: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer">
                       <option value="" disabled>Select Employee Type</option>
                       {userRoles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Monthly Base Salary</label>
                    <input type="number" value={newStaff.salary || ''} onChange={e => setNewStaff({...newStaff, salary: Number(e.target.value)})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="0.00" />
                 </div>
              </div>
              <div className="flex gap-4 pt-6">
                 <button onClick={() => setShowAddStaff(false)} className="flex-1 py-4 bg-white/5 text-white font-bold rounded-full">Cancel</button>
                 <button onClick={handleAddStaff} className="flex-1 py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-full shadow-glow">Confirm</button>
              </div>
           </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
           <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-white tracking-tight">Define Access Type</h3>
                 <button onClick={() => setShowAddRole(false)} className="text-zinc-500 hover:text-white"><span className="material-symbols-outlined">close</span></button>
              </div>
              <div className="space-y-6">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Designation Title</label>
                    <input value={newRole.name} onChange={e => setNewRole({...newRole, name: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. Warehouse Worker" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4 mb-4 block">Select Authorized Modules</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                       {Object.values(AppModule).map(mod => (
                         <button 
                            key={mod} 
                            onClick={() => toggleModule(mod)}
                            className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between ${newRole.allowedModules?.includes(mod) ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/5 text-zinc-600'}`}
                         >
                            {mod}
                            {newRole.allowedModules?.includes(mod) && <span className="material-symbols-outlined text-sm">check_circle</span>}
                         </button>
                       ))}
                    </div>
                 </div>
              </div>
              <div className="flex gap-4 pt-4">
                 <button onClick={() => setShowAddRole(false)} className="flex-1 py-4 bg-white/5 text-white font-bold rounded-full">Cancel</button>
                 <button onClick={handleAddRole} className="flex-1 py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-full shadow-glow">Create Role</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
