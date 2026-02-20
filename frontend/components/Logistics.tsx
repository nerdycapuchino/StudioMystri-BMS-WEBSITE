
import React, { useState } from 'react';
import { useShipments, useCreateShipment, useUpdateShipmentStatus } from '../hooks/useLogistics';
import { Truck, Plus, X, Search, Package, MapPin, Clock, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export const Logistics: React.FC = () => {
   const { data: shipData, isLoading, isError, error } = useShipments();
   const createShipment = useCreateShipment();
   const updateStatus = useUpdateShipmentStatus();

   const shipments: any[] = Array.isArray(shipData?.data || shipData) ? (shipData?.data || shipData) as any[] : [];

   const [showCreateModal, setShowCreateModal] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');
   const [customCourier, setCustomCourier] = useState(false);

   const [newShipment, setNewShipment] = useState({ customer: '', orderId: '', courier: 'BlueDart', eta: '', trackingUrl: '' });

   const filteredShipments = shipments.filter(s =>
      s.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.trackingNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
   );

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
            }
         });
      }
   };

   const handleStatusUpdate = (id: string, newStatus: string) => {
      updateStatus.mutate({ id, status: newStatus } as any);
   };

   if (isLoading) {
      return (
         <div className="h-full flex flex-col p-6 space-y-6">
            <div className="h-10 bg-zinc-800/50 rounded-xl animate-pulse w-48" />
            <div className="flex-1 bg-zinc-800/50 rounded-xl animate-pulse" />
         </div>
      );
   }

   if (isError) {
      return (
         <div className="h-full flex items-center justify-center">
            <div className="text-center">
               <p className="text-red-500 font-bold mb-2">Failed to load shipments</p>
               <p className="text-zinc-500 text-sm">{(error as any)?.message || 'Unknown error'}</p>
            </div>
         </div>
      );
   }

   return (
      <div className="h-full flex flex-col overflow-y-auto pr-2 relative">
         <div className="flex justify-between items-center mb-6">
            <div>
               <h2 className="text-2xl font-bold text-slate-800">Logistics & Shipping</h2>
               <p className="text-slate-500 text-sm">{shipments.length} shipments tracked</p>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200">
               <Plus className="w-4 h-4" /> New Shipment
            </button>
         </div>

         {/* KPI Strip */}
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
               { label: 'Total', value: shipments.length, icon: Package, color: 'indigo' },
               { label: 'In Transit', value: shipments.filter(s => s.status === 'In Transit').length, icon: Truck, color: 'blue' },
               { label: 'Delivered', value: shipments.filter(s => s.status === 'Delivered').length, icon: MapPin, color: 'green' },
               { label: 'Pending', value: shipments.filter(s => s.status === 'Pending').length, icon: Clock, color: 'orange' },
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

         {/* Search */}
         <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm" placeholder="Search by customer, order ID, or tracking number..." />
         </div>

         {/* Shipments Table */}
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
            <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                     <tr>
                        <th className="px-4 py-3">Customer</th>
                        <th className="px-4 py-3">Order ID</th>
                        <th className="px-4 py-3">Courier</th>
                        <th className="px-4 py-3">Tracking</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">ETA</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {filteredShipments.map(ship => (
                        <tr key={ship.id} className="hover:bg-slate-50">
                           <td className="px-4 py-3 font-medium text-slate-800">{ship.customer}</td>
                           <td className="px-4 py-3 text-slate-600">{ship.orderId}</td>
                           <td className="px-4 py-3 text-slate-600">{ship.courier}</td>
                           <td className="px-4 py-3">
                              <div className="flex items-center gap-1">
                                 <span className="text-slate-600 font-mono text-xs">{ship.trackingNumber}</span>
                                 {ship.trackingUrl && (
                                    <a href={ship.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:text-indigo-700">
                                       <ExternalLink className="w-3 h-3" />
                                    </a>
                                 )}
                              </div>
                           </td>
                           <td className="px-4 py-3">
                              <select
                                 value={ship.status}
                                 onChange={e => handleStatusUpdate(ship.id, e.target.value)}
                                 className={`px-2 py-1 rounded-full text-xs font-medium border-none cursor-pointer ${ship.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                                       ship.status === 'In Transit' ? 'bg-blue-50 text-blue-600' :
                                          ship.status === 'Cancelled' ? 'bg-red-50 text-red-600' :
                                             'bg-orange-50 text-orange-600'
                                    }`}
                              >
                                 <option value="Pending">Pending</option>
                                 <option value="In Transit">In Transit</option>
                                 <option value="Delivered">Delivered</option>
                                 <option value="Cancelled">Cancelled</option>
                              </select>
                           </td>
                           <td className="px-4 py-3 text-slate-500">{ship.eta}</td>
                           <td className="px-4 py-3 text-right">
                              <span className="text-xs text-slate-400">—</span>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Create Modal */}
         {showCreateModal && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
               <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="font-bold text-lg">New Shipment</h3>
                     <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="space-y-3">
                     <input value={newShipment.customer} onChange={e => setNewShipment({ ...newShipment, customer: e.target.value })} placeholder="Customer Name" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <input value={newShipment.orderId} onChange={e => setNewShipment({ ...newShipment, orderId: e.target.value })} placeholder="Order ID" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <div>
                        <select
                           value={customCourier ? 'Custom' : newShipment.courier}
                           onChange={e => {
                              if (e.target.value === 'Custom') { setCustomCourier(true); setNewShipment({ ...newShipment, courier: '' }); }
                              else { setCustomCourier(false); setNewShipment({ ...newShipment, courier: e.target.value }); }
                           }}
                           className="w-full border border-slate-200 p-2.5 rounded-lg text-sm"
                        >
                           <option value="BlueDart">BlueDart</option>
                           <option value="DTDC">DTDC</option>
                           <option value="Delhivery">Delhivery</option>
                           <option value="FedEx">FedEx</option>
                           <option value="Custom">Custom Courier</option>
                        </select>
                        {customCourier && (
                           <input value={newShipment.courier} onChange={e => setNewShipment({ ...newShipment, courier: e.target.value })} placeholder="Enter courier name" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm mt-2" />
                        )}
                     </div>
                     <input value={newShipment.eta} onChange={e => setNewShipment({ ...newShipment, eta: e.target.value })} placeholder="Estimated Arrival" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                     <input value={newShipment.trackingUrl} onChange={e => setNewShipment({ ...newShipment, trackingUrl: e.target.value })} placeholder="Tracking URL (optional)" className="w-full border border-slate-200 p-2.5 rounded-lg text-sm" />
                  </div>
                  <button
                     onClick={handleCreate}
                     disabled={createShipment.isPending}
                     className="w-full mt-4 bg-indigo-600 text-white py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50"
                  >
                     {createShipment.isPending ? 'Creating...' : 'Create Shipment'}
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};
