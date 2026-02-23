import React, { useState } from 'react';
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import { TableSkeleton, InlineError } from './ui/Skeleton';
import { Search, Filter, ArrowUpRight, Clock, CheckCircle2, XCircle, MoreVertical, CreditCard, Banknote, Landmark } from 'lucide-react';
import toast from 'react-hot-toast';

export const Orders: React.FC = () => {
    const { data: orderData, isLoading, isError, error, refetch } = useOrders();
    const updateStatus = useUpdateOrderStatus();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    const orders = Array.isArray(orderData?.data || orderData) ? (orderData?.data || orderData) as any[] : [];

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);

    const filteredOrders = orders.filter(o => {
        const matchesSearch =
            (o.orderNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (o.customerName || o.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || o.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyles = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'PAID':
            case 'COMPLETED':
                return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800';
            case 'PENDING':
                return 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800';
            case 'CANCELLED':
            case 'VOID':
                return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
            default:
                return 'bg-slate-50 text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        }
    };

    const getPaymentIcon = (method: string) => {
        switch (method?.toUpperCase()) {
            case 'CARD': return <CreditCard className="w-3.5 h-3.5" />;
            case 'CASH': return <Banknote className="w-3.5 h-3.5" />;
            case 'TRANSFER': return <Landmark className="w-3.5 h-3.5" />;
            default: return <CreditCard className="w-3.5 h-3.5" />;
        }
    };

    if (isLoading) return <div className="h-full p-6"><TableSkeleton /></div>;
    if (isError) return <div className="h-full p-6"><InlineError message={(error as any)?.message} onRetry={() => refetch()} /></div>;

    const totalSales = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const completedCount = orders.filter(o => o.status === 'Paid' || o.status === 'Completed').length;

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display overflow-hidden">
            {/* Header */}
            <div className="px-6 py-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            Order History & Sales
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Review and manage point-of-sale transactions and customer invoices.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search orders, customers..."
                                className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-full md:w-64 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                            />
                        </div>
                        <button className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Filter className="w-4 h-4 text-slate-500" />
                        </button>
                        <button onClick={() => toast.success("Exporting data...")} className="bg-primary hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2">
                            <ArrowUpRight className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>

                {/* KPI Cards Mini */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Total Sales (All Time)</p>
                        <h3 className="text-xl font-bold mt-1">{formatCurrency(totalSales)}</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Completed Orders</p>
                        <h3 className="text-xl font-bold mt-1">{completedCount}</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Avg Order Value</p>
                        <h3 className="text-xl font-bold mt-1">{formatCurrency(orders.length > 0 ? totalSales / orders.length : 0)}</h3>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Pending Processing</p>
                        <h3 className="text-xl font-bold mt-1 text-amber-500">{orders.filter(o => o.status === 'Pending').length}</h3>
                    </div>
                </div>
            </div>

            {/* Main Content: Table */}
            <div className="flex-1 overflow-hidden flex flex-col p-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden">
                    {/* Status Tabs */}
                    <div className="border-b border-slate-100 dark:border-slate-800 px-4 flex items-center shrink-0">
                        {['All', 'Paid', 'Pending', 'Cancelled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${filterStatus === status ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead className="sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-slate-800">
                                <tr className="text-slate-500 font-medium">
                                    <th className="px-6 py-4">Order ID</th>
                                    <th className="px-6 py-4">Customer</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Payment</th>
                                    <th className="px-6 py-4">Total</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900 dark:text-white">
                                            {order.orderNumber || `#${order.id.slice(-6).toUpperCase()}`}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-slate-900 dark:text-white">
                                                {typeof order.customerName === 'string' ? order.customerName : (order.customer?.name || 'Walk-in Customer')}
                                            </div>
                                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{order.customer?.email || 'No contact info'}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                            {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                                                {getPaymentIcon(order.paymentMethod || 'Card')}
                                                <span className="text-xs uppercase font-medium">{order.paymentMethod || 'Card'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tight border ${getStatusStyles(order.status)}`}>
                                                {order.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : order.status === 'Pending' ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                {order.status || 'Paid'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors" title="Manage Order">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-400">
                                                <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                                                    <Search className="w-6 h-6 opacity-20" />
                                                </div>
                                                <p className="text-sm font-medium">No orders found</p>
                                                <p className="text-xs mt-1">Try adjusting your search or filters.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Placeholder */}
                    <div className="border-t border-slate-100 dark:border-slate-800 p-4 flex justify-between items-center shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                        <span className="text-[11px] text-slate-500">Showing {filteredOrders.length} of {orders.length} orders</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-50">Prev</button>
                            <button className="px-3 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-md disabled:opacity-50">Next</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
