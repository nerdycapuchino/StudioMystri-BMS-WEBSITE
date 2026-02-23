
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmployees, useCreateEmployee, useUpdateEmployee } from '../hooks/useHR';
import { Users, Plus, X, Edit2, Shield, UserCheck, Clock, Briefcase, FileText, ChevronDown, ChevronUp, Search, Mail, Phone, Calendar } from 'lucide-react';
import { Employee, UserRole } from '../types';
import toast from 'react-hot-toast';

export const HR: React.FC = () => {
   const { user: currentUser } = useAuth();
   const { data: empData, isLoading, isError, error } = useEmployees();
   const createEmployee = useCreateEmployee();
   const updateEmployeeMut = useUpdateEmployee();

   const employees: Employee[] = Array.isArray(empData?.data || empData) ? (empData?.data || empData) as Employee[] : [];

   const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

   const [activeTab, setActiveTab] = useState<'staff' | 'roles' | 'policies'>('staff');
   const [showAddStaff, setShowAddStaff] = useState(false);
   const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
   const [searchQuery, setSearchQuery] = useState('');
   const [selectedDept, setSelectedDept] = useState('All');
   const [expandedId, setExpandedId] = useState<string | null>(null);

   const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', roleId: '', department: '', salary: 0, bankDetails: '' });
   const resetStaffForm = () => setNewStaff({ name: '', email: '', phone: '', roleId: '', department: '', salary: 0, bankDetails: '' });

   // Derived
   const userRoles: UserRole[] = []; // Roles will come from backend in future
   const departments = Array.from(new Set(employees.map(e => e.department)));

   const filteredEmployees = employees.filter(e => {
      const matchesSearch = e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDept === 'All' || e.department === selectedDept;
      return matchesSearch && matchesDept;
   });

   const handleAddStaff = () => {
      if (newStaff.name && newStaff.email) {
         createEmployee.mutate({
            ...newStaff,
            id: Math.random().toString(36).substr(2, 9),
            joinDate: new Date().toLocaleDateString(),
            status: 'Active',
            attendance: 'Absent',
            credentials: { username: newStaff.email, initialPass: 'Welcome@123' }
         } as any, {
            onSuccess: () => {
               setShowAddStaff(false);
               resetStaffForm();
            }
         });
      }
   };

   const handleUpdateEmployee = (id: string, updates: Partial<Employee>) => {
      updateEmployeeMut.mutate({ id, ...updates } as any);
   };

   if (isLoading) {
      return (
         <div className="h-full flex flex-col p-6 space-y-6">
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse w-48" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
            <div className="flex-1 bg-slate-100 rounded-xl animate-pulse" />
         </div>
      );
   }

   if (isError) {
      return (
         <div className="h-full flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-500 font-bold mb-2">Failed to load HR data</p>
               <p className="text-slate-500 text-sm">{(error as any)?.message || 'Unknown error'}</p>
            </div>
         </div>
      );
   }

   return (
      <div className="h-full flex flex-col overflow-y-auto pr-2 relative">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Human Resources</h2>
            <button
               onClick={() => setShowAddStaff(true)}
               className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-slate-800 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-colors"
            >
               <Plus className="w-4 h-4" /> Add Employee
            </button>
         </div>

         {/* KPI Strip */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
               { label: 'Total Staff', value: employees.length, icon: Users, color: 'indigo' },
               { label: 'Present Today', value: employees.filter(e => e.attendance === 'Present').length, icon: UserCheck, color: 'green' },
               { label: 'Departments', value: departments.length, icon: Briefcase, color: 'blue' },
               { label: 'Active', value: employees.filter(e => e.status === 'Active').length, icon: Shield, color: 'emerald' },
            ].map((kpi, i) => (
               <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                  <div className={`p-2 rounded-lg bg-${kpi.color}-50 text-${kpi.color}-600 w-fit mb-2`}>
                     <kpi.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{kpi.value}</h3>
                  <p className="text-xs text-slate-500">{kpi.label}</p>
               </div>
            ))}
         </div>

         {/* Tabs */}
         <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-6 w-fit">
            {(['staff', 'roles', 'policies'] as const).map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
               >
                  {tab}
               </button>
            ))}
         </div>

         {/* Staff Tab */}
         {activeTab === 'staff' && (
            <>
               <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                     <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm"
                        placeholder="Search by name or email..."
                     />
                  </div>
                  <select
                     value={selectedDept}
                     onChange={e => setSelectedDept(e.target.value)}
                     className="bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-slate-600"
                  >
                     <option value="All">All Departments</option>
                     {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
               </div>

               <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
                  <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 text-slate-500 font-medium">
                        <tr>
                           <th className="px-4 py-3">Employee</th>
                           <th className="px-4 py-3">Department</th>
                           <th className="px-4 py-3">Status</th>
                           <th className="px-4 py-3">Attendance</th>
                           <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                        {filteredEmployees.map(emp => (
                           <React.Fragment key={emp.id}>
                              <tr className="hover:bg-slate-50 cursor-pointer" onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}>
                                 <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                       <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                          {emp.name.charAt(0)}
                                       </div>
                                       <div>
                                          <p className="font-medium text-slate-800">{emp.name}</p>
                                          <p className="text-xs text-slate-400">{emp.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                                 <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                       {emp.status}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${emp.attendance === 'Present' ? 'bg-green-50 text-green-600' : emp.attendance === 'Late' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                       {emp.attendance}
                                    </span>
                                 </td>
                                 <td className="px-4 py-3 text-right">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingEmployee(emp); }} className="text-indigo-600 hover:underline font-medium text-xs">
                                       <Edit2 className="w-3.5 h-3.5 inline" /> Edit
                                    </button>
                                 </td>
                              </tr>
                              {expandedId === emp.id && (
                                 <tr className="bg-slate-50">
                                    <td colSpan={5} className="px-4 py-4">
                                       <div className="grid grid-cols-3 gap-4 text-xs text-slate-600">
                                          <div className="flex items-center gap-2"><Phone className="w-3 h-3" /> {emp.phone || 'N/A'}</div>
                                          <div className="flex items-center gap-2"><Calendar className="w-3 h-3" /> Joined: {emp.joinDate}</div>
                                          <div className="flex items-center gap-2"><Briefcase className="w-3 h-3" /> Salary: {formatCurrency(emp.salary || 0)}</div>
                                       </div>
                                    </td>
                                 </tr>
                              )}
                           </React.Fragment>
                        ))}
                     </tbody>
                  </table>
               </div>
            </>
         )}

         {/* Roles Tab */}
         {activeTab === 'roles' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <p className="text-slate-500 text-sm">Role management will be available via the Admin panel API.</p>
            </div>
         )}

         {/* Policies Tab */}
         {activeTab === 'policies' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
               <p className="text-slate-500 text-sm">Policies management will be available via the API.</p>
            </div>
         )}

         {/* Add Employee Modal */}
         {showAddStaff && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg">Add New Employee</h3>
                     <button onClick={() => { setShowAddStaff(false); resetStaffForm(); }}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="space-y-3">
                     <input value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="Full Name" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <input value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} placeholder="Email" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <input value={newStaff.phone} onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} placeholder="Phone" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <input value={newStaff.department} onChange={e => setNewStaff({ ...newStaff, department: e.target.value })} placeholder="Department" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <input type="number" value={newStaff.salary || ''} onChange={e => setNewStaff({ ...newStaff, salary: Number(e.target.value) })} placeholder="Salary" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                  </div>
                  <button
                     onClick={handleAddStaff}
                     disabled={createEmployee.isPending}
                     className="w-full mt-4 bg-indigo-600 text-slate-800 py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                  >
                     {createEmployee.isPending ? 'Adding...' : 'Add Employee'}
                  </button>
               </div>
            </div>
         )}

         {/* Edit Employee Modal */}
         {editingEmployee && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg">Edit: {editingEmployee.name}</h3>
                     <button onClick={() => setEditingEmployee(null)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="space-y-3">
                     <div>
                        <label className="text-xs text-slate-500 block mb-1">Status</label>
                        <select
                           value={editingEmployee.status}
                           onChange={e => setEditingEmployee({ ...editingEmployee, status: e.target.value as any })}
                           className="w-full border border-slate-200 p-2.5 rounded-lg text-sm"
                        >
                           <option value="Active">Active</option>
                           <option value="Inactive">Inactive</option>
                        </select>
                     </div>
                     <div>
                        <label className="text-xs text-slate-500 block mb-1">Attendance</label>
                        <select
                           value={editingEmployee.attendance}
                           onChange={e => setEditingEmployee({ ...editingEmployee, attendance: e.target.value as any })}
                           className="w-full border border-slate-200 p-2.5 rounded-lg text-sm"
                        >
                           <option value="Present">Present</option>
                           <option value="Absent">Absent</option>
                           <option value="Late">Late</option>
                           <option value="Leave">Leave</option>
                        </select>
                     </div>
                  </div>
                  <button
                     onClick={() => {
                        handleUpdateEmployee(editingEmployee.id, { status: editingEmployee.status, attendance: editingEmployee.attendance });
                        setEditingEmployee(null);
                     }}
                     disabled={updateEmployeeMut.isPending}
                     className="w-full mt-4 bg-indigo-600 text-slate-800 py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                  >
                     {updateEmployeeMut.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};
