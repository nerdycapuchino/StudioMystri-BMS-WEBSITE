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

   const [activeView, setActiveView] = useState<'directory' | 'attendance'>('directory');
   const [showAddStaff, setShowAddStaff] = useState(false);
   const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
   const [selectedDept, setSelectedDept] = useState('All');

   // Add staff form state
   const [newStaff, setNewStaff] = useState<Partial<Employee>>({ name: '', email: '', phone: '', department: '', status: 'Active', attendance: 'Present', roleId: '1' });

   const departments = Array.from(new Set(employees.map(e => e.department).filter(Boolean)));

   const filteredEmployees = employees.filter(e => {
      return selectedDept === 'All' || e.department === selectedDept;
   });

   const handleAddStaff = () => {
      if (!newStaff.name || !newStaff.email) {
         toast.error("Name and email are required");
         return;
      }

      createEmployee.mutate({
         ...newStaff,
         id: Math.random().toString(36).substr(2, 9),
         joinDate: new Date().toISOString(),
         salary: Number(newStaff.salary || 0),
         roleId: newStaff.roleId || '1',
         status: 'Active',
         attendance: 'Present',
      } as any, {
         onSuccess: () => {
            setShowAddStaff(false);
            setNewStaff({ name: '', email: '', phone: '', department: '', status: 'Active', attendance: 'Present', roleId: '1' });
         }
      });
   };

   const handleSaveEdit = () => {
      if (editingEmployee) {
         updateEmployeeMut.mutate({ id: editingEmployee.id, status: editingEmployee.status, attendance: editingEmployee.attendance, department: editingEmployee.department } as any, {
            onSuccess: () => {
               setEditingEmployee(null);
            }
         });
      }
   };

   const getStatusStyle = (status: string) => {
      switch (status) {
         case 'Active': return 'bg-green-100/90 dark:bg-green-900/90 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
         case 'Leave': return 'bg-amber-100/90 dark:bg-amber-900/90 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
         case 'Terminated':
         case 'Inactive': return 'bg-slate-200/90 dark:bg-slate-700/90 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600';
         default: return 'bg-blue-100/90 dark:bg-blue-900/90 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      }
   };

   const getAttendanceColor = (att: string) => {
      switch (att) {
         case 'Present': return 'bg-green-500';
         case 'Late': return 'bg-amber-500';
         case 'Absent': return 'bg-red-500';
         case 'Half-Day': return 'bg-orange-400';
         case 'Leave': return 'bg-blue-500';
         default: return 'bg-slate-300';
      }
   };

   return (
      <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display relative z-10 w-full overflow-hidden animation-fade-in">
         <div className="flex-none p-6 pb-4 overflow-y-auto custom-scrollbar">
            <div className="max-w-[1440px] mx-auto flex flex-col gap-8">
               {/* Header */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="flex flex-col gap-2 max-w-xl">
                     <h1 className="text-slate-900 dark:text-white text-3xl md:text-4xl font-light tracking-tight">People & Operations</h1>
                     <p className="text-slate-500 dark:text-slate-400 text-base font-light">Manage staff directory, track site attendance, and oversee resource allocation.</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                     {/* Segmented Control */}
                     <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg self-start sm:self-auto w-full sm:w-auto">
                        <button onClick={() => setActiveView('directory')} className={`flex-1 sm:flex-none px-6 py-1.5 rounded text-sm font-medium transition-all ${activeView === 'directory' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Directory</button>
                        <button onClick={() => setActiveView('attendance')} className={`flex-1 sm:flex-none px-6 py-1.5 rounded text-sm font-medium transition-all ${activeView === 'attendance' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'hover:bg-white/50 dark:hover:bg-slate-700/50 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>Attendance</button>
                     </div>
                     <button onClick={() => setShowAddStaff(true)} className="flex items-center justify-center gap-2 bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm shadow-primary/30 w-full sm:w-auto">
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Add Employee</span>
                     </button>
                  </div>
               </div>

               {/* Filters Section */}
               <div className="flex flex-wrap items-center gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium">
                     <span className="material-symbols-outlined text-[18px]">filter_list</span>
                     <span>Departments</span>
                  </div>
                  <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
                  <button onClick={() => setSelectedDept('All')} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDept === 'All' ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                     All
                  </button>
                  {departments.map((dept: any) => (
                     <button key={dept} onClick={() => setSelectedDept(dept)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${selectedDept === dept ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                        {dept}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {/* Scrollable Content Area */}
         <div className="flex-1 overflow-auto custom-scrollbar px-6 pb-8">
            <div className="max-w-[1440px] mx-auto">
               {isLoading ? (
                  <div className="text-center py-12 text-slate-500">Loading personnel records...</div>
               ) : isError ? (
                  <div className="text-center py-12 text-rose-500">Error loading data.</div>
               ) : activeView === 'directory' ? (
                  /* Directory Grid */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {filteredEmployees.map(emp => (
                        <div key={emp.id} className="group relative flex flex-col bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg dark:hover:shadow-slate-900/50 hover:border-primary/30 transition-all duration-300">
                           <div className="aspect-[4/5] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative">
                              {/* Avatar Placeholder */}
                              <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:scale-105 transition-transform duration-500">
                                 <span className="material-symbols-outlined text-9xl">person</span>
                              </div>
                              <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                                 <span className={`px-2.5 py-1 rounded text-xs font-semibold backdrop-blur-sm border ${getStatusStyle(emp.status)}`}>
                                    {emp.status}
                                 </span>
                              </div>
                           </div>
                           <div className="flex flex-col p-4 gap-1 relative z-10 bg-white dark:bg-slate-800">
                              <div className="flex justify-between items-start">
                                 <div>
                                    <h3 className="text-slate-900 dark:text-white text-lg font-semibold leading-tight group-hover:text-primary transition-colors">{emp.name}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{emp.department || 'Staff Member'}</p>
                                 </div>
                                 <button onClick={() => setEditingEmployee(emp)} className="text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                 </button>
                              </div>
                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                 <div className="flex items-center gap-1 text-slate-400 text-xs truncate mr-2">
                                    <span className="material-symbols-outlined text-[14px]">badge</span>
                                    <span className="truncate">{emp.email}</span>
                                 </div>
                                 <div className="flex gap-2 shrink-0">
                                    <a href={`mailto:${emp.email}`} className="size-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
                                       <span className="material-symbols-outlined text-[18px]">mail</span>
                                    </a>
                                    <a href={`tel:${emp.phone}`} className="size-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors">
                                       <span className="material-symbols-outlined text-[18px]">call</span>
                                    </a>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  /* Attendance View */
                  <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                     <div className="grid grid-cols-[200px_1fr] border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <div className="p-4 border-r border-slate-100 dark:border-slate-700">Employee</div>
                        <div className="p-4 relative flex items-center justify-between w-full opacity-60">
                           <span>Status Marker</span>
                           <span>Attendance Record</span>
                           <span>Status</span>
                        </div>
                     </div>
                     {filteredEmployees.map(emp => (
                        <div key={`att-${emp.id}`} className="grid grid-cols-[200px_1fr] border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                           <div className="p-3 border-r border-slate-100 dark:border-slate-700 flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 text-xs font-bold font-sans">
                                 {emp.name.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                 <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{emp.name}</p>
                                 <p className="text-xs text-slate-500 truncate">{emp.department}</p>
                              </div>
                           </div>
                           <div className="p-3 relative flex items-center">
                              <div className={`h-2 rounded-full w-[80%] ml-[5%] relative group-hover:h-3 transition-all cursor-pointer ${getAttendanceColor(emp.attendance)}`}>
                                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {emp.attendance}
                                 </div>
                              </div>
                              <div className="ml-auto pr-4 font-medium text-sm text-slate-700 dark:text-slate-300">
                                 {emp.attendance}
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>

         {/* Modals */}
         {showAddStaff && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
               <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-2xl font-display font-medium text-slate-900 dark:text-white">Add New Employee</h3>
                     <button onClick={() => setShowAddStaff(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                           <input value={newStaff.name} onChange={e => setNewStaff({ ...newStaff, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                           <input value={newStaff.department} onChange={e => setNewStaff({ ...newStaff, department: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                           <input value={newStaff.email} onChange={e => setNewStaff({ ...newStaff, email: e.target.value })} type="email" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                           <input value={newStaff.phone} onChange={e => setNewStaff({ ...newStaff, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" />
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                     <button onClick={() => setShowAddStaff(false)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                     <button onClick={handleAddStaff} className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex justify-center items-center">
                        {createEmployee.isPending ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : 'Save Employee'}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {editingEmployee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
               <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-display font-medium text-slate-900 dark:text-white">Edit: {editingEmployee.name}</h3>
                     <button onClick={() => setEditingEmployee(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><span className="material-symbols-outlined">close</span></button>
                  </div>
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
                        <input value={editingEmployee.department || ''} onChange={e => setEditingEmployee({ ...editingEmployee, department: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                        <select value={editingEmployee.status} onChange={e => setEditingEmployee({ ...editingEmployee, status: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20">
                           <option value="Active">Active</option>
                           <option value="Inactive">Inactive</option>
                           <option value="Leave">On Leave</option>
                           <option value="Terminated">Terminated</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Attendance Today</label>
                        <select value={editingEmployee.attendance} onChange={e => setEditingEmployee({ ...editingEmployee, attendance: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20">
                           <option value="Present">Present</option>
                           <option value="Absent">Absent</option>
                           <option value="Late">Late</option>
                           <option value="Half-Day">Half-Day</option>
                           <option value="Leave">On Leave</option>
                        </select>
                     </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                     <button onClick={() => setEditingEmployee(null)} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                     <button onClick={handleSaveEdit} className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex justify-center items-center">
                        {updateEmployeeMut.isPending ? <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> : 'Save Changes'}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
