import React from 'react';
import { useGlobal } from '../context/GlobalContext';
import { MOCK_SHIPMENTS } from '../constants';
import { DollarSign, Briefcase, AlertTriangle, Truck, TrendingUp, Users, ClipboardList, Bell } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard: React.FC = () => {
  const { salesToday, projects, activities, inventory, updateInventoryStock, leads } = useGlobal();

  const lowStockItems = inventory.filter(i => i.quantity <= i.reorderLevel);
  const pendingShipments = MOCK_SHIPMENTS.filter(s => s.status === 'Pending').length;
  const newLeadsToday = leads.filter(l => l.status === 'New').length;
  const criticalProjects = projects.filter(p => p.progress < 50 && new Date(p.dueDate) < new Date('2024-03-01')); 

  const handleRestock = (id: string, currentQty: number) => {
     // Quick restock action
     updateInventoryStock(id, currentQty + 50);
  };

  const chartData = [
    { day: 'Mon', pos: 4000, web: 2400 },
    { day: 'Tue', pos: 3000, web: 1398 },
    { day: 'Wed', pos: 2000, web: 9800 },
    { day: 'Thu', pos: 2780, web: 3908 },
    { day: 'Fri', pos: 1890, web: 4800 },
    { day: 'Sat', pos: 2390, web: 3800 },
    { day: 'Sun', pos: 3490, web: 4300 },
  ];

  return (
    <div className="h-full overflow-y-auto pr-2 pb-6">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Command Center</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Total Revenue (Today)', value: `$${salesToday.toLocaleString()}`, icon: DollarSign, color: 'indigo' },
          { title: 'Active Projects', value: projects.length, icon: Briefcase, color: 'blue' },
          { title: 'Pending Shipments', value: pendingShipments, icon: Truck, color: 'orange' },
          { title: 'New Leads (Today)', value: newLeadsToday, icon: Users, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
             <div className={`p-3 rounded-full bg-${stat.color}-50 text-${stat.color}-600`}>
               <stat.icon className="w-6 h-6" />
             </div>
             <div>
               <p className="text-sm text-slate-500 font-medium">{stat.title}</p>
               <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sales Graph */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Revenue Trends
            </h3>
            <div className="flex gap-2">
              <span className="text-xs font-medium px-2 py-1 bg-indigo-50 text-indigo-600 rounded">POS</span>
              <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-600 rounded">Web</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip />
                <Line type="monotone" dataKey="pos" stroke="#4f46e5" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="web" stroke="#10b981" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 border-l-4 border-l-red-500">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <AlertTriangle className="w-5 h-5 text-red-500" /> Low Stock Alerts
          </h3>
          <div className="space-y-3">
             {lowStockItems.length > 0 ? (
               lowStockItems.map(item => (
                 <div key={item.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                   <div>
                     <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                     <p className="text-xs text-red-600">Qty: {item.quantity} {item.unit}</p>
                   </div>
                   <button onClick={() => handleRestock(item.id, item.quantity)} className="text-xs bg-white border border-red-200 text-red-600 px-2 py-1 rounded hover:bg-red-100">Restock (+50)</button>
                 </div>
               ))
             ) : (
               <p className="text-sm text-slate-500">Inventory levels are healthy.</p>
             )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Health */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <ClipboardList className="w-5 h-5 text-blue-600" /> Project Health
           </h3>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500">
                 <tr>
                   <th className="px-3 py-2 rounded-l-lg">Project</th>
                   <th className="px-3 py-2">Stage</th>
                   <th className="px-3 py-2">Due</th>
                   <th className="px-3 py-2 rounded-r-lg">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {projects.map(p => (
                   <tr key={p.id}>
                     <td className="px-3 py-3 font-medium text-slate-800">{p.name}</td>
                     <td className="px-3 py-3 text-slate-600">{p.currentStage}</td>
                     <td className="px-3 py-3 text-slate-500">{p.dueDate}</td>
                     <td className="px-3 py-3">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.progress > 50 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                         {p.progress > 50 ? 'On Track' : 'At Risk'}
                       </span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
             <Bell className="w-5 h-5 text-indigo-600" /> Recent Activity
           </h3>
           <div className="space-y-4 max-h-64 overflow-y-auto">
             {activities.map((act) => (
               <div key={act.id} className="flex gap-3">
                 <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                   act.type === 'sale' ? 'bg-green-500' : 
                   act.type === 'alert' ? 'bg-red-500' : 'bg-blue-500'
                 }`}></div>
                 <div>
                   <p className="text-sm text-slate-800">{act.message}</p>
                   <p className="text-xs text-slate-400">{act.timestamp}</p>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};