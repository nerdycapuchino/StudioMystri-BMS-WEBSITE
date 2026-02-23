import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '../services/socket';

/**
 * Global socket event listeners for real-time cache sync.
 * Attach once at the top level (e.g. App.tsx) after authentication.
 * Components should NOT set up their own socket listeners for these events —
 * they simply consume React Query data which this hook keeps fresh.
 */
export const useAppSocketEvents = (isAuthenticated: boolean) => {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isAuthenticated) return;

        let socket: ReturnType<typeof getSocket>;
        try {
            socket = getSocket();
        } catch {
            return; // Socket not available — skip listeners
        }
        if (!socket) return;

        // ── Orders / POS ──

        const onOrderCreated = (payload: any) => {
            // Prepend new order to any cached order list
            queryClient.setQueryData(['orders'], (old: any) => {
                if (!old?.data) return old;
                return { ...old, data: [payload, ...old.data] };
            });
            // Also invalidate to guarantee consistency
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        };

        const onOrderUpdated = (payload: any) => {
            queryClient.setQueryData(['orders'], (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((o: any) =>
                        o.id === payload.id ? { ...o, status: payload.status } : o
                    ),
                };
            });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        };

        // ── Inventory ──

        const onInventoryUpdated = (payload: any[]) => {
            if (!Array.isArray(payload)) return;
            queryClient.setQueryData(['inventory'], (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((item: any) => {
                        const update = payload.find(
                            (u: any) => u.itemId === item.id || u.productId === item.id
                        );
                        if (!update) return item;
                        return {
                            ...item,
                            ...(update.newQuantity !== undefined ? { quantity: update.newQuantity } : {}),
                            ...(update.isLowStock !== undefined ? { isLowStock: update.isLowStock } : {}),
                        };
                    }),
                };
            });
            // Also refresh products (POS uses products not inventory)
            queryClient.invalidateQueries({ queryKey: ['products'] });
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        };

        const onInventoryTransactionCreated = (_payload: any) => {
            queryClient.invalidateQueries({ queryKey: ['inventory'] });
        };

        // ── ERP ──

        const onERPPurchaseOrderCreated = (payload: any) => {
            queryClient.setQueryData(['erp', 'purchase-orders'], (old: any) => {
                if (!old?.data) return old;
                return { ...old, data: [payload, ...old.data] };
            });
            queryClient.invalidateQueries({ queryKey: ['erp', 'purchase-orders'] });
        };

        const onERPStatsUpdated = () => {
            queryClient.invalidateQueries({ queryKey: ['erp', 'stats'] });
        };

        // ── Admin / Settings / Integrations ──

        const onSettingsUpdated = (payload: any) => {
            queryClient.setQueryData(['admin', 'settings'], (old: any) => ({
                ...(old || {}),
                ...payload,
            }));
            queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
        };

        // ── Attach Listeners ──
        socket.on('order:created', onOrderCreated);
        socket.on('order:updated', onOrderUpdated);
        socket.on('inventory:updated', onInventoryUpdated);
        socket.on('inventory:transaction:created', onInventoryTransactionCreated);
        socket.on('erp:purchase-order:created', onERPPurchaseOrderCreated);
        socket.on('erp:stats:updated', onERPStatsUpdated);
        socket.on('settings:updated', onSettingsUpdated);

        // ── Cleanup ──
        return () => {
            socket.off('order:created', onOrderCreated);
            socket.off('order:updated', onOrderUpdated);
            socket.off('inventory:updated', onInventoryUpdated);
            socket.off('inventory:transaction:created', onInventoryTransactionCreated);
            socket.off('erp:purchase-order:created', onERPPurchaseOrderCreated);
            socket.off('erp:stats:updated', onERPStatsUpdated);
            socket.off('settings:updated', onSettingsUpdated);
        };
    }, [isAuthenticated, queryClient]);
};
