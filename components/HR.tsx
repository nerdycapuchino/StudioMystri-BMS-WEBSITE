import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Users, UserCheck, Clock, Plus, X, Phone, Mail, Calendar, DollarSign, FileText, Home, AlertCircle, Award, Edit, Shield, FilePlus, Download, Printer, Save } from 'lucide-react';
import { Employee, Policy } from '../types';

export const HR: React.FC = () => {
  const { employees, addEmployee, updateEmployee, policies, addPolicy, formatCurrency, currency } = useGlobal();
  const [showModal, setShowModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [viewProfile, setViewProfile] = useState<Employee | null>(null);
  
  // Policies State
  const [editingPolicyId, setEditingPolicyId] = useState<string | null>(null);
  const [editPolicyContent, setEditPolicyContent] = useState('');
  
  const initialFormState: Partial<Employee> = { 
    name: '', role: 'Designer', status: 'Active', attendance: 'Absent', salary: 0, leavesRemaining: 0, leavePolicy: 24, 
    email: '', phone: '', dob: '', address: '', emergencyContact: '', qualifications: '', documents: [] 
  };
  const [formData, setFormData] = useState<Partial<Employee>>(initialFormState);
  const [createSystemUser, setCreateSystemUser] = useState(false);
  const [activeTab, setActiveTab] = useState<'Employees' | 'Policies'>('Employees');
  const [newPolicy, setNewPolicy] = useState<Partial<Policy>>({ title: '', category: 'Leave', content: '' });

  const handleSave = () => {
    if(!formData.name || !formData.role) return;

    if (isEditing && formData.id) {
      updateEmployee(formData.id, formData);
    } else {
      addEmployee({
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name!,
        role: formData.role!,
        email: formData.email || '',
        phone: formData.phone || '',
        salary: formData.salary || 0,
        joinDate: new Date().toISOString().split('T')[0],
        status: formData.status as any,
        attendance: formData.attendance as any,
        leavePolicy: formData.leavePolicy || 24,
        leavesRemaining: formData.leavePolicy || 24,
        dob: formData.dob || '',
        address: formData.address || '',
        emergencyContact: formData.emergencyContact || '',
        qualifications: formData.qualifications || '',
        documents: []
      }, createSystemUser, 'Sales'); 
    }
    setShowModal(false);
    setFormData(initialFormState);
    setCreateSystemUser(false);
    setIsEditing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && viewProfile) {
      const file = e.target.files[0];
      const newDoc = { name: file.name, url: '#', date: new Date().toLocaleDateString() };
      const updatedDocs = [...(viewProfile.documents || []), newDoc];
      updateEmployee(viewProfile.id, { documents: updatedDocs });
      setViewProfile({ ...viewProfile, documents: updatedDocs });
    }
  };

  const handleAddPolicy = () => {
    if(newPolicy.title && newPolicy.content) {
      addPolicy({
        id: Math.random().toString(36).substr(2, 9),
        title: newPolicy.title,
        category: newPolicy.category as any,
        content: newPolicy.content,
        lastUpdated: new Date().toLocaleDateString()
      });
      setNewPolicy({ title: '', category: 'Leave', content: '' });
    }
  };

  const openEdit = (emp: Employee) => {
    setFormData(emp);
    setIsEditing(true);
    setViewProfile(null);
    setShowModal(true);
  };

  const downloadPolicy = (policy: Policy) => {
     const element = document.createElement("a");
     const file = new Blob([`POLICY: ${policy.title}\nCATEGORY: ${policy.category}\nUPDATED: ${policy.lastUpdated}\n\n${policy.content}`], {type: 'text/plain'});
     element.href = URL.createObjectURL(file);
     element.download = `${policy.title.replace(/\s+/g, '_')}.txt`;
     document.body.appendChild(element); // Required for this to work in FireFox
     element.click();
     document.body.removeChild(element);
  };

  // Indian Salary Structure Logic
  const calculateSalaryBreakup = (annualSalary: number) => {
    const monthlyGross = annualSalary / 12;
    
    // Earnings
    const basic = monthlyGross * 0.5; // 50% of Gross
    const hra = basic * 0.5; // 50% of Basic
    const special = monthlyGross - basic - hra;
    
    // Deductions
    const pf = Math.min(basic * 0.12, 1800); // Capped PF logic often used, simplified here
    const pt = 200; // Standard PT
    const tds = monthlyGross > 50000 ? monthlyGross * 0.1 : 0; // Simplified TDS

    const totalDeductions = pf + pt + tds;
    const netPay = monthlyGross - totalDeductions;

    return { monthlyGross, basic, hra, special, pf, pt, tds, totalDeductions, netPay };
  };

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">HR & Team</h2>
            <div className="flex gap-4 text-sm text-slate-500 mt-1">
               <button onClick={() => setActiveTab('Employees')} className={`hover:text-indigo-600 ${activeTab === 'Employees' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : ''}`}>Employees</button>
               <button onClick={() => setActiveTab('Policies')} className={`hover:text-indigo-600 ${activeTab === 'Policies' ? 'text-indigo-600 font-bold border-b-2 border-indigo-600' : ''}`}>Policies & Compliance</button>
            </div>
         </div>
         {activeTab === 'Employees' && (
            <button onClick={() => { setIsEditing(false); setFormData(initialFormState); setShowModal(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
               <Plus className="w-4 h-4" /> Add Employee
            </button>
         )}
      </div>

      {activeTab === 'Employees' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-full"><Users className="w-6 h-6" /></div>
                <div><p className="text-sm text-slate-500">Total Staff</p><p className="text-2xl font-bold">{employees.length}</p></div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-green-50 text-green-600 rounded-full"><UserCheck className="w-6 h-6" /></div>
                <div><p className="text-sm text-slate-500">Present Today</p><p className="text-2xl font-bold">{employees.filter(e => e.attendance === 'Present').length}</p></div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-orange-50 text-orange-600 rounded-full"><Clock className="w-6 h-6" /></div>
                <div><p className="text-sm text-slate-500">On Leave</p><p className="text-2xl font-bold">{employees.filter(e => e.status === 'Leave').length}</p></div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
             <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-medium">
                   <tr>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Contacts</th>
                      <th className="px-6 py-4">CTC (Annual)</th>
                      <th className="px-6 py-4">Leaves</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody>
                   {employees.map(emp => (
                      <tr key={emp.id} className="border-t border-slate-100 hover:bg-slate-50">
                         <td className="px-6 py-4">
                            <p className="font-bold text-slate-800">{emp.name}</p>
                            <p className="text-xs text-slate-500">Joined: {emp.joinDate}</p>
                         </td>
                         <td className="px-6 py-4">{emp.role}</td>
                         <td className="px-6 py-4">
                            <p className="text-xs">{emp.email}</p>
                            <p className="text-xs text-slate-500">{emp.phone}</p>
                         </td>
                         <td className="px-6 py-4 font-mono font-medium">{formatCurrency(emp.salary)}</td>
                         <td className="px-6 py-4 text-center font-bold text-slate-600">{emp.leavesRemaining} / {emp.leavePolicy}</td>
                         <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs ${emp.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{emp.status}</span></td>
                         <td className="px-6 py-4 text-right flex justify-end gap-2">
                            <button onClick={() => setShowPayslipModal(emp)} className="p-1.5 text-slate-500 hover:text-green-600 bg-slate-50 rounded" title="Generate Payslip"><DollarSign className="w-4 h-4"/></button>
                            <button onClick={() => setViewProfile(emp)} className="p-1.5 text-slate-500 hover:text-indigo-600 bg-slate-50 rounded" title="View Profile"><FileText className="w-4 h-4"/></button>
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </>
      ) : (
        <div className="flex gap-6 h-full">
           <div className="w-1/3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Add Policy</h3>
              <div className="space-y-4">
                 <input className="w-full border p-2 rounded" placeholder="Policy Title" value={newPolicy.title} onChange={e => setNewPolicy({...newPolicy, title: e.target.value})} />
                 <select className="w-full border p-2 rounded" value={newPolicy.category} onChange={e => setNewPolicy({...newPolicy, category: e.target.value as any})}>
                    <option value="Leave">Leave Policy</option>
                    <option value="Conduct">Code of Conduct</option>
                    <option value="Safety">Safety & Security</option>
                    <option value="IT">IT & Data</option>
                 </select>
                 <textarea className="w-full border p-2 rounded" rows={5} placeholder="Policy Details..." value={newPolicy.content} onChange={e => setNewPolicy({...newPolicy, content: e.target.value})} />
                 <button onClick={handleAddPolicy} className="w-full bg-indigo-600 text-white py-2 rounded font-bold">Save Policy</button>
              </div>
           </div>
           <div className="flex-1 space-y-4 overflow-y-auto">
              {policies.map(pol => (
                 <div key={pol.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-bold text-lg text-slate-800">{pol.title}</h4>
                       <div className="flex items-center gap-2">
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded">{pol.category}</span>
                          <button onClick={() => downloadPolicy(pol)} className="text-slate-400 hover:text-indigo-600 p-1 bg-slate-50 rounded" title="Download"><Download className="w-4 h-4"/></button>
                          <button onClick={() => { setEditingPolicyId(pol.id); setEditPolicyContent(pol.content); }} className="text-slate-400 hover:text-indigo-600 p-1 bg-slate-50 rounded" title="Edit"><Edit className="w-4 h-4"/></button>
                       </div>
                    </div>
                    {editingPolicyId === pol.id ? (
                       <div className="mt-4 border-t pt-4">
                          <textarea className="w-full border p-4 rounded-lg mb-3 text-sm min-h-[150px] shadow-inner bg-slate-50 font-mono leading-relaxed" value={editPolicyContent} onChange={e => setEditPolicyContent(e.target.value)} />
                          <div className="flex justify-end gap-3">
                             <button onClick={() => setEditingPolicyId(null)} className="px-4 py-2 bg-slate-100 rounded text-sm font-medium">Cancel</button>
                             <button onClick={() => { /* Mock update logic */ setEditingPolicyId(null); }} className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium">Save Changes</button>
                          </div>
                       </div>
                    ) : (
                       <p className="text-slate-600 text-sm mb-2 whitespace-pre-wrap leading-relaxed">{pol.content}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">Last Updated: {pol.lastUpdated}</p>
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
              <h3 className="font-bold text-lg mb-4">{isEditing ? 'Edit Employee' : 'Add New Employee'}</h3>
              <div className="grid grid-cols-2 gap-4">
                 <input className="border p-2 rounded" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                 <select className="border p-2 rounded" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                    <option value="Principal Architect">Principal Architect</option>
                    <option value="Senior Designer">Senior Designer</option>
                    <option value="Junior Architect">Junior Architect</option>
                    <option value="Sales Manager">Sales Manager</option>
                    <option value="Site Supervisor">Site Supervisor</option>
                    <option value="Accountant">Accountant</option>
                 </select>
                 
                 <input className="border p-2 rounded" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                 <input className="border p-2 rounded" placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                 
                 <input className="border p-2 rounded" type="date" placeholder="DOB" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                 <input className="border p-2 rounded" placeholder="Qualifications" value={formData.qualifications} onChange={e => setFormData({...formData, qualifications: e.target.value})} />

                 <div>
                    <label className="text-xs text-slate-500">Annual Salary (Base INR)</label>
                    <input className="w-full border p-2 rounded" type="number" placeholder="0" value={formData.salary || ''} onChange={e => setFormData({...formData, salary: parseFloat(e.target.value)})} />
                 </div>
                 <div>
                    <label className="text-xs text-slate-500">Leave Policy (Days/Year)</label>
                    <input className="w-full border p-2 rounded" type="number" value={formData.leavePolicy || ''} onChange={e => setFormData({...formData, leavePolicy: parseInt(e.target.value)})} />
                 </div>

                 <textarea className="col-span-2 border p-2 rounded" placeholder="Address" rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                 <input className="col-span-2 border p-2 rounded" placeholder="Emergency Contact (Name: Number)" value={formData.emergencyContact} onChange={e => setFormData({...formData, emergencyContact: e.target.value})} />
                 
                 {!isEditing && (
                    <div className="col-span-2 flex items-center gap-2 bg-slate-50 p-2 rounded border">
                       <input type="checkbox" id="createSysUser" checked={createSystemUser} onChange={e => setCreateSystemUser(e.target.checked)} />
                       <label htmlFor="createSysUser" className="text-sm text-slate-700 cursor-pointer">Create System User Login (Admin/RBAC) automatically</label>
                    </div>
                 )}
              </div>
              
              <div className="flex gap-2 mt-6">
                 <button onClick={() => setShowModal(false)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                 <button onClick={handleSave} className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold">{isEditing ? 'Update' : 'Onboard'}</button>
              </div>
           </div>
        </div>
      )}

      {/* Indian Context Payslip Modal */}
      {showPayslipModal && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white w-[600px] p-8 rounded-xl shadow-2xl relative">
               <button onClick={() => setShowPayslipModal(null)} className="absolute top-4 right-4"><X className="w-5 h-5 text-slate-400"/></button>
               
               <div className="text-center mb-6 border-b pb-4">
                  <h2 className="text-xl font-bold text-slate-800">Studio Mystri</h2>
                  <p className="text-xs text-slate-500">Payslip for the month of {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                  <h3 className="font-bold text-lg mt-2">{showPayslipModal.name}</h3>
                  <p className="text-xs text-slate-500">{showPayslipModal.role}</p>
               </div>
               
               {(() => {
                  const breakup = calculateSalaryBreakup(showPayslipModal.salary);
                  return (
                     <div className="grid grid-cols-2 gap-8 mb-6">
                        {/* Earnings */}
                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                           <h4 className="font-bold text-green-800 mb-3 border-b border-green-200 pb-1">Earnings</h4>
                           <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span>Basic</span> <span>{formatCurrency(breakup.basic)}</span></div>
                              <div className="flex justify-between"><span>HRA</span> <span>{formatCurrency(breakup.hra)}</span></div>
                              <div className="flex justify-between"><span>Special Allow.</span> <span>{formatCurrency(breakup.special)}</span></div>
                              <div className="flex justify-between border-t border-green-200 pt-2 font-bold"><span>Total Earnings</span> <span>{formatCurrency(breakup.monthlyGross)}</span></div>
                           </div>
                        </div>

                        {/* Deductions */}
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                           <h4 className="font-bold text-red-800 mb-3 border-b border-red-200 pb-1">Deductions</h4>
                           <div className="space-y-2 text-sm">
                              <div className="flex justify-between"><span>PF</span> <span>{formatCurrency(breakup.pf)}</span></div>
                              <div className="flex justify-between"><span>Prof. Tax</span> <span>{formatCurrency(breakup.pt)}</span></div>
                              <div className="flex justify-between"><span>TDS</span> <span>{formatCurrency(breakup.tds)}</span></div>
                              <div className="flex justify-between border-t border-red-200 pt-2 font-bold"><span>Total Deductions</span> <span>{formatCurrency(breakup.totalDeductions)}</span></div>
                           </div>
                        </div>

                        <div className="col-span-2 bg-indigo-50 p-4 rounded-lg border border-indigo-200 flex justify-between items-center">
                           <span className="font-bold text-indigo-900">Net Pay (Take Home)</span>
                           <span className="text-xl font-bold text-indigo-700">{formatCurrency(breakup.netPay)}</span>
                        </div>
                     </div>
                  );
               })()}

               <div className="flex gap-2">
                  <button onClick={() => alert('PDF Download Started...')} className="flex-1 py-3 bg-white border border-slate-200 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-slate-50">
                     <Download className="w-4 h-4"/> Download PDF
                  </button>
                  <button onClick={() => setShowPayslipModal(null)} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">
                     Close
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* View Deep Profile Modal */}
      {viewProfile && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden h-[80vh] flex flex-col">
               <div className="bg-indigo-600 p-6 text-white flex justify-between items-start shrink-0">
                  <div className="flex gap-4 items-center">
                     <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 text-2xl font-bold">{viewProfile.name.charAt(0)}</div>
                     <div>
                        <h2 className="text-2xl font-bold">{viewProfile.name}</h2>
                        <p className="opacity-80">{viewProfile.role}</p>
                     </div>
                  </div>
                  <button onClick={() => setViewProfile(null)} className="bg-white/20 p-1 rounded hover:bg-white/30"><X className="w-5 h-5"/></button>
               </div>
               
               <div className="p-6 grid grid-cols-2 gap-6 overflow-y-auto flex-1">
                  {/* Personal Info */}
                  <div>
                     <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Users className="w-4 h-4"/> Personal Details</h4>
                     <div className="space-y-2 text-sm text-slate-600">
                        <p className="flex justify-between border-b pb-1"><span>DOB:</span> <span className="font-medium">{viewProfile.dob || 'Not set'}</span></p>
                        <p className="flex justify-between border-b pb-1"><span>Phone:</span> <span className="font-medium">{viewProfile.phone}</span></p>
                        <p className="flex justify-between border-b pb-1"><span>Email:</span> <span className="font-medium">{viewProfile.email}</span></p>
                        <p className="flex justify-between border-b pb-1"><span>Address:</span> <span className="font-medium">{viewProfile.address || 'Not set'}</span></p>
                     </div>
                  </div>

                  {/* Professional Info */}
                  <div>
                     <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><Award className="w-4 h-4"/> Professional Details</h4>
                     <div className="space-y-2 text-sm text-slate-600">
                        <p className="flex justify-between border-b pb-1"><span>Joined:</span> <span className="font-medium">{viewProfile.joinDate}</span></p>
                        <p className="flex justify-between border-b pb-1"><span>Salary:</span> <span className="font-medium">{formatCurrency(viewProfile.salary)}</span></p>
                        <p className="flex justify-between border-b pb-1"><span>Leaves:</span> <span className="font-medium">{viewProfile.leavesRemaining} / {viewProfile.leavePolicy}</span></p>
                        <p className="flex justify-between border-b pb-1"><span>Qualifications:</span> <span className="font-medium">{viewProfile.qualifications || 'N/A'}</span></p>
                     </div>
                  </div>

                  {/* Documents Section */}
                  <div className="col-span-2">
                     <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2"><FileText className="w-4 h-4"/> Documents</h4>
                     <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        {viewProfile.documents && viewProfile.documents.length > 0 ? (
                           <div className="grid grid-cols-2 gap-2 mb-4">
                              {viewProfile.documents.map((doc, idx) => (
                                 <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded border">
                                    <FileText className="w-4 h-4 text-indigo-500" />
                                    <span className="text-sm truncate flex-1">{doc.name}</span>
                                    <Download className="w-3 h-3 text-slate-400 cursor-pointer" />
                                 </div>
                              ))}
                           </div>
                        ) : (
                           <p className="text-sm text-slate-400 mb-4 text-center italic">No documents uploaded.</p>
                        )}
                        <label className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-slate-300 rounded-lg p-4 cursor-pointer hover:bg-slate-100 transition-colors">
                           <FilePlus className="w-5 h-5 text-slate-500" />
                           <span className="text-sm text-slate-600 font-medium">Upload Document (ID, Resume, Contract)</span>
                           <input type="file" className="hidden" onChange={handleFileUpload} />
                        </label>
                     </div>
                  </div>

                  {/* Emergency */}
                  <div className="col-span-2 bg-red-50 p-4 rounded-lg border border-red-100">
                     <h4 className="font-bold text-red-800 mb-1 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Emergency Contact</h4>
                     <p className="text-sm text-red-700">{viewProfile.emergencyContact || 'No emergency contact details available.'}</p>
                  </div>
               </div>
               
               <div className="p-4 bg-slate-50 border-t flex justify-end gap-2 shrink-0">
                  <button onClick={() => openEdit(viewProfile)} className="px-4 py-2 bg-white border rounded text-sm font-medium flex items-center gap-2"><Edit className="w-4 h-4"/> Edit Profile</button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};