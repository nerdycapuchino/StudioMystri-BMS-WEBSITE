
import React, { useMemo } from 'react';
import { useInventory, useUpdateInventoryItem } from '../hooks/useInventory';
import { useInvoices } from '../hooks/useInvoices';
import { useEmployees } from '../hooks/useHR';
import { useERPStats, useCreatePurchaseOrder } from '../hooks/useERP';
import { AlertTriangle, Package, DollarSign, Users, Filter, X, MapPin } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { InventoryItem } from '../types';
import toast from 'react-hot-toast';

export const ERP: React.FC = () => {
  const { data: invData, isLoading: invLoading } = useInventory();
  const { data: invoiceData, isLoading: invoiceLoading } = useInvoices();
  const { data: empData } = useEmployees();
  const { data: erpStats } = useERPStats();
  const updateItem = useUpdateInventoryItem();
  const createPO = useCreatePurchaseOrder();

  const inventory: InventoryItem[] = Array.isArray(invData?.data || invData) ? (invData?.data || invData) as InventoryItem[] : [];
  const invoices: any[] = Array.isArray(invoiceData?.data || invoiceData) ? (invoiceData?.data || invoiceData) as any[] : [];
  const employees: any[] = Array.isArray(empData?.data || empData) ? (empData?.data || empData) as any[] : [];

  const formatCurrency = (n: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null);
  const [newQty, setNewQty] = React.useState(0);
  const [newLocation, setNewLocation] = React.useState('');

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setNewQty(item.quantity);
    setNewLocation(item.location || '');
  };

  const handleSave = () => {
    if (editingItem) {
      updateItem.mutate({ id: editingItem.id, quantity: newQty, location: newLocation } as any, {
        onSuccess: () => setEditingItem(null)
      });
    }
  };

  const handleOrder = (item: InventoryItem) => {
    createPO.mutate({
      itemId: item.id,
      quantity: item.reorderLevel * 2,
      unitCost: item.cost,
      supplierId: (item as any).supplierId || undefined,
    }, {
      onSuccess: () => toast.success(`Purchase order placed for ${item.name}`),
    });
  };

  // Real Data Processing for Charts
  const chartData = useMemo(() => {
    const monthlyData: { [key: string]: { name: string; revenue: number; expenses: number } } = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(m => monthlyData[m] = { name: m, revenue: 0, expenses: 0 });
    invoices.forEach(inv => {
      const d = new Date(inv.date);
      const monthName = isNaN(d.getTime()) ? 'Nov' : months[d.getMonth()];
      if (monthlyData[monthName]) {
        if (inv.type === 'Income') monthlyData[monthName].revenue += inv.amount;
        else if (inv.type === 'Expense') monthlyData[monthName].expenses += inv.amount;
      }
    });
    return Object.values(monthlyData);
  }, [invoices]);

  const totalRevenue = invoices.filter(i => i.type === 'Income').reduce((sum, i) => sum + i.amount, 0);
  const lowStockCount = erpStats?.lowStockCount ?? inventory.filter(i => i.quantity <= i.reorderLevel).length;
  const activeOrders = invoices.filter(i => i.status === 'Pending' || i.status === 'Partial').length;

  const isLoading = invLoading || invoiceLoading;

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

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-2 relative">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Business Overview</h2>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Revenue', value: formatCurrency(totalRevenue), trend: '+12%', icon: DollarSign, color: 'indigo' },
          { title: 'Low Stock Items', value: lowStockCount, trend: 'Action Req', icon: AlertTriangle, color: 'orange' },
          { title: 'Active Orders', value: activeOrders, trend: '+5%', icon: Package, color: 'blue' },
          { title: 'Staff Present', value: `${employees.filter(e => e.attendance === 'Present').length}/${employees.length}`, trend: '92%', icon: Users, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-2">
              <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${stat.trend.includes('+') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
            <p className="text-sm text-slate-500">{stat.title}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-slate-800">Financial Performance</h3>
            <select className="text-sm border-none bg-slate-50 rounded px-2 py-1 text-slate-600 focus:ring-0 cursor-pointer">
              <option>This Year</option>
            </select>
          </div>
          <div className="h-64 min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar dataKey="revenue" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} name="Income" />
                <Bar dataKey="expenses" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={32} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
          <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            Stock Alerts
          </h3>
          <div className="space-y-4 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {inventory.filter(i => i.quantity <= i.reorderLevel).map(item => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm font-bold text-xs shrink-0">
                  {item.quantity}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-slate-800 truncate">{item.name}</h4>
                  <p className="text-xs text-slate-500">Below level ({item.reorderLevel})</p>
                </div>
                <button onClick={() => handleOrder(item)} disabled={createPO.isPending} className="text-xs bg-white text-orange-600 px-2 py-1 rounded border border-orange-200 font-medium hover:bg-orange-100 disabled:opacity-50">
                  {createPO.isPending ? '...' : 'Order'}
                </button>
              </div>
            ))}
            {inventory.filter(i => i.quantity <= i.reorderLevel).length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">All stock levels are good.</p>
            )}
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex-1">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Master Inventory & Warehouse</h3>
          <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50">
            <Filter className="w-3 h-3" /> Filter
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-4 py-3">Item Name</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Unit Cost</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {item.location || 'Unassigned'}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.quantity} {item.unit}</td>
                  <td className="px-4 py-3 text-slate-700">{formatCurrency(item.cost)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.quantity <= item.reorderLevel ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                      }`}>
                      {item.quantity <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEditClick(item)} className="text-indigo-600 cursor-pointer font-medium hover:underline">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Inventory Modal */}
      {editingItem && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Manage Warehouse Item</h3>
              <button onClick={() => setEditingItem(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-500 block mb-1">Item Name</label>
              <p className="font-bold">{editingItem.name}</p>
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-500 block mb-1">Quantity</label>
              <input type="number" value={newQty} onChange={e => setNewQty(parseInt(e.target.value) || 0)} className="w-full border p-2 rounded" />
            </div>
            <div className="mb-4">
              <label className="text-xs text-slate-500 block mb-1">Warehouse Location / Bin</label>
              <input type="text" value={newLocation} onChange={e => setNewLocation(e.target.value)} className="w-full border p-2 rounded" placeholder="e.g., Aisle 4, Bin 12" />
            </div>
            <button onClick={handleSave} disabled={updateItem.isPending} className="w-full bg-indigo-600 text-slate-800 py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50">
              {updateItem.isPending ? 'Updating...' : 'Update Inventory'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
