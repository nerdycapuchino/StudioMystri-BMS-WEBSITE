import React, { useState } from 'react';
import { useGlobal } from '../context/GlobalContext';
import { Truck, MapPin, Package, Calendar, X, Plus, ExternalLink, Mail, Edit2 } from 'lucide-react';
import { Shipment } from '../types';

export const Logistics: React.FC = () => {
  const { shipments, addShipment, updateShipment } = useGlobal();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [newShipment, setNewShipment] = useState<Partial<Shipment>>({ customer: '', orderId: '', courier: 'BlueDart', eta: '', trackingUrl: '' });

  const handleCreate = () => {
    if(newShipment.customer && newShipment.orderId) {
       addShipment({
         id: Math.random().toString(36).substr(2, 9),
         customer: newShipment.customer,
         orderId: newShipment.orderId,
         courier: newShipment.courier || 'BlueDart',
         trackingNumber: `TRK-${Math.floor(Math.random() * 10000)}`,
         trackingUrl: newShipment.trackingUrl,
         status: 'Pending',
         eta: newShipment.eta || 'Pending'
       });
       setShowCreateModal(false);
       setNewShipment({ customer: '', orderId: '', courier: 'BlueDart', eta: '', trackingUrl: '' });
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
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Logistics & Shipping</h2>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2">
          <Truck className="w-4 h-4" /> Create Shipment
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">Tracking ID</th>
              <th className="px-6 py-4">Order Info</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Courier</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {shipments.map(shipment => (
              <tr key={shipment.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-indigo-600 font-mono">{shipment.trackingNumber}</td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{shipment.orderId}</div>
                  <div className="text-xs text-slate-500">{shipment.customer}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    shipment.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                    shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {shipment.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-600">{shipment.courier}</td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => setEditingShipment(shipment)} className="p-1 text-slate-400 hover:text-indigo-600" title="Edit Shipment">
                     <Edit2 className="w-4 h-4" />
                  </button>
                  {shipment.trackingUrl && (
                     <a href={shipment.trackingUrl} target="_blank" rel="noreferrer" className="p-1 text-slate-400 hover:text-indigo-600" title="Track Online">
                        <ExternalLink className="w-4 h-4" />
                     </a>
                  )}
                  <button onClick={() => handleEmailShare(shipment)} className="p-1 text-slate-400 hover:text-indigo-600" title="Email Tracking Info">
                     <Mail className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
              <h3 className="font-bold text-lg mb-4">New Shipment</h3>
              <div className="space-y-3">
                 <input className="w-full border p-2 rounded" placeholder="Order ID" value={newShipment.orderId} onChange={e => setNewShipment({...newShipment, orderId: e.target.value})} />
                 <input className="w-full border p-2 rounded" placeholder="Customer Name" value={newShipment.customer} onChange={e => setNewShipment({...newShipment, customer: e.target.value})} />
                 <select className="w-full border p-2 rounded" value={newShipment.courier} onChange={e => setNewShipment({...newShipment, courier: e.target.value})}>
                    <option value="BlueDart">BlueDart</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="Dunzo">Dunzo</option>
                    <option value="Internal Fleet">Internal Fleet</option>
                 </select>
                 <input className="w-full border p-2 rounded" placeholder="Tracking URL (Optional)" value={newShipment.trackingUrl} onChange={e => setNewShipment({...newShipment, trackingUrl: e.target.value})} />
                 <div className="flex gap-2">
                    <button onClick={() => setShowCreateModal(false)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                    <button onClick={handleCreate} className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold">Dispatch</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingShipment && (
         <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
               <h3 className="font-bold text-lg mb-4">Edit Shipment</h3>
               <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="text-xs text-slate-500">Order ID</label>
                        <input className="w-full border p-2 rounded" value={editingShipment.orderId} onChange={e => setEditingShipment({...editingShipment, orderId: e.target.value})} />
                     </div>
                     <div>
                        <label className="text-xs text-slate-500">Customer</label>
                        <input className="w-full border p-2 rounded" value={editingShipment.customer} onChange={e => setEditingShipment({...editingShipment, customer: e.target.value})} />
                     </div>
                  </div>
                  <select className="w-full border p-2 rounded" value={editingShipment.status} onChange={e => setEditingShipment({...editingShipment, status: e.target.value as any})}>
                     <option value="Pending">Pending</option>
                     <option value="In Transit">In Transit</option>
                     <option value="Delivered">Delivered</option>
                     <option value="Returned">Returned</option>
                  </select>
                  <input className="w-full border p-2 rounded" placeholder="Tracking URL" value={editingShipment.trackingUrl} onChange={e => setEditingShipment({...editingShipment, trackingUrl: e.target.value})} />
                  <input className="w-full border p-2 rounded" type="date" value={editingShipment.eta} onChange={e => setEditingShipment({...editingShipment, eta: e.target.value})} />
                  <div className="flex gap-2">
                     <button onClick={() => setEditingShipment(null)} className="flex-1 py-2 bg-slate-100 rounded">Cancel</button>
                     <button onClick={handleUpdate} className="flex-1 py-2 bg-indigo-600 text-white rounded font-bold">Save Changes</button>
                  </div>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};