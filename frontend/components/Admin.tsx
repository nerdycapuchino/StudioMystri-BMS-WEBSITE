
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useUsers, useCreateUser, useUpdateUser, useDeactivateUser, useCompanySettings, useUpdateCompanySettings } from '../hooks/useAdmin';
import { useEmployees } from '../hooks/useHR';
import { Settings, Users, Shield, Key, Plus, X, Edit2, Trash2, Save, Building2, Lock, Eye, EyeOff } from 'lucide-react';
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

  const users: any[] = Array.isArray(usersData?.data || usersData) ? (usersData?.data || usersData) as any[] : [];
  const employees: any[] = Array.isArray(empData?.data || empData) ? (empData?.data || empData) as any[] : [];
  const companySettings: any = (settingsData?.data || settingsData) || { name: '', address: '', phone: '', email: '', gstNumber: '', logoUrl: '' };

  const [activeTab, setActiveTab] = useState<'users' | 'security' | 'credentials' | 'settings'>('users');
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
        }
      });
    }
  };

  const handleDeactivateUser = (id: string) => {
    if (confirm('Deactivate this user?')) {
      deactivateUser.mutate(id as any);
    }
  };

  const handleSaveSettings = () => {
    updateSettings.mutate(settingsForm as any, {
      onSuccess: () => setEditSettings(false)
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-6 space-y-6">
        <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse w-48" />
        <div className="flex-1 bg-zinc-800/50 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-2 relative">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Administration</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6 w-fit">
        {[
          { key: 'users' as const, label: 'Users', icon: Users },
          { key: 'security' as const, label: 'Security', icon: Shield },
          { key: 'credentials' as const, label: 'Credentials', icon: Key },
          { key: 'settings' as const, label: 'Company', icon: Settings },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${activeTab === tab.key ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-slate-500">{users.length} registered users</p>
            <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              <Plus className="w-4 h-4" /> Add User
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">{u.role}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        {u.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleDeactivateUser(u.id)} className="text-red-500 text-xs hover:underline">Deactivate</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="font-semibold text-slate-800 mb-4">Security Settings</h3>
          <p className="text-slate-500 text-sm">Security settings and permission management will be available through the Admin API.</p>
        </div>
      )}

      {/* Credentials Tab */}
      {activeTab === 'credentials' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800">Employee Credentials</h3>
          </div>
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Initial Password</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.filter(e => e.credentials).map((emp: any) => (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{emp.name}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{emp.credentials?.username || emp.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-600">{showPasswords[emp.id] ? emp.credentials?.initialPass : '••••••••'}</span>
                      <button onClick={() => setShowPasswords(p => ({ ...p, [emp.id]: !p[emp.id] }))} className="text-slate-400 hover:text-slate-600">
                        {showPasswords[emp.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Company Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2"><Building2 className="w-5 h-5" /> Company Profile</h3>
            {!editSettings ? (
              <button onClick={() => { setEditSettings(true); setSettingsForm(companySettings); }} className="text-indigo-600 text-sm font-medium hover:underline">
                <Edit2 className="w-4 h-4 inline" /> Edit
              </button>
            ) : (
              <button onClick={handleSaveSettings} disabled={updateSettings.isPending} className="flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                <Save className="w-4 h-4" /> {updateSettings.isPending ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>

          {editSettings ? (
            <div className="space-y-3">
              <input value={settingsForm.name} onChange={e => setSettingsForm({ ...settingsForm, name: e.target.value })} placeholder="Company Name" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
              <textarea value={settingsForm.address} onChange={e => setSettingsForm({ ...settingsForm, address: e.target.value })} placeholder="Address" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm h-20" />
              <div className="grid grid-cols-2 gap-3">
                <input value={settingsForm.phone} onChange={e => setSettingsForm({ ...settingsForm, phone: e.target.value })} placeholder="Phone" className="border border-slate-200 p-2.5 rounded-lg text-sm" />
                <input value={settingsForm.email} onChange={e => setSettingsForm({ ...settingsForm, email: e.target.value })} placeholder="Email" className="border border-slate-200 p-2.5 rounded-lg text-sm" />
              </div>
              <input value={settingsForm.gstNumber} onChange={e => setSettingsForm({ ...settingsForm, gstNumber: e.target.value })} placeholder="GST Number" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
            </div>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3"><span className="font-medium text-slate-700 w-32">Name:</span><span className="text-slate-600">{companySettings.name || '—'}</span></div>
              <div className="flex items-start gap-3"><span className="font-medium text-slate-700 w-32">Address:</span><span className="text-slate-600">{companySettings.address || '—'}</span></div>
              <div className="flex items-center gap-3"><span className="font-medium text-slate-700 w-32">Phone:</span><span className="text-slate-600">{companySettings.phone || '—'}</span></div>
              <div className="flex items-center gap-3"><span className="font-medium text-slate-700 w-32">Email:</span><span className="text-slate-600">{companySettings.email || '—'}</span></div>
              <div className="flex items-center gap-3"><span className="font-medium text-slate-700 w-32">GST Number:</span><span className="text-slate-600">{companySettings.gstNumber || '—'}</span></div>
            </div>
          )}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Add User</h3>
              <button onClick={() => setShowAddUser(false)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <input value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} placeholder="Full Name" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
              <input value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} placeholder="Email" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full border border-slate-200 p-2.5 rounded-lg text-sm">
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Viewer">Viewer</option>
              </select>
              <input type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} placeholder="Initial Password" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
            </div>
            <button onClick={handleAddUser} disabled={createUser.isPending} className="w-full mt-4 bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
              {createUser.isPending ? 'Adding...' : 'Add User'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
