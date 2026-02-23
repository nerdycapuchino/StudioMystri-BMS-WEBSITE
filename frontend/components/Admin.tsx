import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers, useCreateUser, useUpdateUser, useDeactivateUser, useCompanySettings, useUpdateCompanySettings } from '../hooks/useAdmin';
import { useEmployees } from '../hooks/useHR';
import { Settings, Users, Shield, Key, Plus, X, Edit2, Trash2, Save, Building2, Eye, EyeOff, Search, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const Admin: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { data: usersData, isLoading: usersLoading } = useUsers();
  const { data: settingsData, isLoading: settingsLoading } = useCompanySettings();
  const { data: empData } = useEmployees();

  const createUser = useCreateUser();
  const updateUserMut = useUpdateUser();
  const deactivateUser = useDeactivateUser();
  const updateSettings = useUpdateCompanySettings();

  const users: any[] = Array.isArray(usersData?.data || usersData) ? (usersData?.data || usersData) : [];
  const employees: any[] = Array.isArray(empData?.data || empData) ? (empData?.data || empData) : [];
  const companySettings: any = (settingsData?.data || settingsData) || { name: '', address: '', phone: '', email: '', gstNumber: '', logoUrl: '' };

  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'credentials' | 'settings'>('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Viewer', password: '' });
  const [editSettings, setEditSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(companySettings);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const isLoading = usersLoading || settingsLoading;

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      createUser.mutate(newUser as any, {
        onSuccess: () => {
          setShowAddUser(false);
          setNewUser({ name: '', email: '', role: 'Viewer', password: '' });
          toast.success("User added successfully");
        }
      });
    } else {
      toast.error("Name and Email required");
    }
  };

  const handleDeactivateUser = (id: string) => {
    if (confirm('Deactivate this user?')) deactivateUser.mutate(id as any, { onSuccess: () => toast.success("User deactivated") });
  };

  const handleSaveSettings = () => {
    updateSettings.mutate(settingsForm as any, { onSuccess: () => { setEditSettings(false); toast.success("Settings saved"); } });
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-6 space-y-6">
        <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse w-48" />
        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 h-full overflow-hidden">

      {/* Header Section */}
      <header className="flex-shrink-0 bg-white dark:bg-[#18212f] border-b border-slate-200 dark:border-slate-800 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-6 py-5 w-full">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Administration</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage users, company settings, and access control.</p>
          </div>
          {activeTab === 'permissions' && (
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">Discard</button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-600 transition-all shadow-sm shadow-primary/20 flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="px-6 pb-0 pt-2 border-t border-slate-100 dark:border-slate-800/50 w-full overflow-x-auto hide-scroll">
          <div className="flex items-center gap-1 py-2">
            {[
              { key: 'users' as const, label: 'User Accounts', icon: Users },
              { key: 'permissions' as const, label: 'Role Permissions', icon: Shield },
              { key: 'credentials' as const, label: 'Emp. Credentials', icon: Key },
              { key: 'settings' as const, label: 'Company Profile', icon: Settings },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all whitespace-nowrap ${activeTab === tab.key ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/20">

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input className="pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary w-64" placeholder="Search users..." />
                </div>
              </div>
              <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm shadow-primary/20 hover:bg-blue-600 transition-colors">
                <Plus className="w-4 h-4" /> Add User
              </button>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-600 dark:text-slate-300 uppercase">{u.name.substring(0, 2)}</div>
                        {u.name}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{u.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${u.status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                          {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeactivateUser(u.id)} className="text-red-500 hover:text-red-600 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors tooltip" title="Deactivate"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-slate-400">No users found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Permissions Tab (from template) */}
        {activeTab === 'permissions' && (
          <div className="w-full max-w-[1400px] mx-auto animate-in fade-in duration-300">
            <div className="bg-white dark:bg-[#18212f] border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="sticky left-0 z-10 bg-slate-50/95 dark:bg-[#1e293b] backdrop-blur-sm p-4 min-w-[240px] border-r border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Module / Feature</span>
                      </th>
                      <th className="p-4 min-w-[200px] text-center group hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border-r border-slate-100 dark:border-slate-800/50">
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center mb-1">
                            <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Administrator</span>
                          <span className="text-[10px] font-medium text-slate-400">Full Access</span>
                        </div>
                      </th>
                      <th className="p-4 min-w-[200px] text-center group hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border-r border-slate-100 dark:border-slate-800/50">
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 flex items-center justify-center mb-1">
                            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                          </div>
                          <span class="text-sm font-bold text-slate-800 dark:text-slate-100">Manager</span>
                          <span className="text-[10px] font-medium text-slate-400">Team Lead</span>
                        </div>
                      </th>
                      <th className="p-4 min-w-[200px] text-center group hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border-r border-slate-100 dark:border-slate-800/50">
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-300 flex items-center justify-center mb-1">
                            <span className="material-symbols-outlined text-[18px]">person</span>
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Staff</span>
                          <span className="text-[10px] font-medium text-slate-400">Employee</span>
                        </div>
                      </th>
                      <th className="p-4 min-w-[200px] text-center group hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer">
                        <div className="flex flex-col items-center gap-1">
                          <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300 flex items-center justify-center mb-1">
                            <span className="material-symbols-outlined text-[18px]">engineering</span>
                          </div>
                          <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Artisan</span>
                          <span className="text-[10px] font-medium text-slate-400">Contractor</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">

                    {/* SECTION: PROJECTS */}
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                      <td className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 sticky left-0 z-10 bg-slate-50/50 dark:bg-[#18212f]" colSpan={5}>Project Management</td>
                    </tr>
                    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 sticky left-0 bg-white dark:bg-[#18212f] group-hover:bg-slate-50 dark:group-hover:bg-[#1e293b] border-r border-slate-100 dark:border-slate-800 transition-colors z-10">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">Project Overview</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">View list and details</span>
                        </div>
                      </td>
                      {['Admin', 'Manager', 'Staff', 'Artisan'].map((role, idx) => (
                        <td key={role} className={`p-4 ${idx < 3 ? 'border-r border-slate-50 dark:border-slate-800/50' : ''}`}>
                          <div className="flex justify-center gap-2">
                            <label className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer select-none">
                              <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20" /> R
                            </label>
                            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium select-none ${role === 'Artisan' ? 'opacity-50 cursor-not-allowed text-slate-300 dark:text-slate-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer'}`}>
                              <input type="checkbox" defaultChecked={role !== 'Artisan'} disabled={role === 'Artisan'} className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary/20" /> W
                            </label>
                            <label className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium select-none ${role === 'Admin' ? 'bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 cursor-pointer' : role === 'Manager' ? 'hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-400 hover:text-red-600 cursor-pointer' : 'opacity-50 cursor-not-allowed text-slate-300 dark:text-slate-600'}`}>
                              <input type="checkbox" defaultChecked={role === 'Admin'} disabled={['Staff', 'Artisan'].includes(role)} className="h-4 w-4 rounded border-slate-300 text-red-500 focus:ring-red-500/20" /> D
                            </label>
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* SECTION: FINANCE */}
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                      <td className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 sticky left-0 z-10 bg-slate-50/50 dark:bg-[#18212f]" colSpan={5}>Financial Records</td>
                    </tr>
                    <tr className="group hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 sticky left-0 bg-white dark:bg-[#18212f] group-hover:bg-slate-50 dark:group-hover:bg-[#1e293b] border-r border-slate-100 dark:border-slate-800 transition-colors z-10">
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-900 dark:text-white">Invoicing & Estimates</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">Generate client bills</span>
                        </div>
                      </td>
                      <td className="p-4 border-r border-slate-50 dark:border-slate-800/50 text-center"><span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-400">Full Access</span></td>
                      <td className="p-4 border-r border-slate-50 dark:border-slate-800/50">
                        <div className="flex justify-center gap-2">
                          <label className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"><input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-primary" /> R</label>
                          <label className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"><input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-primary" /> W</label>
                          <label className="flex items-center gap-2 px-3 py-1.5 rounded-md opacity-50 cursor-not-allowed text-xs font-medium text-slate-300"><input type="checkbox" disabled className="h-4 w-4 rounded border-slate-200" /> D</label>
                        </div>
                      </td>
                      <td className="p-4 border-r border-slate-50 dark:border-slate-800/50">
                        <div className="flex justify-center gap-2">
                          <label className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300 cursor-pointer"><input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-primary" /> R</label>
                          <label className="flex items-center gap-2 px-3 py-1.5 rounded-md opacity-50 cursor-not-allowed text-xs font-medium text-slate-300"><input type="checkbox" disabled className="h-4 w-4 rounded border-slate-200" /> W</label>
                          <label className="flex items-center gap-2 px-3 py-1.5 rounded-md opacity-50 cursor-not-allowed text-xs font-medium text-slate-300"><input type="checkbox" disabled className="h-4 w-4 rounded border-slate-200" /> D</label>
                        </div>
                      </td>
                      <td className="p-4 text-center"><span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10 dark:bg-slate-800 dark:text-slate-400">No Access</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-4 items-center justify-between text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-[#18212f] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <span className="font-medium text-slate-900 dark:text-white">Legend:</span>
                <div className="flex items-center gap-1.5"><span className="h-5 w-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold">R</span><span>Read Only</span></div>
                <div className="flex items-center gap-1.5"><span className="h-5 w-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-bold">W</span><span>Write / Edit</span></div>
                <div className="flex items-center gap-1.5"><span className="h-5 w-5 flex items-center justify-center rounded bg-red-50 dark:bg-red-900/20 text-red-600 text-[10px] font-bold">D</span><span>Delete</span></div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Info className="w-4 h-4" />
                <p>Changes take effect immediately upon saving.</p>
              </div>
            </div>
          </div>
        )}

        {/* Credentials Tab */}
        {activeTab === 'credentials' && (
          <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
                <Key className="w-5 h-5 text-slate-400" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Employee Credentials Directory</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Secure access to generated employee logins.</p>
                </div>
              </div>
              <table className="w-full text-sm text-left">
                <thead className="bg-transparent text-slate-500 dark:text-slate-400 font-medium border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Username</th>
                    <th className="px-6 py-4">Initial Password</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {employees.filter(e => e.credentials).map((emp: any) => (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{emp.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-mono text-xs bg-slate-50 dark:bg-slate-900/50 px-2 py-1 rounded inline-block mt-3 ml-4">{emp.credentials?.username || emp.email}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-700 dark:text-slate-300 tracking-widest">{showPasswords[emp.id] ? emp.credentials?.initialPass : '••••••••'}</span>
                          <button onClick={() => setShowPasswords(p => ({ ...p, [emp.id]: !p[emp.id] }))} className="text-slate-400 hover:text-primary transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-primary/20">
                            {showPasswords[emp.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {employees.filter(e => e.credentials).length === 0 && <tr><td colSpan={3} className="py-8 text-center text-slate-400">No credentials found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Company Settings Tab */}
        {activeTab === 'settings' && (
          <div className="w-full max-w-3xl mx-auto animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Building2 className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">Company Profile</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Core organizational details</p>
                  </div>
                </div>
                {!editSettings ? (
                  <button onClick={() => { setEditSettings(true); setSettingsForm(companySettings); }} className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit Profile
                  </button>
                ) : (
                  <button onClick={handleSaveSettings} disabled={updateSettings.isPending} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-sm shadow-primary/20 hover:bg-blue-600 transition-colors disabled:opacity-50">
                    {updateSettings.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save className="w-4 h-4" />} Save
                  </button>
                )}
              </div>

              {editSettings ? (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Company Name</label>
                    <input value={settingsForm.name} onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
                      <input value={settingsForm.phone} onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                      <input value={settingsForm.email} onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Tax ID / GST Number</label>
                    <input value={settingsForm.gstNumber} onChange={e => setSettingsForm({ ...settingsForm, gstNumber: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none font-mono" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Registered Address</label>
                    <textarea value={settingsForm.address} onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none h-24 resize-none" />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-sm">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Company Name</span>
                    <span className="font-semibold text-slate-900 dark:text-white text-base">{companySettings.name || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Email Address</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{companySettings.email || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Phone Number</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{companySettings.phone || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">Tax ID / GST</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">{companySettings.gstNumber || '—'}</span>
                  </div>
                  <div className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Registered Address</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{companySettings.address || '—'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-900 dark:text-white">New User Account</h3>
              <button onClick={() => setShowAddUser(false)} className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-700/50"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name *</label>
                <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="John Doe" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" autoFocus />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address *</label>
                <input type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="john@example.com" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Role Access</label>
                <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none">
                  <option value="Super Admin">Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Initial Password</label>
                <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Leave blank to auto-generate" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>
            <button onClick={handleAddUser} disabled={createUser.isPending} className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-bold shadow-sm shadow-primary/20 hover:bg-blue-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
              {createUser.isPending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Users className="w-4 h-4" />}
              {createUser.isPending ? 'Provisioning...' : 'Provision Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
