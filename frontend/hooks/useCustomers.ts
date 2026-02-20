import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer } from '../services/customers.service';
import type { CustomerParams } from '../services/customers.service';

export const useCustomers = (params?: CustomerParams) =>
    useQuery({ queryKey: ['customers', params], queryFn: () => getCustomers(params) });

export const useCustomer = (id: string | null) =>
    useQuery({ queryKey: ['customers', id], queryFn: () => getCustomer(id!), enabled: !!id });

export const useCreateCustomer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createCustomer,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer created'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to create customer'),
    });
};

export const useUpdateCustomer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateCustomer,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to update customer'),
    });
};

export const useDeleteCustomer = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteCustomer,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer deleted'); },
    });
};
