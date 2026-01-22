
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Employee, UserRole, AppModule, CompanyPolicy } from '../types';
import { FileText, Download, Edit2, X, Eye, Upload } from 'lucide-react';

export const HR: React.FC = () => {
  const { employees, addEmployee, updateEmployee, userRoles, addRole, formatCurrency, policies, updatePolicy } = useGlobal();
  const [activeTab, setActiveTab] = useState<'staff' | 'roles' | 'policies'>('staff');
  
  // Modals
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [showEditStaff, setShowEditStaff] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [showAddRole, setShowAddRole] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<CompanyPolicy | null>(null);
  const [policyContent, setPolicyContent] = useState('');

  // Forms
  const [newStaff, setNewStaff] = useState<Partial<Employee>>({ 
      name: '', email: '', roleId: '', salary: 0, 
      dob: '', currentAddress: '', permanentAddress: '', bloodGroup: '', emergencyContact: '', idProof: '', notes: ''
  });
  const [newRole, setNewRole] = useState<Partial<UserRole>>({ name: '', allowedModules: [AppModule.DASHBOARD] });
  const [customRoleInput, setCustomRoleInput] = useState(false);

  const handleNameChange = (name: string) => {
      const email = name ? `${name.split(' ')[0].toLowerCase()}.${name.split(' ').pop()?.charAt(0).toLowerCase() || 'x'}@studios.com` : '';
      setNewStaff({ ...newStaff, name, email });
  };

  const handleAddStaff = () => {
    if(newStaff.name && newStaff.email && newStaff.roleId) {
      addEmployee({
        ...newStaff, 
        id: Math.random().toString(36).substr(2, 9), 
        joinDate: new Date().toLocaleDateString(), 
        status: 'Active', 
        attendance: 'Absent',
        credentials: { username: newStaff.email, initialPass: 'Welcome@123' }
      } as Employee);
      setShowAddStaff(false);
      resetStaffForm();
    }
  };

  const handleUpdateStaff = () => {
      if(selectedEmp && newStaff.name) {
          updateEmployee(selectedEmp.id, newStaff);
          setShowEditStaff(false);
          resetStaffForm();
      }
  };

  const resetStaffForm = () => {
      setNewStaff({ name: '', email: '', roleId: '', salary: 0, dob: '', currentAddress: '', permanentAddress: '', bloodGroup: '', emergencyContact: '', idProof: '', notes: '' });
      setSelectedEmp(null);
  };

  const openEditStaff = (emp: Employee) => {
      setSelectedEmp(emp);
      setNewStaff(emp); // Pre-fill
      setShowEditStaff(true);
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

  const openPolicy = (p: CompanyPolicy) => {
      setEditingPolicy(p);
      setPolicyContent(p.content || 'No content drafted.');
  };

  const savePolicy = () => {
      if (editingPolicy) {
          updatePolicy(editingPolicy.id, { content: policyContent, lastUpdated: new Date().toLocaleDateString() });
          setEditingPolicy(null);
      }
  };

  const handleFileUpload = () => {
      alert("Simulated: ID Proof uploaded successfully.");
      setNewStaff({...newStaff, idProof: 'uploaded_doc.pdf'});
  };

  return (
    <div className="h-full flex flex-col bg-background-dark overflow-hidden">
      {/* Module Header */}
      <div className="p-6 md:p-10 pb-0 border-b border-white/5 bg-surface-dark/30 shrink-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
          <div>
             <h2 className="text-2xl md:text-4xl font-black text-white tracking-tighter">Human Resources</h2>
             <div className="flex gap-4 md:gap-8 mt-6 overflow-x-auto no-scrollbar">
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
              onClick={() => { resetStaffForm(); activeTab === 'staff' ? setShowAddStaff(true) : setShowAddRole(true); }} 
              className="px-6 md:px-8 py-3 md:py-4 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full shadow-glow active:scale-95 transition-transform whitespace-nowrap"
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
                <div key={emp.id} onClick={() => openEditStaff(emp)} className="bg-surface-dark p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all group relative cursor-pointer">
                   <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                       <Edit2 className="w-4 h-4 text-zinc-400" />
                   </div>
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
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                         <span className="material-symbols-outlined text-sm">call</span>
                         {emp.phone || 'N/A'}
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
               <div key={policy.id} onClick={() => openPolicy(policy)} className="bg-surface-dark border border-white/5 rounded-3xl p-6 hover:border-primary/30 transition-all group cursor-pointer">
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
                     <Eye className="w-4 h-4" /> View Policy
                  </button>
               </div>
             ))}
          </div>
        )}
      </div>

      {/* Add/Edit Staff Modal */}
      {(showAddStaff || showEditStaff) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
           <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-2xl font-black text-white tracking-tight">{showEditStaff ? 'Edit Profile' : 'Onboard Staff'}</h3>
                 <button onClick={() => { setShowAddStaff(false); setShowEditStaff(false); resetStaffForm(); }} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
              </div>
              
              <div className="space-y-4">
                 {/* Basic Info */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Full Legal Name</label>
                        <input value={newStaff.name} onChange={e => handleNameChange(e.target.value)} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="John Doe" />
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Corporate Email</label>
                        <input value={newStaff.email} readOnly={!showAddStaff} className="w-full bg-background-dark/50 border border-white/10 rounded-full px-6 py-4 text-zinc-400 outline-none" />
                     </div>
                 </div>

                 {/* Role & Salary */}
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Employment Type</label>
                        {!customRoleInput ? (
                            <div className="relative">
                                <select value={newStaff.roleId} onChange={e => {
                                    if(e.target.value === 'custom') setCustomRoleInput(true);
                                    else setNewStaff({...newStaff, roleId: e.target.value});
                                }} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer">
                                    <option value="" disabled className="text-zinc-500">Select Role</option>
                                    {userRoles.map(r => <option key={r.id} value={r.id} className="bg-surface-dark text-white">{r.name}</option>)}
                                    <option value="custom" className="text-primary font-bold">+ Custom Role</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">expand_more</span>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <input autoFocus placeholder="Enter Role" className="flex-1 bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:outline-none focus:border-primary" />
                                <button onClick={() => setCustomRoleInput(false)} className="px-4 text-xs font-bold text-zinc-400 hover:text-white">Cancel</button>
                            </div>
                        )}
                     </div>
                     <div className="space-y-1">
                        <label className="text-[10px] font-black text-zinc-500 uppercase ml-4">Salary</label>
                        <input type="number" value={newStaff.salary || ''} onChange={e => setNewStaff({...newStaff, salary: Number(e.target.value)})} className="w-full bg-background-dark border border-white/10 rounded-full px-6 py-4 text-white focus:ring-1 focus:ring-primary outline-none" placeholder="0.00" />
                     </div>
                 </div>

                 {/* Personal Details */}
                 <div className="bg-white/5 p-6 rounded-[2rem] space-y-4">
                     <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Personal Details</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
                             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Date of Birth</label>
                             <input value={newStaff.dob} onChange={e => setNewStaff({...newStaff, dob: e.target.value})} type="date" className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                         </div>
                         <div>
                             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Blood Group</label>
                             <input value={newStaff.bloodGroup} onChange={e => setNewStaff({...newStaff, bloodGroup: e.target.value})} placeholder="e.g. O+" className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                         </div>
                         <div className="md:col-span-2">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Current Address</label>
                             <input value={newStaff.currentAddress} onChange={e => setNewStaff({...newStaff, currentAddress: e.target.value})} placeholder="Current Residence" className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                         </div>
                         <div className="md:col-span-2">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Permanent Address</label>
                             <input value={newStaff.permanentAddress} onChange={e => setNewStaff({...newStaff, permanentAddress: e.target.value})} placeholder="Permanent Residence" className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                         </div>
                         <div className="md:col-span-2">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Emergency Contact</label>
                             <input value={newStaff.emergencyContact} onChange={e => setNewStaff({...newStaff, emergencyContact: e.target.value})} placeholder="Name & Phone Number" className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary" />
                         </div>
                         <div className="md:col-span-2">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">Notes / Remarks</label>
                             <textarea value={newStaff.notes} onChange={e => setNewStaff({...newStaff, notes: e.target.value})} placeholder="Internal HR Notes" className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-primary h-20 resize-none" />
                         </div>
                         <div className="md:col-span-2">
                             <label className="text-[10px] font-bold text-zinc-500 uppercase ml-2">ID Proof</label>
                             <div className="flex gap-4 items-center">
                                 <button onClick={handleFileUpload} className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/10"><Upload className="w-4 h-4"/> Upload Document</button>
                                 {newStaff.idProof && <span className="text-green-500 text-xs font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> {newStaff.idProof}</span>}
                             </div>
                         </div>
                     </div>
                 </div>
              </div>

              <div className="flex gap-4 pt-4">
                 <button onClick={() => { setShowAddStaff(false); setShowEditStaff(false); resetStaffForm(); }} className="flex-1 py-4 bg-white/5 text-white font-bold rounded-full">Cancel</button>
                 <button onClick={showEditStaff ? handleUpdateStaff : handleAddStaff} className="flex-1 py-4 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-full shadow-glow">
                     {showEditStaff ? 'Save Changes' : 'Confirm Onboarding'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
           {/* ... existing role modal ... */}
           {/* (omitted for brevity, assume unchanged) */}
           <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl space-y-8">
              <div className="flex justify-between items-center">
                 <h3 className="text-2xl font-black text-white tracking-tight">Define Access Type</h3>
                 <button onClick={() => setShowAddRole(false)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
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

      {/* Policy View/Edit Modal */}
      {editingPolicy && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
              <div className="bg-surface-dark border border-white/10 rounded-[2.5rem] w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl">
                  {/* ... existing policy modal ... */}
                  {/* (omitted for brevity) */}
                  <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                      <div>
                          <h3 className="text-2xl font-black text-white">{editingPolicy.title}</h3>
                          <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">{editingPolicy.category} • Last Update: {editingPolicy.lastUpdated}</p>
                      </div>
                      <button onClick={() => setEditingPolicy(null)} className="text-zinc-500 hover:text-white"><X className="w-6 h-6"/></button>
                  </div>
                  <div className="flex-1 p-8 bg-background-dark/50">
                      <textarea 
                          value={policyContent} 
                          onChange={e => setPolicyContent(e.target.value)} 
                          className="w-full h-full bg-transparent text-zinc-300 border-none outline-none resize-none leading-relaxed text-sm font-mono"
                          placeholder="Enter policy content here..."
                      />
                  </div>
                  <div className="p-6 border-t border-white/5 flex justify-end gap-4 shrink-0">
                      <button className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full font-bold text-white hover:bg-white/10"><Download className="w-4 h-4"/> Download PDF</button>
                      <button onClick={savePolicy} className="px-8 py-3 bg-primary text-black font-black uppercase text-xs tracking-widest rounded-full shadow-glow">Save Changes</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// Placeholder for CheckCircle2 if missing
const CheckCircle2 = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
);
