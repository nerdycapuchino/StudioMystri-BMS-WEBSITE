

import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Shield, UserPlus, Edit, Trash2, X, Check, Link, Lock, Eye, EyeOff, Key, Building2, Landmark, Image } from 'lucide-react';
import { User, AccessLevel } from '../types';

export const Admin: React.FC = () => {
  const { users, addUser, updateUserStatus, deleteUser, employees, permissions, updatePermission, currentUser, companySettings, updateCompanySettings } = useGlobal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCreds, setShowCreds] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', email: '', role: 'Sales', status: 'Active' });
  const [activeTab, setActiveTab] = useState<'users' | 'security' | 'credentials' | 'settings'>('users');

  const safeUsers = users || [];
  const safePermissions = permissions || [];

  const handleCreate = () => {
    if (newUser.name && newUser.email) {
      addUser({
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name,
        email: newUser.email,
        roleId: newUser.role ? newUser.role.toLowerCase() : 'sales',
        role: newUser.role,
        status: newUser.status as any
      } as User);
      setShowAddModal(false);
      setNewUser({ name: '', email: '', role: 'Sales', status: 'Active' });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'loginBackgroundUrl') => {
      if (e.target.files && e.target.files[0]) {
          const url = URL.createObjectURL(e.target.files[0]);
          updateCompanySettings({ [field]: url });
      }
  };

  const roles = ['Super Admin', 'Architect', 'Sales', 'Logistics', 'HR', 'Finance'];
  const secureFields = [
    { key: 'salary', label: 'Employee Salary' },
    { key: 'costPrice', label: 'Inventory Cost Price' },
    { key: 'leadValue', label: 'CRM Lead Value' },
    { key: 'projectBudget', label: 'Project Budget' },
    { key: 'customerContact', label: 'Customer Phone/Email' },
    { key: 'profitMargin', label: 'Product Profit Margin' },
    { key: 'bankDetails', label: 'Company Bank Details' }
  ];

  return (
    <div className="h-full flex flex-col relative bg-background-light dark:bg-background-dark text-white p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Admin & Security</h2>
           <p className="text-zinc-400 text-sm mt-1">Manage users, roles, and data access.</p>
        </div>
        <div className="flex bg-surface-dark p-1 rounded-xl border border-white/5 overflow-x-auto">
           <button onClick={() => setActiveTab('users')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-primary text-background-dark shadow-glow' : 'text-zinc-400 hover:text-white'}`}>Users</button>
           <button onClick={() => setActiveTab('security')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'security' ? 'bg-primary text-background-dark shadow-glow' : 'text-zinc-400 hover:text-white'}`}>Field Security</button>
           {currentUser?.roleId === 'admin' && (
               <>
                   <button onClick={() => setActiveTab('credentials')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'credentials' ? 'bg-primary text-background-dark shadow-glow' : 'text-zinc-400 hover:text-white'}`}>Credentials</button>
                   <button onClick={() => setActiveTab('settings')} className={`px-6 py-2 text-sm font-bold rounded-lg transition-all whitespace-nowrap ${activeTab === 'settings' ? 'bg-primary text-background-dark shadow-glow' : 'text-zinc-400 hover:text-white'}`}>Company Settings</button>
               </>
           )}
        </div>
      </div>

      {activeTab === 'users' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAddModal(true)} className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full text-sm font-bold flex items-center gap-2 transition-all">
              <UserPlus className="w-4 h-4 text-primary" /> Add User
            </button>
          </div>
          <div className="bg-surface-dark rounded-2xl shadow-xl border border-white/5 overflow-hidden flex-1">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-surface-highlight text-zinc-400 font-medium uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">HR Link</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {safeUsers.map(user => {
                     const linkedEmp = employees.find(e => e.id === user.linkedEmployeeId || e.email === user.email);
                     return (
                    <tr key={user.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{user.name}</td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-primary" />
                            <span className="text-zinc-300">{user.role}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono text-xs">{user.email}</td>
                      <td className="px-6 py-4">
                         {linkedEmp ? (
                            <span className="flex items-center gap-1 text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20 w-fit uppercase font-bold tracking-wider">
                               <Link className="w-3 h-3" /> Linked
                            </span>
                         ) : (
                            <span className="text-xs text-zinc-600 italic">No HR Record</span>
                         )}
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => updateUserStatus(user.id, user.status === 'Active' ? 'Inactive' : 'Active')}
                          className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors border ${
                          user.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'
                        }`}>
                          {user.status}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => deleteUser(user.id)} className="p-2 text-zinc-400 hover:text-red-500 bg-white/5 hover:bg-red-500/10 rounded-full transition-colors" title="Delete User">
                           <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Security Tab Omitted for Brevity - Keeping Existing logic */}
      {activeTab === 'security' && (
        <div className="bg-surface-dark p-8 rounded-2xl shadow-xl border border-white/5 overflow-y-auto">
           <h3 className="font-bold text-xl text-white mb-2 flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Field-Level Security Matrix</h3>
           <p className="text-sm text-zinc-400 mb-8 max-w-2xl">Define visibility and edit access for sensitive data fields per user role. "Hidden" completely redacts values from the UI.</p>
           
           <div className="overflow-x-auto">
              <table className="w-full text-sm">
                 <thead>
                    <tr className="border-b border-white/10">
                       <th className="px-4 py-4 text-left font-bold text-zinc-400 uppercase tracking-wider text-xs whitespace-nowrap sticky left-0 bg-surface-dark z-10">Sensitive Field</th>
                       {roles.map(role => (
                          <th key={role} className="px-4 py-4 text-center font-bold text-zinc-400 uppercase tracking-wider text-xs whitespace-nowrap">{role}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {secureFields.map(field => (
                       <tr key={field.key} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-4 font-bold text-white sticky left-0 bg-surface-dark z-10">{field.label}</td>
                          {roles.map(role => {
                             const currentPerm = safePermissions.find(p => p.role === role && p.field === field.key)?.access || 'read-write';
                             return (
                                <td key={`${role}-${field.key}`} className="px-4 py-4 text-center">
                                   <div className="flex justify-center">
                                      <div className="relative">
                                        <select 
                                          className={`text-xs border rounded-lg pl-3 pr-8 py-2 appearance-none cursor-pointer font-bold outline-none transition-all ${
                                            currentPerm === 'read-write' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                            currentPerm === 'read-only' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                            'bg-white/5 text-zinc-500 border-white/10'
                                          }`}
                                          value={currentPerm}
                                          onChange={(e) => updatePermission(role, field.key, e.target.value as AccessLevel)}
                                        >
                                          <option value="read-write">Write</option>
                                          <option value="read-only">Read</option>
                                          <option value="hidden">Hidden</option>
                                        </select>
                                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[14px] pointer-events-none opacity-50">expand_more</span>
                                      </div>
                                   </div>
                                </td>
                             );
                          })}
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Credentials Tab Omitted for Brevity - Keeping Existing logic */}
      {activeTab === 'credentials' && (
          <div className="bg-surface-dark p-8 rounded-2xl shadow-xl border border-white/5 overflow-y-auto">
              <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2"><Key className="w-5 h-5 text-primary"/> Employee Login Credentials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {employees.map(emp => (
                      <div key={emp.id} className="bg-surface-highlight border border-white/5 p-6 rounded-2xl">
                          <div className="flex justify-between items-start mb-4">
                              <div>
                                  <h4 className="font-bold text-white">{emp.name}</h4>
                                  <p className="text-xs text-zinc-500">{emp.role}</p>
                              </div>
                              <button onClick={() => setShowCreds(showCreds === emp.id ? null : emp.id)} className="text-zinc-400 hover:text-white">
                                  {showCreds === emp.id ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                              </button>
                          </div>
                          
                          {showCreds === emp.id ? (
                              <div className="bg-black/40 p-4 rounded-xl space-y-2">
                                  <div className="flex justify-between text-xs">
                                      <span className="text-zinc-500">Username</span>
                                      <span className="text-white font-mono">{emp.email}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                      <span className="text-zinc-500">Password</span>
                                      <span className="text-primary font-mono">{emp.credentials?.initialPass || 'Welcome@123'}</span>
                                  </div>
                              </div>
                          ) : (
                              <div className="bg-black/40 p-4 rounded-xl flex items-center justify-center text-zinc-600 text-xs italic">
                                  Credentials Hidden
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      )}

      {activeTab === 'settings' && (
          <div className="bg-surface-dark p-8 rounded-2xl shadow-xl border border-white/5 overflow-y-auto">
              <h3 className="font-bold text-xl text-white mb-6 flex items-center gap-2"><Building2 className="w-5 h-5 text-primary"/> Company Profile & Invoice Settings</h3>
              <div className="max-w-3xl space-y-8">
                  {/* Branding Images */}
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6">
                      <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2"><Image className="w-4 h-4"/> Branding Assets</h4>
                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-zinc-500 uppercase">Logo (Nav & Invoices)</label>
                              <div className="flex items-center gap-4">
                                  <div className="size-16 bg-white rounded-lg p-2 shrink-0 border border-white/10 flex items-center justify-center">
                                      {companySettings.logoUrl ? <img src={companySettings.logoUrl} className="max-w-full max-h-full object-contain" /> : <span className="text-black text-xs">No Logo</span>}
                                  </div>
                                  <label className="cursor-pointer px-4 py-2 bg-primary/10 text-primary rounded-lg text-xs font-bold hover:bg-primary/20 transition-colors">
                                      Upload Logo
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logoUrl')} />
                                  </label>
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="text-xs font-bold text-zinc-500 uppercase">Login Screen Background</label>
                              <div className="flex items-center gap-4">
                                  <div className="h-16 w-24 bg-black rounded-lg shrink-0 border border-white/10 overflow-hidden">
                                      {companySettings.loginBackgroundUrl ? <img src={companySettings.loginBackgroundUrl} className="w-full h-full object-cover" /> : <span className="text-zinc-600 text-[10px] flex items-center justify-center h-full">Default</span>}
                                  </div>
                                  <label className="cursor-pointer px-4 py-2 bg-white/5 text-white rounded-lg text-xs font-bold hover:bg-white/10 transition-colors">
                                      Upload BG
                                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'loginBackgroundUrl')} />
                                  </label>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* General Info */}
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6">
                      <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest border-b border-white/5 pb-2">Organization Details</h4>
                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-500 uppercase">Company Name</label>
                              <input value={companySettings.name} onChange={e => updateCompanySettings({ name: e.target.value })} className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary text-sm" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-500 uppercase">GSTIN / Tax ID</label>
                              <input value={companySettings.gstNumber} onChange={e => updateCompanySettings({ gstNumber: e.target.value })} className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary text-sm" />
                          </div>
                      </div>
                      <div className="space-y-1">
                          <label className="text-xs font-bold text-zinc-500 uppercase">Registered Address</label>
                          <textarea value={companySettings.address} onChange={e => updateCompanySettings({ address: e.target.value })} className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary text-sm h-24" />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-500 uppercase">Contact Email</label>
                              <input value={companySettings.email} onChange={e => updateCompanySettings({ email: e.target.value })} className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary text-sm" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-500 uppercase">Contact Phone</label>
                              <input value={companySettings.phone} onChange={e => updateCompanySettings({ phone: e.target.value })} className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary text-sm" />
                          </div>
                      </div>
                  </div>

                  {/* Bank Details */}
                  <div className="bg-white/5 p-6 rounded-2xl border border-white/5 space-y-6">
                      <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-2"><Landmark className="w-4 h-4"/> Banking Information</h4>
                      <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-500 uppercase">Bank Name</label>
                              <input value={companySettings.bankName || ''} onChange={e => updateCompanySettings({ bankName: e.target.value })} className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary text-sm" placeholder="e.g., HDFC Bank" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-500 uppercase">Account Number</label>
                              <input value={companySettings.accountNo || ''} onChange={e => updateCompanySettings({ accountNo: e.target.value })} className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary text-sm" placeholder="XXXX XXXX XXXX" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-500 uppercase">IFSC Code</label>
                              <input value={companySettings.ifsc || ''} onChange={e => updateCompanySettings({ ifsc: e.target.value })} className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary text-sm" placeholder="HDFC0001234" />
                          </div>
                          <div className="space-y-1">
                              <label className="text-xs font-bold text-zinc-500 uppercase">Branch Name</label>
                              <input value={companySettings.branch || ''} onChange={e => updateCompanySettings({ branch: e.target.value })} className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-primary text-sm" placeholder="e.g., Navrangpura" />
                          </div>
                      </div>
                  </div>

                  <button className="px-8 py-3 bg-primary text-black font-bold rounded-xl shadow-glow text-sm">Save All Settings</button>
              </div>
          </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
           <div className="bg-surface-dark border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-xl text-white">Add New User</h3>
                 <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4">
                 <input className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                 <input className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                 <div className="relative">
                    <select className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary focus:outline-none appearance-none" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                        <option value="Super Admin">Super Admin</option>
                        <option value="Architect">Architect</option>
                        <option value="Sales">Sales</option>
                        <option value="Logistics">Logistics</option>
                        <option value="HR">HR</option>
                        <option value="Finance">Finance</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">expand_more</span>
                 </div>
                 <button onClick={handleCreate} className="w-full bg-primary text-background-dark py-3 rounded-xl font-bold hover:bg-[#2ecc71] transition-colors shadow-glow mt-2">Create User</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
