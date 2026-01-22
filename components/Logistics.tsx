
import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Truck, MapPin, Package, Calendar, X, Plus, ExternalLink, Mail, Edit2 } from 'lucide-react';
import { Shipment } from '../types';

export const Logistics: React.FC = () => {
  const { shipments, addShipment, updateShipment } = useGlobal();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>({ customer: '', orderId: '', courier: 'BlueDart', eta: '', trackingUrl: '' });
  const [customCourier, setCustomCourier] = useState(false);

  const safeShipments = shipments || []; // Prevent crash if undefined

  const handleCreate = () => {
    if(newShipment.customer && newShipment.orderId) {
       addShipment({
         id: Math.random().toString(36).substr(2, 9),
         customer: newShipment.customer,
         orderId: newShipment.orderId,
         courier: customCourier ? newShipment.courier! : (newShipment.courier || 'BlueDart'),
         trackingNumber: `TRK-${Math.floor(Math.random() * 10000)}`,
         trackingUrl: newShipment.trackingUrl,
         status: 'Pending',
         eta: newShipment.eta || 'Pending'
       });
       setShowCreateModal(false);
       setNewShipment({ customer: '', orderId: '', courier: 'BlueDart', eta: '', trackingUrl: '' });
       setCustomCourier(false);
    }
  };

  const handleUpdate = () => {
    if (editingShipment) {
      updateShipment(editingShipment.id, editingShipment);
      setEditingShipment(null);
    }
  };

  const handleEmailShare = (shipment: Shipment) => {
     alert(`Tracking details for ${shipment.trackingNumber} sent to customer via ${shipment.courier === 'Internal Fleet' ? 'SMS' : 'Email'}.`);
  };

  return (
    <div className="h-full flex flex-col relative bg-background-light dark:bg-background-dark text-white p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Logistics & Shipping</h2>
           <p className="text-zinc-400 text-sm mt-1">Track orders and manage fleet dispatch.</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-5 py-2.5 bg-primary text-background-dark rounded-full text-sm font-bold hover:bg-[#2ecc71] flex items-center gap-2 shadow-glow transition-all active:scale-95">
          <Truck className="w-4 h-4" /> Create Shipment
        </button>
      </div>

      <div className="bg-surface-dark rounded-2xl shadow-xl border border-white/5 overflow-hidden flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-surface-highlight text-zinc-400 font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Tracking ID</th>
                <th className="px-6 py-4">Order Info</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Courier</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {safeShipments.map(shipment => (
                <tr key={shipment.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-primary">{shipment.trackingNumber}</td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-white">{shipment.orderId}</div>
                    <div className="text-xs text-zinc-500">{shipment.customer}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      shipment.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      shipment.status === 'In Transit' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      {shipment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-zinc-500" />
                      {shipment.courier}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end gap-2">
                    <button onClick={() => setEditingShipment(shipment)} className="p-2 text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors" title="Edit">
                       <Edit2 className="w-4 h-4" />
                    </button>
                    {shipment.trackingUrl && (
                       <a href={shipment.trackingUrl} target="_blank" rel="noreferrer" className="p-2 text-zinc-400 hover:text-primary bg-white/5 hover:bg-primary/10 rounded-full transition-colors" title="Track">
                          <ExternalLink className="w-4 h-4" />
                       </a>
                    )}
                    <button onClick={() => handleEmailShare(shipment)} className="p-2 text-zinc-400 hover:text-primary bg-white/5 hover:bg-primary/10 rounded-full transition-colors" title="Share">
                       <Mail className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
           <div className="bg-surface-dark border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-xl text-white">New Shipment</h3>
                 <button onClick={() => setShowCreateModal(false)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4">
                 <input 
                    className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary" 
                    placeholder="Order ID" 
                    value={newShipment.orderId} 
                    onChange={e => setNewShipment({...newShipment, orderId: e.target.value})} 
                 />
                 <input 
                    className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary" 
                    placeholder="Customer Name" 
                    value={newShipment.customer} 
                    onChange={e => setNewShipment({...newShipment, customer: e.target.value})} 
                 />
                 
                 {!customCourier ? (
                    <div className="relative">
                       <select 
                         className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer" 
                         value={newShipment.courier} 
                         onChange={e => {
                            if (e.target.value === 'Other') {
                               setCustomCourier(true);
                               setNewShipment({...newShipment, courier: ''});
                            } else {
                               setNewShipment({...newShipment, courier: e.target.value});
                            }
                         }}
                       >
                          <option value="BlueDart">BlueDart</option>
                          <option value="Delhivery">Delhivery</option>
                          <option value="Dunzo">Dunzo</option>
                          <option value="Internal Fleet">Internal Fleet</option>
                          <option value="Other">Other (Custom)</option>
                       </select>
                       <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">expand_more</span>
                    </div>
                 ) : (
                    <div className="flex gap-2">
                       <input 
                          className="flex-1 bg-surface-highlight border border-white/10 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary" 
                          placeholder="Enter Courier Name" 
                          value={newShipment.courier} 
                          onChange={e => setNewShipment({...newShipment, courier: e.target.value})} 
                       />
                       <button onClick={() => setCustomCourier(false)} className="px-4 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-colors">Reset</button>
                    </div>
                 )}

                 <input 
                    className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-primary" 
                    placeholder="Tracking URL (Optional)" 
                    value={newShipment.trackingUrl} 
                    onChange={e => setNewShipment({...newShipment, trackingUrl: e.target.value})} 
                 />
                 <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors">Cancel</button>
                    <button onClick={handleCreate} className="flex-1 py-3 bg-primary text-background-dark rounded-xl font-bold hover:bg-[#2ecc71] transition-colors shadow-glow">Dispatch</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingShipment && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="bg-surface-dark border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
               <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-white">Edit Shipment</h3>
                  <button onClick={() => setEditingShipment(null)} className="text-zinc-500 hover:text-white"><X className="w-5 h-5"/></button>
               </div>
               <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 block">Order ID</label>
                        <input className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary focus:outline-none" value={editingShipment.orderId} onChange={e => setEditingShipment({...editingShipment, orderId: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 block">Customer</label>
                        <input className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary focus:outline-none" value={editingShipment.customer} onChange={e => setEditingShipment({...editingShipment, customer: e.target.value})} />
                     </div>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 block">Status</label>
                    <div className="relative">
                      <select className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary focus:outline-none appearance-none" value={editingShipment.status} onChange={e => setEditingShipment({...editingShipment, status: e.target.value as any})}>
                        <option value="Pending">Pending</option>
                        <option value="In Transit">In Transit</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Returned">Returned</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">expand_more</span>
                    </div>
                  </div>
                  <div>
                     <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 block">Tracking URL</label>
                     <input className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary focus:outline-none" placeholder="Tracking URL" value={editingShipment.trackingUrl} onChange={e => setEditingShipment({...editingShipment, trackingUrl: e.target.value})} />
                  </div>
                  <div>
                     <label className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1 block">ETA</label>
                     <input className="w-full bg-surface-highlight border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary focus:outline-none" type="date" value={editingShipment.eta} onChange={e => setEditingShipment({...editingShipment, eta: e.target.value})} />
                  </div>
                  <div className="flex gap-3 pt-2">
                     <button onClick={() => setEditingShipment(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-colors">Cancel</button>
                     <button onClick={handleUpdate} className="flex-1 py-3 bg-primary text-background-dark rounded-xl font-bold hover:bg-[#2ecc71] transition-colors shadow-glow">Save Changes</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};
