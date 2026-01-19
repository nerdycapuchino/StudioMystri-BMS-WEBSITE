import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Shield, UserPlus, Edit, Trash2, X, Check, Link, Lock, Eye, EyeOff } from 'lucide-react';
import { User, AccessLevel } from '../types';

export const Admin: React.FC = () => {
  const { users, addUser, updateUserStatus, deleteUser, employees, permissions, updatePermission } = useGlobal();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ name: '', email: '', role: 'Sales', status: 'Active' });
  const [activeTab, setActiveTab] = useState<'users' | 'security'>('users');

  const handleCreate = () => {
    if (newUser.name && newUser.email) {
      addUser({
        id: Math.random().toString(36).substr(2, 9),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role as any,
        status: newUser.status as any
      });
      setShowAddModal(false);
      setNewUser({ name: '', email: '', role: 'Sales', status: 'Active' });
    }
  };

  const roles = ['Super Admin', 'Architect', 'Sales', 'Logistics', 'HR', 'Finance'];
  const secureFields = [
    { key: 'salary', label: 'Employee Salary' },
    { key: 'costPrice', label: 'Inventory Unit Cost' },
  ];

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-bold text-slate-800">Admin & RBAC</h2>
           <p className="text-slate-500 text-sm">Manage users, roles, and granular permissions.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
           <button onClick={() => setActiveTab('users')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'users' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Users</button>
           <button onClick={() => setActiveTab('security')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'security' ? 'bg-white shadow text-indigo-600' : 'text-slate-500'}`}>Field Security</button>
        </div>
      </div>

      {activeTab === 'users' ? (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Add User
            </button>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">HR Link</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(user => {
                   const linkedEmp = employees.find(e => e.id === user.linkedEmployeeId || e.email === user.email);
                   return (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">{user.name}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-1">
                          <Shield className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-600">{user.role}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{user.email}</td>
                    <td className="px-6 py-4">
                       {linkedEmp ? (
                          <span className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded border border-indigo-100 w-fit">
                             <Link className="w-3 h-3" /> Linked
                          </span>
                       ) : (
                          <span className="text-xs text-slate-400 italic">No HR Record</span>
                       )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => updateUserStatus(user.id, user.status === 'Active' ? 'Inactive' : 'Active')}
                        className={`px-2 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                        user.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                      }`}>
                        {user.status}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      <button onClick={() => deleteUser(user.id)} className="p-1 text-slate-400 hover:text-red-600" title="Delete User">
                         <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
           <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-indigo-600" /> Field-Level Security Matrix</h3>
           <p className="text-sm text-slate-500 mb-6">Define visibility and edit access for sensitive data fields per user role.</p>
           
           <div className="overflow-x-auto">
              <table className="w-full text-sm">
                 <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                       <th className="px-4 py-3 text-left font-medium text-slate-600">Sensitive Field</th>
                       {roles.map(role => (
                          <th key={role} className="px-4 py-3 text-center font-medium text-slate-600">{role}</th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100">
                    {secureFields.map(field => (
                       <tr key={field.key} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-medium text-slate-800">{field.label}</td>
                          {roles.map(role => {
                             const currentPerm = permissions.find(p => p.role === role && p.field === field.key)?.access || 'read-write';
                             return (
                                <td key={`${role}-${field.key}`} className="px-4 py-3 text-center">
                                   <div className="flex justify-center">
                                      <select 
                                        className={`text-xs border rounded px-2 py-1 outline-none cursor-pointer font-medium ${
                                           currentPerm === 'read-write' ? 'bg-green-50 text-green-700 border-green-200' :
                                           currentPerm === 'read-only' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                           'bg-slate-100 text-slate-500 border-slate-200'
                                        }`}
                                        value={currentPerm}
                                        onChange={(e) => updatePermission(role, field.key, e.target.value as AccessLevel)}
                                      >
                                         <option value="read-write">Write</option>
                                         <option value="read-only">Read</option>
                                         <option value="hidden">Hidden</option>
                                      </select>
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

      {/* Add User Modal */}
      {showAddModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="font-bold text-lg">Add New User</h3>
                 <button onClick={() => setShowAddModal(false)}><X className="w-5 h-5 text-slate-400"/></button>
              </div>
              <div className="space-y-3">
                 <input className="w-full border p-2 rounded" placeholder="Full Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                 <input className="w-full border p-2 rounded" placeholder="Email Address" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                 <select className="w-full border p-2 rounded" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as any})}>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Architect">Architect</option>
                    <option value="Sales">Sales</option>
                    <option value="Logistics">Logistics</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                 </select>
                 <button onClick={handleCreate} className="w-full bg-indigo-600 text-white py-2 rounded font-bold hover:bg-indigo-700">Create User</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};