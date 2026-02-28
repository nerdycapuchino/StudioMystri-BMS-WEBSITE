import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer,
    getStats, checkDuplicates, mergeClients,
} from '../services/customers.service';
import type { CustomerParams } from '../services/customers.service';

export const useCustomers = (params?: CustomerParams) =>
    useQuery({ queryKey: ['customers', params], queryFn: () => getCustomers(params) });

export const useCustomer = (id: string | null) =>
    useQuery({ queryKey: ['customers', id], queryFn: () => getCustomer(id!), enabled: !!id });

export const useCustomerStats = () =>
    useQuery({ queryKey: ['customers', 'stats'], queryFn: getStats });

export const useCreateCustomer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createCustomer,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Client created'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to create client'),
    });
};

export const useUpdateCustomer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateCustomer,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Client updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to update client'),
    });
};

export const useDeleteCustomer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteCustomer,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Client deleted'); },
    });
};

export const useCheckDuplicates = () => {
    return useMutation({ mutationFn: checkDuplicates });
};

export const useMergeClients = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ primaryId, mergedClientId }: { primaryId: string; mergedClientId: string }) =>
            mergeClients(primaryId, mergedClientId),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Clients merged'); },
        onError: () => toast.error('Failed to merge clients'),
    });
};
