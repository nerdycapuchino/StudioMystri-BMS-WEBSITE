import React, { useState } from 'react';
import { useCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer } from '../hooks/useCustomers';
import { Customer } from '../types';
import toast from 'react-hot-toast';

export const Customers: React.FC = () => {
   const { data: custData, isLoading, isError, error } = useCustomers();
   const createCustomer = useCreateCustomer();
   const updateCustomerMut = useUpdateCustomer();
   const deleteCustomerMut = useDeleteCustomer();
   const customers: Customer[] = Array.isArray(custData?.data || custData) ? (custData?.data || custData) as Customer[] : [];

   const formatCurrency = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

   const [searchQuery, setSearchQuery] = useState('');
   const [statusFilter, setStatusFilter] = useState('All');
   const [showModal, setShowModal] = useState(false);
   const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
   const [form, setForm] = useState<Partial<Customer>>({ name: '', contactName: '', industry: '', phone: '', email: '', address: '', status: 'Active' });

   const filteredCustomers = customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      return matchesSearch && matchesStatus;
   });

   const activeProjectsCount = customers.reduce((acc, c) => acc + (c.activeProjectCount || 0), 0);
   const pipelineValue = customers.reduce((acc, c) => acc + (c.totalSpend || 0), 0);
   const avgLtv = customers.length > 0 ? pipelineValue / customers.length : 0;

   const handleSave = () => {
      if (!form.name || !form.email) {
         toast.error("Company name and email are required");
         return;
      }

      if (editingCustomer) {
         updateCustomerMut.mutate({ id: editingCustomer.id, data: form }, {
            onSuccess: () => {
               toast.success('Customer updated successfully');
               closeModal();
            },
            onError: (err: any) => toast.error(err.message || 'Failed to update')
         });
      } else {
         createCustomer.mutate({
            ...form,
            history: [],
            totalSpend: 0,
         } as any, {
            onSuccess: () => {
               toast.success('Customer added successfully');
               closeModal();
            },
            onError: (err: any) => toast.error(err.message || 'Failed to add')
         });
      }
   };

   const handleDelete = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm("Are you sure you want to delete this customer?")) {
         deleteCustomerMut.mutate(id, {
            onSuccess: () => toast.success("Customer deleted")
         });
      }
   }

   const startEdit = (c: Customer, e: React.MouseEvent) => {
      e.stopPropagation();
      setEditingCustomer(c);
      setForm({
         name: c.name,
         contactName: c.contactName || '',
         industry: c.industry || '',
         phone: c.phone || '',
         email: c.email || '',
         address: c.address || '',
         status: c.status || 'Active'
      });
      setShowModal(true);
   };

   const closeModal = () => {
      setEditingCustomer(null);
      setForm({ name: '', contactName: '', industry: '', phone: '', email: '', address: '', status: 'Active' });
      setShowModal(false);
   }

   const getStatusStyle = (status?: string) => {
      switch (status) {
         case 'Active': return { bg: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800', dot: 'bg-green-600 dark:bg-green-400', animation: '' };
         case 'Lead': return { bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', animation: 'animate-pulse' };
         case 'Past Client': return { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', dot: 'bg-slate-500', animation: '' };
         default: return { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700', dot: 'bg-slate-500', animation: '' };
      }
   };

   return (
      <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 relative overflow-hidden animation-fade-in z-10 w-full">
         <div className="flex-none p-6 pb-2 overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
               {/* Header */}
               <div className="flex flex-wrap items-end justify-between gap-4">
                  <div className="flex flex-col gap-1">
                     <h2 className="text-slate-900 dark:text-white text-4xl font-display font-medium leading-tight">Client Directory</h2>
                     <p className="text-slate-500 dark:text-slate-400 text-base font-normal">Manage your client relationships and track project history.</p>
                  </div>
                  <div className="flex gap-3">
                     <button className="flex items-center justify-center gap-2 px-4 h-10 rounded-lg bg-primary hover:bg-blue-600 text-white text-sm font-bold shadow-sm transition-colors" onClick={() => setShowModal(true)}>
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        <span>Add New Client</span>
                     </button>
                  </div>
               </div>

               {/* KPI Cards */}
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] shadow-sm">
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Total Clients</p>
                     <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold font-display">{customers.length}</p>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] shadow-sm">
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Active Projects</p>
                     <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold font-display">{activeProjectsCount}</p>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] shadow-sm">
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Pipeline Value</p>
                     <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold font-display">{formatCurrency(pipelineValue)}</p>
                     </div>
                  </div>
                  <div className="flex flex-col gap-1 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] shadow-sm">
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">Avg. LTV</p>
                     <div className="flex items-baseline gap-2">
                        <p className="text-slate-900 dark:text-white text-2xl font-bold font-display">{formatCurrency(avgLtv)}</p>
                     </div>
                  </div>
               </div>

               {/* Filters & Search */}
               <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-[#1a2632] p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="relative w-full sm:w-96 group">
                     <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                        <span className="material-symbols-outlined">search</span>
                     </div>
                     <input
                        className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:text-sm"
                        placeholder="Search clients or emails..."
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-primary/20"
                     >
                        <option value="All">Status: All</option>
                        <option value="Active">Active</option>
                        <option value="Lead">Lead</option>
                        <option value="Past Client">Past Client</option>
                     </select>
                  </div>
               </div>
            </div>
         </div>

         {/* Table Area */}
         <div className="flex-1 overflow-auto px-6 pb-6 custom-scrollbar">
            <div className="max-w-7xl mx-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a2632] shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400">
                     <tr>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider font-display text-slate-700 dark:text-slate-300">Client Name</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider font-display text-slate-700 dark:text-slate-300">Contact Info</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider font-display text-slate-700 dark:text-slate-300">Projects</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider font-display text-slate-700 dark:text-slate-300">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider font-display text-slate-700 dark:text-slate-300 text-right">Lifetime Value</th>
                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider font-display text-slate-700 dark:text-slate-300 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                     {isLoading ? (
                        <tr><td colSpan={6} className="text-center py-8 text-slate-500">Loading clients...</td></tr>
                     ) : isError ? (
                        <tr><td colSpan={6} className="text-center py-8 text-rose-500">Failed to load clients.</td></tr>
                     ) : filteredCustomers.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-slate-500">No clients found matching your search.</td></tr>
                     ) : (
                        filteredCustomers.map(customer => {
                           const st = getStatusStyle(customer.status);
                           return (
                              <tr key={customer.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                 <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                       <div className="size-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0 text-slate-500 font-bold text-xs">
                                          {customer.name.substring(0, 2).toUpperCase()}
                                       </div>
                                       <div>
                                          <p className="font-display font-medium text-slate-900 dark:text-white text-base">{customer.name}</p>
                                          <p className="text-xs text-slate-500">{customer.industry || 'Unspecified'}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                       <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{customer.contactName || 'No Contact specified'}</p>
                                       <a className="text-sm text-primary hover:underline" href={`mailto:${customer.email}`}>{customer.email}</a>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                       <span className="text-sm text-slate-700 dark:text-slate-300">{customer.projectCount || 0} Projects</span>
                                       <span className="text-xs text-green-600 font-medium">{customer.activeProjectCount || 0} Active</span>
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${st.bg}`}>
                                       <span className={`size-1.5 rounded-full ${st.dot} ${st.animation}`}></span>
                                       {customer.status || 'Active'}
                                    </span>
                                 </td>
                                 <td className="px-6 py-4 text-right">
                                    <p className="font-display font-semibold text-slate-900 dark:text-white text-base">{formatCurrency(customer.totalSpend || 0)}</p>
                                 </td>
                                 <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                       <button onClick={(e) => startEdit(customer, e)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Edit">
                                          <span className="material-symbols-outlined text-[20px]">edit</span>
                                       </button>
                                       <button onClick={(e) => handleDelete(customer.id, e)} className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Delete">
                                          <span className="material-symbols-outlined text-[20px]">delete</span>
                                       </button>
                                    </div>
                                 </td>
                              </tr>
                           );
                        })
                     )}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Modal */}
         {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
               <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-6">
                     <h3 className="text-2xl font-display font-medium text-slate-900 dark:text-white">
                        {editingCustomer ? 'Edit Client' : 'New Client'}
                     </h3>
                     <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                     </button>
                  </div>
                  <div className="space-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Company Name *</label>
                           <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Acme Corp" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Industry</label>
                           <input value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" placeholder="e.g. Real Estate" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contact Person</label>
                           <input value={form.contactName} onChange={e => setForm({ ...form, contactName: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" placeholder="John Doe" />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email *</label>
                           <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" placeholder="john@example.com" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone</label>
                           <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20" placeholder="+1..." />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
                           <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20">
                              <option value="Active">Active</option>
                              <option value="Lead">Lead</option>
                              <option value="Past Client">Past Client</option>
                           </select>
                        </div>
                     </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                     <button onClick={closeModal} className="flex-1 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
                     <button onClick={handleSave} className="flex-1 py-2 bg-primary text-white rounded-lg font-medium hover:bg-blue-600 transition-colors">Save Client</button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
