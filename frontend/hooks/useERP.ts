import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getERPSuppliers, getPurchaseOrders, createPurchaseOrder, getERPStats } from '../services/erp.service';
import type { ERPParams } from '../services/erp.service';

export const useERPSuppliers = () =>
    useQuery({ queryKey: ['erp', 'suppliers'], queryFn: getERPSuppliers });

export const usePurchaseOrders = (params?: ERPParams) =>
    useQuery({ queryKey: ['erp', 'purchase-orders', params], queryFn: () => getPurchaseOrders(params) });

export const useERPStats = () =>
    useQuery({ queryKey: ['erp', 'stats'], queryFn: getERPStats });

export const useCreatePurchaseOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createPurchaseOrder,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['erp'] });
            qc.invalidateQueries({ queryKey: ['inventory'] });
            toast.success('Purchase order created');
        },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to create purchase order'),
    });
};
