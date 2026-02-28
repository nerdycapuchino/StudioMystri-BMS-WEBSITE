import React, { useState } from 'react';
import { useShipments, useCreateShipment, useUpdateShipmentStatus } from '../hooks/useLogistics';
import { Shipment } from '../types';
import { TableSkeleton, InlineError } from './ui/Skeleton';
import toast from 'react-hot-toast';

export const Logistics: React.FC = () => {
   const { data: shipData, isLoading, isError, error } = useShipments();
   const createShipment = useCreateShipment();
   const updateStatus = useUpdateShipmentStatus();

   const shipments: Shipment[] = Array.isArray(shipData?.data || shipData) ? (shipData?.data || shipData) as Shipment[] : [];

   const [showCreateModal, setShowCreateModal] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [customCourier, setCustomCourier] = useState(false);
   const [filterStatus, setFilterStatus] = useState('All');

   const [newShipment, setNewShipment] = useState({ customer: '', orderId: '', courier: 'BlueDart', eta: '', trackingUrl: '' });

   const filteredShipments = shipments.filter(s => {
      const matchesSearch = s.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         s.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
         (s.trackingNumber || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === 'All' || s.status === filterStatus;
      return matchesSearch && matchesFilter;
   });

   const handleCreate = () => {
      if (newShipment.customer && newShipment.orderId) {
         createShipment.mutate({
            customer: newShipment.customer,
            orderId: newShipment.orderId,
            courier: customCourier ? newShipment.courier : (newShipment.courier || 'BlueDart'),
            trackingNumber: `TRK-${Math.floor(Math.random() * 10000)}`,
            trackingUrl: newShipment.trackingUrl,
            status: 'Pending',
            eta: newShipment.eta || 'Pending'
         } as any, {
            onSuccess: () => {
               setShowCreateModal(false);
               setNewShipment({ customer: '', orderId: '', courier: 'BlueDart', eta: '', trackingUrl: '' });
               setCustomCourier(false);
               toast.success('Shipment created successfully');
            }
         });
      } else {
         toast.error('Customer and Order ID are required');
      }
   };

   const handleStatusUpdate = (id: string, newStatus: string) => {
      updateStatus.mutate({ id, status: newStatus } as any, {
         onSuccess: () => toast.success('Status updated')
      });
   };

   const pendingCount = shipments.filter(s => s.status === 'Pending').length;
   const inTransitCount = shipments.filter(s => s.status === 'In Transit').length;
   const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;

   if (isLoading) return <div className="h-full p-6"><TableSkeleton /></div>;
   if (isError) return <div className="h-full p-6"><InlineError message={(error as Error)?.message || 'Failed to load'} /></div>;

   return (
      <div className="flex-1 px-6 py-8 max-w-[1600px] mx-auto w-full flex flex-col gap-6 overflow-y-auto custom-scrollbar bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
         {/* Page Header & Actions */}
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Logistics & Shipment Tracking</h1>
               <p className="text-slate-500 dark:text-slate-400 mt-1">Manage outgoing deliveries and track shipment statuses for ongoing projects.</p>
            </div>
            <div className="flex gap-3 items-center">
               <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                  <input
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white dark:bg-[#1a2634] border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                     placeholder="Search shipments..."
                  />
               </div>
               <button onClick={() => toast("Exporting report...")} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                  <span className="hidden sm:inline">Export Report</span>
               </button>
               <button onClick={() => setShowCreateModal(true)} className="bg-primary hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20">
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  <span className="hidden sm:inline">New Shipment</span>
               </button>
            </div>
         </div>

         {/* Stats Overview */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total */}
            <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-primary">
                     <span className="material-symbols-outlined">local_shipping</span>
                  </div>
               </div>
               <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Tracked</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{shipments.length}</h3>
               </div>
            </div>
            {/* In Transit */}
            <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600">
                     <span className="material-symbols-outlined">package_2</span>
                  </div>
               </div>
               <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">In Transit</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{inTransitCount}</h3>
               </div>
            </div>
            {/* Pending */}
            <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600">
                     <span className="material-symbols-outlined">warning</span>
                  </div>
               </div>
               <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pending Processing</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{pendingCount}</h3>
               </div>
            </div>
            {/* Delivered */}
            <div className="bg-white dark:bg-[#1a2634] p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col gap-3">
               <div className="flex justify-between items-start">
                  <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600">
                     <span className="material-symbols-outlined">check_circle</span>
                  </div>
               </div>
               <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Delivered Total</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{deliveredCount}</h3>
               </div>
            </div>
         </div>

         {/* Main Content Area: Map & List */}
         <div className="flex flex-col xl:flex-row gap-6 h-[calc(100vh-320px)] min-h-[600px] mb-8">
            {/* Shipment List */}
            <div className="w-full bg-white dark:bg-[#1a2634] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
               {/* List Header & Filters */}
               <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                     {['All', 'In Transit', 'Pending', 'Delivered'].map(status => (
                        <button
                           key={status}
                           onClick={() => setFilterStatus(status)}
                           className={`px-3 py-1.5 text-xs font-medium rounded-md shadow-sm transition-colors ${filterStatus === status
                              ? 'bg-primary text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              }`}
                        >
                           {status === 'All' ? 'All Shipments' : status}
                        </button>
                     ))}
                  </div>
                  <div className="flex items-center gap-2">
                     <button className="flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[18px]">sort</span>
                        Sort by Date
                     </button>
                  </div>
               </div>

               {/* Scrollable Table Area */}
               <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                     <thead className="bg-slate-50 dark:bg-[#131d26] sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                           <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tracking / Carrier</th>
                           <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Customer / Order ID</th>
                           <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status / ETA</th>
                           <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredShipments.length > 0 ? filteredShipments.map((ship) => (
                           <tr key={ship.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="p-4 align-top">
                                 <div className="font-medium text-slate-900 dark:text-white text-sm">{ship.trackingNumber}</div>
                                 <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                                    {ship.courier}
                                 </div>
                              </td>
                              <td className="p-4 align-top">
                                 <div className="font-medium text-slate-900 dark:text-white text-sm">{ship.customer}</div>
                                 <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ref: {ship.orderId}</div>
                              </td>
                              <td className="p-4 align-top">
                                 <div className="flex flex-col items-start gap-1">
                                    <select
                                       value={ship.status}
                                       onChange={e => handleStatusUpdate(ship.id, e.target.value)}
                                       className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-primary/20 appearance-none outline-none ${ship.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                          ship.status === 'In Transit' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                             ship.status === 'Returned' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                                'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                          }`}
                                    >
                                       <option value="Pending">🕒 Pending</option>
                                       <option value="In Transit">🚚 In Transit</option>
                                       <option value="Delivered">✅ Delivered</option>
                                       <option value="Returned">❌ Returned</option>
                                    </select>
                                    <div className="text-xs font-medium mt-1 text-slate-500 dark:text-slate-400">ETA: {ship.eta}</div>
                                 </div>
                              </td>
                              <td className="p-4 align-top text-right">
                                 <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                    {ship.trackingUrl && (
                                       <a href={ship.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary px-3 py-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1">
                                          Track <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                       </a>
                                    )}
                                    <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1">
                                       <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan={4} className="p-8 text-center text-slate-500 font-medium">
                                 No shipments found matching criteria.
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>

               {/* Pagination Footer */}
               <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-[#131d26] rounded-b-xl mt-auto">
                  <span className="text-xs text-slate-500 dark:text-slate-400">Showing {filteredShipments.length} shipments</span>
                  <div className="flex gap-1">
                     <button className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50" disabled>
                        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                     </button>
                     <button className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50" disabled>
                        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>

         {/* Create Shipment Modal */}
         {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
               <div className="bg-white dark:bg-[#1a2634] rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
                     <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">New Shipment</h3>
                     <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 p-1 transition-colors">
                        <span className="material-symbols-outlined text-[24px]">close</span>
                     </button>
                  </div>
                  <div className="p-6 space-y-4 overflow-y-auto">
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name *</label>
                        <input value={newShipment.customer} onChange={e => setNewShipment({ ...newShipment, customer: e.target.value })} placeholder="e.g. Tribeca Loft" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Order ID *</label>
                        <input value={newShipment.orderId} onChange={e => setNewShipment({ ...newShipment, orderId: e.target.value })} placeholder="e.g. ORD-1029" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Courier Service</label>
                        <select
                           value={customCourier ? 'Custom' : newShipment.courier}
                           onChange={e => {
                              if (e.target.value === 'Custom') { setCustomCourier(true); setNewShipment({ ...newShipment, courier: '' }); }
                              else { setCustomCourier(false); setNewShipment({ ...newShipment, courier: e.target.value }); }
                           }}
                           className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50"
                        >
                           <option value="BlueDart">BlueDart</option>
                           <option value="DTDC">DTDC</option>
                           <option value="Delhivery">Delhivery</option>
                           <option value="FedEx">FedEx</option>
                           <option value="Custom">Custom Courier...</option>
                        </select>
                        {customCourier && (
                           <input autoFocus value={newShipment.courier} onChange={e => setNewShipment({ ...newShipment, courier: e.target.value })} placeholder="Enter custom courier name" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 mt-2" />
                        )}
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estimated Arrival</label>
                        <input value={newShipment.eta} onChange={e => setNewShipment({ ...newShipment, eta: e.target.value })} placeholder="e.g. Oct 28, 2023" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50" />
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tracking URL (Optional)</label>
                        <input value={newShipment.trackingUrl} onChange={e => setNewShipment({ ...newShipment, trackingUrl: e.target.value })} placeholder="https://" className="w-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50" />
                     </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
                     <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Cancel</button>
                     <button
                        onClick={handleCreate}
                        disabled={createShipment.isPending}
                        className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm shadow-blue-500/20"
                     >
                        {createShipment.isPending ? 'Saving...' : 'Create Shipment'}
                     </button>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};
