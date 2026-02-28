import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../hooks/useCustomers';
import { Customer, PrimarySource } from '../types';
import toast from 'react-hot-toast';

/* ─── HELPERS ─────────────────────────────────────────────── */
const formatINR = (n?: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

const SOURCE_COLORS: Record<string, { bg: string; text: string }> = {
    POS: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
    ECOMMERCE: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
    BMS_MANUAL: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300' },
    API: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
    IMPORT: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
};

const TIER_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
    PLATINUM: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300', icon: '💎' },
    GOLD: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', icon: '🥇' },
    SILVER: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', icon: '🥈' },
};

const SourceBadge: React.FC<{ source?: PrimarySource }> = ({ source }) => {
    const s = SOURCE_COLORS[source || 'BMS_MANUAL'] || SOURCE_COLORS.BMS_MANUAL;
    const label = source === 'BMS_MANUAL' ? 'Manual' : source === 'ECOMMERCE' ? 'Ecommerce' : source || 'Manual';
    return <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold ${s.bg} ${s.text}`}>{label}</span>;
};

const TierBadge: React.FC<{ tier?: string }> = ({ tier }) => {
    if (!tier) return null;
    const t = TIER_COLORS[tier] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300', icon: '•' };
    return <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold ${t.bg} ${t.text}`}>{t.icon} {tier}</span>;
};

const getHealth = (c: Customer) => {
    const ltv = c.totalSpent || c.totalSpend || 0;
    const outstanding = c.outstandingBalance || 0;
    if (outstanding > ltv * 0.5) return { color: 'text-rose-500', icon: 'warning', label: 'At Risk' };
    if (ltv > 50000) return { color: 'text-green-500', icon: 'check_circle', label: 'Healthy' };
    return { color: 'text-amber-500', icon: 'info', label: 'Moderate' };
};

/* ─── TABS ────────────────────────────────────────────────── */
type TabKey = 'overview' | 'financials' | 'projects' | 'channel' | 'activity' | 'documents';

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: 'person' },
    { key: 'financials', label: 'Financials', icon: 'payments' },
    { key: 'projects', label: 'Projects', icon: 'construction' },
    { key: 'channel', label: 'Channel History', icon: 'call_split' },
    { key: 'activity', label: 'Activity', icon: 'history' },
    { key: 'documents', label: 'Documents', icon: 'description' },
];

