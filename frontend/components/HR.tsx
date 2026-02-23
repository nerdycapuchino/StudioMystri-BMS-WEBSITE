import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useEmployees, useCreateEmployee, useUpdateEmployee } from '../hooks/useHR';
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
            <div className="h-10 bg-surface-elevated rounded-xl animate-pulse w-48 border border-border-solid" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-surface-elevated rounded-xl animate-pulse border border-border-solid" />)}
            </div>
            <div className="flex-1 bg-surface-elevated rounded-xl animate-pulse border border-border-solid" />
         </div>
      );
   }

   if (isError) {
      return (
         <div className="h-full flex items-center justify-center">
            <div className="text-center">
               <p className="text-error font-bold mb-2">Failed to load HR data</p>
               <p className="text-text-muted text-sm">{(error as any)?.message || 'Unknown error'}</p>
            </div>
         </div>
      );
   }

   return (
      <div className="h-full flex flex-col overflow-y-auto pr-2 relative animation-fade-in">
         <div className="flex justify-between items-center mb-6">
            <div>
               <h1 className="font-playfair text-3xl text-text-primary tracking-wide mb-1">Human Resources</h1>
               <p className="text-text-muted text-sm font-sans flex items-center gap-2">Staff & Directory Management</p>
            </div>
            <button
               onClick={() => setShowAddStaff(true)}
               className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-surface-darker rounded-lg text-sm font-bold shadow-glow transition-colors"
            >
               <span className="material-symbols-outlined text-[18px]">add</span> Add Employee
            </button>
         </div>

         {/* KPI Strip */}
         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
               { label: 'Total Staff', value: employees.length, icon: 'group', colorClass: 'text-primary bg-primary/10' },
               { label: 'Present Today', value: employees.filter(e => e.attendance === 'Present').length, icon: 'how_to_reg', colorClass: 'text-success bg-success/10' },
               { label: 'Departments', value: departments.length, icon: 'work', colorClass: 'text-info bg-info/10' },
               { label: 'Active', value: employees.filter(e => e.status === 'Active').length, icon: 'verified_user', colorClass: 'text-bronze-DEFAULT bg-bronze-DEFAULT/10' },
            ].map((kpi, i) => (
               <div key={i} className="bg-surface-elevated p-6 rounded-2xl border border-border-solid relative overflow-hidden group hover:border-border-hover transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                     <span className={`material-symbols-outlined text-6xl ${kpi.colorClass.split(' ')[0]}`}>{kpi.icon}</span>
                  </div>
                  <div className={`p-2 rounded-lg w-fit mb-4 ${kpi.colorClass}`}>
                     <span className="material-symbols-outlined text-[20px]">{kpi.icon}</span>
                  </div>
                  <h3 className="text-3xl font-display font-medium text-text-primary">{kpi.value}</h3>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">{kpi.label}</p>
               </div>
            ))}
         </div>

         {/* Tabs */}
         <div className="flex gap-1 bg-surface-dark p-1 rounded-lg border border-border-solid mb-6 w-fit">
            {(['staff', 'roles', 'policies'] as const).map(tab => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-md text-sm font-bold capitalize transition-all ${activeTab === tab ? 'bg-surface-elevated shadow text-text-primary border border-border-solid' : 'text-text-muted hover:text-text-primary'}`}
               >
                  {tab}
               </button>
            ))}
         </div>

         {/* Staff Tab */}
         {activeTab === 'staff' && (
            <>
               <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1 relative">
                     <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-text-muted">search</span>
                     <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-surface-dark border border-border-solid rounded-lg text-sm text-text-primary focus:outline-none focus:border-primary transition-colors placeholder-text-muted"
                        placeholder="Search by name or email..."
                     />
                  </div>
                  <select
                     value={selectedDept}
                     onChange={e => setSelectedDept(e.target.value)}
                     className="bg-surface-dark border border-border-solid rounded-lg px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary appearance-none custom-select"
                  >
                     <option value="All">All Departments</option>
                     {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
               </div>

               <div className="bg-surface-elevated rounded-xl border border-border-solid overflow-hidden flex-1 shadow-sm">
                  <table className="w-full text-sm text-left align-middle border-collapse">
                     <thead className="bg-surface-dark text-text-muted text-xs font-bold uppercase tracking-wider border-b border-border-solid">
                        <tr>
                           <th className="px-6 py-4">Employee</th>
                           <th className="px-6 py-4">Department</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4">Attendance</th>
                           <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-border-solid">
                        {filteredEmployees.map(emp => (
                           <React.Fragment key={emp.id}>
                              <tr className="hover:bg-surface-hover cursor-pointer transition-colors group" onClick={() => setExpandedId(expandedId === emp.id ? null : emp.id)}>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                       <div className="w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/30 flex items-center justify-center font-bold text-sm shadow-inner group-hover:bg-primary group-hover:text-surface-darker transition-colors">
                                          {emp.name.charAt(0)}
                                       </div>
                                       <div>
                                          <p className="font-bold text-text-primary">{emp.name}</p>
                                          <p className="text-xs text-text-muted mt-0.5">{emp.email}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className="text-text-secondary px-3 py-1 bg-surface-dark border border-border-solid rounded text-xs font-medium">{emp.department}</span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className={`px-2 py-1 border rounded text-[10px] uppercase font-bold tracking-wider ${emp.status === 'Active' ? 'bg-success/10 text-success border-success/30' : 'bg-error/10 text-error border-error/30'}`}>
                                       {emp.status}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className={`px-2 py-1 border rounded text-[10px] uppercase font-bold tracking-wider ${emp.attendance === 'Present' ? 'bg-success/10 text-success border-success/30' : emp.attendance === 'Late' ? 'bg-warning/10 text-warning border-warning/30' : 'bg-surface-dark text-text-muted border-border-solid'}`}>
                                       {emp.attendance}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingEmployee(emp); }} className="text-text-muted hover:text-primary transition-colors inline-flex items-center justify-center p-2 rounded-lg hover:bg-primary/10">
                                       <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                 </td>
                              </tr>
                              {expandedId === emp.id && (
                                 <tr className="bg-surface-dark border-b border-border-solid">
                                    <td colSpan={5} className="px-6 py-4">
                                       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-border-glass rounded-xl bg-surface-elevated/50">
                                          <div className="flex items-center gap-3 text-sm text-text-secondary">
                                             <div className="p-2 rounded bg-surface-dark text-text-muted border border-border-solid"><span className="material-symbols-outlined text-[18px]">call</span></div>
                                             <div>
                                                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Phone</p>
                                                <p className="font-mono mt-0.5">{emp.phone || 'N/A'}</p>
                                             </div>
                                          </div>
                                          <div className="flex items-center gap-3 text-sm text-text-secondary">
                                             <div className="p-2 rounded bg-surface-dark text-text-muted border border-border-solid"><span className="material-symbols-outlined text-[18px]">event</span></div>
                                             <div>
                                                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Join Date</p>
                                                <p className="mt-0.5">{emp.joinDate}</p>
                                             </div>
                                          </div>
                                          <div className="flex items-center gap-3 text-sm text-text-secondary">
                                             <div className="p-2 rounded bg-surface-dark text-text-muted border border-border-solid"><span className="material-symbols-outlined text-[18px]">payments</span></div>
                                             <div>
                                                <p className="text-[10px] text-text-muted uppercase font-bold tracking-wider">Salary</p>
                                                <p className="mt-0.5 font-bold text-text-primary">{formatCurrency(emp.salary || 0)}</p>
                                             </div>
                                          </div>
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
            <div className="bg-surface-elevated rounded-xl border border-border-solid p-8 text-center">
               <span className="material-symbols-outlined text-4xl text-text-muted mb-4">admin_panel_settings</span>
               <p className="text-text-primary font-bold">Role Management</p>
               <p className="text-text-muted text-sm mt-2">Role management will be available via the Admin panel API.</p>
            </div>
         )}

         {/* Policies Tab */}
         {activeTab === 'policies' && (
            <div className="bg-surface-elevated rounded-xl border border-border-solid p-8 text-center">
               <span className="material-symbols-outlined text-4xl text-text-muted mb-4">policy</span>
               <p className="text-text-primary font-bold">Company Policies</p>
               <p className="text-text-muted text-sm mt-2">Policies management will be available via the API.</p>
            </div>
         )}

         {/* Add Employee Modal */}
         {showAddStaff && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animation-fade-in">
               <div className="bg-surface-elevated border border-border-solid rounded-2xl shadow-xl shadow-black w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-xl text-text-primary">Add New Employee</h3>
                     <button onClick={() => { setShowAddStaff(false); resetStaffForm(); }} className="text-text-muted hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Full Name</label>
                        <input value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} placeholder="John Doe" className="w-full bg-surface-dark border border-border-solid p-3 rounded-lg text-sm text-text-primary focus:border-primary focus:outline-none transition-colors" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Email Address</label>
                        <input type="email" value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} placeholder="john@example.com" className="w-full bg-surface-dark border border-border-solid p-3 rounded-lg text-sm text-text-primary focus:border-primary focus:outline-none transition-colors" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Phone</label>
                           <input value={newStaff.phone} onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} placeholder="+91" className="w-full bg-surface-dark border border-border-solid p-3 rounded-lg text-sm text-text-primary focus:border-primary focus:outline-none transition-colors" />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Department</label>
                           <input value={newStaff.department} onChange={e => setNewStaff({ ...newStaff, department: e.target.value })} placeholder="e.g. Sales" className="w-full bg-surface-dark border border-border-solid p-3 rounded-lg text-sm text-text-primary focus:border-primary focus:outline-none transition-colors" />
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Base Salary (INR)</label>
                        <input type="number" value={newStaff.salary || ''} onChange={e => setNewStaff({ ...newStaff, salary: Number(e.target.value) })} placeholder="0.00" className="w-full bg-surface-dark border border-border-solid p-3 rounded-lg text-sm text-text-primary focus:border-primary focus:outline-none transition-colors" />
                     </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                     <button onClick={() => { setShowAddStaff(false); resetStaffForm(); }} className="flex-1 bg-surface-hover text-text-primary py-3 rounded-lg font-bold hover:bg-surface-dark transition-colors border border-border-solid">Cancel</button>
                     <button
                        onClick={handleAddStaff}
                        disabled={createEmployee.isPending}
                        className="flex-1 bg-primary text-surface-darker py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-glow flex items-center justify-center gap-2"
                     >
                        {createEmployee.isPending ? <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> : <span className="material-symbols-outlined text-[18px]">person_add</span>}
                        {createEmployee.isPending ? 'Adding...' : 'Add Employee'}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Edit Employee Modal */}
         {editingEmployee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animation-fade-in">
               <div className="bg-surface-elevated border border-border-solid rounded-2xl shadow-xl shadow-black w-full max-w-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="font-bold text-lg text-text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-text-muted">manage_accounts</span>
                        Modify: {editingEmployee.name}
                     </h3>
                     <button onClick={() => setEditingEmployee(null)} className="text-text-muted hover:text-white transition-colors"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Status</label>
                        <div className="relative">
                           <select
                              value={editingEmployee.status}
                              onChange={e => setEditingEmployee({ ...editingEmployee, status: e.target.value as any })}
                              className="w-full bg-surface-dark border border-border-solid p-3 rounded-lg text-sm text-text-primary focus:border-primary focus:outline-none transition-colors appearance-none"
                           >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                           </select>
                           <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
                        </div>
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Attendance</label>
                        <div className="relative">
                           <select
                              value={editingEmployee.attendance}
                              onChange={e => setEditingEmployee({ ...editingEmployee, attendance: e.target.value as any })}
                              className="w-full bg-surface-dark border border-border-solid p-3 rounded-lg text-sm text-text-primary focus:border-primary focus:outline-none transition-colors appearance-none"
                           >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="Late">Late</option>
                              <option value="Leave">Leave</option>
                           </select>
                           <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">expand_more</span>
                        </div>
                     </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                     <button onClick={() => setEditingEmployee(null)} className="flex-1 bg-surface-hover text-text-primary py-3 rounded-lg font-bold hover:bg-surface-dark transition-colors border border-border-solid">Cancel</button>
                     <button
                        onClick={() => {
                           handleUpdateEmployee(editingEmployee.id, { status: editingEmployee.status, attendance: editingEmployee.attendance });
                           setEditingEmployee(null);
                        }}
                        disabled={updateEmployeeMut.isPending}
                        className="flex-1 bg-primary text-surface-darker py-3 rounded-lg font-bold hover:bg-primary-hover transition-colors shadow-glow"
                     >
                        {updateEmployeeMut.isPending ? 'Saving...' : 'Save Changes'}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
