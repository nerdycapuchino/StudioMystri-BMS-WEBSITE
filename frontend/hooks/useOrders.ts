import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getOrders, createOrder, updateOrderStatus } from '../services/orders.service';
import type { OrderParams } from '../services/orders.service';

export const useOrders = (params?: OrderParams) =>
    useQuery({ queryKey: ['orders', params], queryFn: () => getOrders(params) });

export const useCreateOrder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createOrder,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['orders'] });
            qc.invalidateQueries({ queryKey: ['products'] });
            qc.invalidateQueries({ queryKey: ['dashboard'] });
            toast.success('Order placed successfully');
        },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to place order'),
    });
};

export const useUpdateOrderStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateOrderStatus,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['orders'] }); toast.success('Order cancelled'); },
    });
};