/* ─── MAIN COMPONENT ──────────────────────────────────────── */
export const ClientDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: client, isLoading, isError } = useCustomer(id || null);
    const [activeTab, setActiveTab] = useState<TabKey>('overview');

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <span className="material-symbols-outlined animate-spin text-4xl text-primary">progress_activity</span>
                    <p className="mt-3 text-slate-500 dark:text-slate-400">Loading client details...</p>
                </div>
            </div>
        );
    }

    if (isError || !client) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    <span className="material-symbols-outlined text-4xl text-rose-500">error</span>
                    <p className="mt-3 text-rose-500 font-medium">Client not found</p>
                    <button onClick={() => navigate('/clients')} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">
                        ← Back to Client Directory
                    </button>
                </div>
            </div>
        );
    }

    const health = getHealth(client);

    return (
        <div className="flex-1 flex flex-col h-full bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 overflow-hidden">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-7xl mx-auto p-6 space-y-6">

                    {/* ── BACK BUTTON ── */}
                    <button onClick={() => navigate('/clients')} className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors group">
                        <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">arrow_back</span>
                        Client Directory
                    </button>

                    {/* ── SNAPSHOT HEADER ── */}
                    <div className="flex flex-wrap items-start gap-6 bg-white dark:bg-[#1a2632] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
                        {/* Avatar */}
                        <div className="size-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 flex items-center justify-center text-primary font-bold text-xl font-display shrink-0">
                            {client.name.substring(0, 2).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-2xl font-display font-semibold text-slate-900 dark:text-white truncate">{client.name}</h1>
                                <TierBadge tier={client.tier} />
                                <SourceBadge source={client.primarySource} />
                                <span className={`inline-flex items-center gap-1 text-xs font-medium ${health.color}`}>
                                    <span className="material-symbols-outlined text-[14px]">{health.icon}</span>
                                    {health.label}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                {client.clientCode && <span className="font-mono">{client.clientCode}</span>}
                                {client.contactName && <span>• {client.contactName}</span>}
                                {client.email && <span>• {client.email}</span>}
                                {client.phone && <span>• {client.phone}</span>}
                            </div>
                        </div>

                        {/* KPI Strip */}
                        <div className="flex gap-6">
                            {[
                                { label: 'Revenue', value: formatINR(client.totalSpent || client.totalSpend), icon: 'trending_up', color: 'text-emerald-500' },
                                { label: 'Outstanding', value: formatINR(client.outstandingBalance), icon: 'account_balance', color: (client.outstandingBalance || 0) > 0 ? 'text-rose-500' : 'text-slate-400' },
                                { label: 'Orders', value: client.totalOrders || 0, icon: 'shopping_bag', color: 'text-blue-500' },
                            ].map(k => (
                                <div key={k.label} className="text-center">
                                    <span className={`material-symbols-outlined text-[20px] ${k.color}`}>{k.icon}</span>
                                    <p className="text-lg font-display font-bold text-slate-900 dark:text-white mt-0.5">{k.value}</p>
                                    <p className="text-[11px] text-slate-500 uppercase tracking-wider">{k.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex gap-2 shrink-0">
                            {[
                                { label: 'Invoice', icon: 'receipt_long', onClick: () => toast('Create Invoice — coming soon') },
                                { label: 'Project', icon: 'construction', onClick: () => toast('Create Project — coming soon') },
                                { label: 'Contract', icon: 'send', onClick: () => toast('Send Contract — coming soon') },
                            ].map(a => (
                                <button key={a.label} onClick={a.onClick} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition-colors">
                                    <span className="material-symbols-outlined text-[16px]">{a.icon}</span>
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* ── TABS ── */}
                    <div className="flex gap-1 bg-white dark:bg-[#1a2632] rounded-xl border border-slate-200 dark:border-slate-700 p-1 shadow-sm overflow-x-auto">
                        {TABS.map(t => (
                            <button key={t.key} onClick={() => setActiveTab(t.key)}
                                className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === t.key
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                    }`}>
                                <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
                                {t.label}
                            </button>
                        ))}
                    </div>

                    {/* ── TAB CONTENT ── */}
                    <div className="bg-white dark:bg-[#1a2632] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm min-h-[300px]">
                        {activeTab === 'overview' && <OverviewTab client={client} />}
                        {activeTab === 'financials' && <FinancialsTab client={client} />}
                        {activeTab === 'projects' && <PlaceholderTab icon="construction" label="Projects" description="Linked projects will appear here" />}
                        {activeTab === 'channel' && <PlaceholderTab icon="call_split" label="Channel History" description="Attribution timeline will appear here" />}
                        {activeTab === 'activity' && <PlaceholderTab icon="history" label="Activity Timeline" description="Create, update, merge, and delete events will appear here" />}
                        {activeTab === 'documents' && <PlaceholderTab icon="description" label="Documents" description="Linked contracts and files will appear here" />}
                    </div>

                </div>
            </div>
        </div>
    );
};

/* ── OVERVIEW TAB ────────────────────────────────────────── */
const OverviewTab: React.FC<{ client: Customer }> = ({ client }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">badge</span> Identity
            </h3>
            <InfoRow label="Company" value={client.name} />
            <InfoRow label="Contact" value={client.contactName} />
            <InfoRow label="Email" value={client.email} />
            <InfoRow label="Phone" value={client.phone} />
            <InfoRow label="GST Number" value={client.gstNumber} />
            <InfoRow label="Client Code" value={client.clientCode} />
        </div>
        <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">location_on</span> Address & Notes
            </h3>
            <InfoRow label="Billing Address" value={client.address} />
            <InfoRow label="Shipping Address" value={client.shippingAddress} />
            <InfoRow label="Payment Terms" value={client.paymentTerms} />
            <InfoRow label="Credit Limit" value={client.creditLimit ? formatINR(client.creditLimit) : undefined} />
            <InfoRow label="Notes" value={client.notes} />
        </div>
        <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">call_split</span> Attribution
            </h3>
            <InfoRow label="Primary Source" value={client.primarySource} />
            <InfoRow label="First Touch" value={client.firstTouchSource} />
            <InfoRow label="Last Touch" value={client.lastTouchSource} />
            <InfoRow label="Conversion" value={client.conversionSource} />
            <InfoRow label="From Lead" value={client.createdFromLeadId ? `Lead ID: ${client.createdFromLeadId.substring(0, 8)}...` : undefined} />
        </div>
        <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">info</span> Metadata
            </h3>
            <InfoRow label="Status" value={client.status} />
            <InfoRow label="Tier" value={client.tier} />
            <InfoRow label="Created" value={client.createdAt ? new Date(client.createdAt).toLocaleDateString('en-IN') : undefined} />
            <InfoRow label="Updated" value={client.updatedAt ? new Date(client.updatedAt).toLocaleDateString('en-IN') : undefined} />
        </div>
    </div>
);

/* ── FINANCIALS TAB ──────────────────────────────────────── */
const FinancialsTab: React.FC<{ client: Customer }> = ({ client }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
            { label: 'Lifetime Value', value: formatINR(client.totalSpent || client.totalSpend), icon: 'trending_up', color: 'text-emerald-500' },
            { label: 'Outstanding Balance', value: formatINR(client.outstandingBalance), icon: 'account_balance', color: 'text-rose-500' },
            { label: 'Total Orders', value: client.totalOrders || 0, icon: 'shopping_bag', color: 'text-blue-500' },
            { label: 'Payment Terms', value: client.paymentTerms || '—', icon: 'schedule', color: 'text-amber-500' },
            { label: 'Credit Limit', value: client.creditLimit ? formatINR(client.creditLimit) : 'Not set', icon: 'credit_card', color: 'text-indigo-500' },
            { label: 'Primary Channel', value: client.primarySource || 'Manual', icon: 'call_split', color: 'text-purple-500' },
        ].map(card => (
            <div key={card.label} className="flex items-center gap-4 p-5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <div className={`size-11 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center ${card.color} shadow-sm`}>
                    <span className="material-symbols-outlined text-[22px]">{card.icon}</span>
                </div>
                <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider font-medium">{card.label}</p>
                    <p className="text-lg font-display font-bold text-slate-900 dark:text-white">{card.value}</p>
                </div>
            </div>
        ))}
    </div>
);

/* ── PLACEHOLDER TAB ─────────────────────────────────────── */
const PlaceholderTab: React.FC<{ icon: string; label: string; description: string }> = ({ icon, label, description }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <span className="material-symbols-outlined text-5xl mb-3">{icon}</span>
        <p className="font-medium text-slate-600 dark:text-slate-300">{label}</p>
        <p className="text-sm mt-1">{description}</p>
    </div>
);

/* ── INFO ROW ────────────────────────────────────────────── */
const InfoRow: React.FC<{ label: string; value?: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-start">
        <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white text-right max-w-[60%] break-words">{value || '—'}</span>
    </div>
);
