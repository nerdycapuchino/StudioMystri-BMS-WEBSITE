import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, recordStockTransaction, getSuppliers } from '../services/inventory.service';
import type { InventoryParams } from '../services/inventory.service';

export const useInventory = (params?: InventoryParams) =>
    useQuery({ queryKey: ['inventory', params], queryFn: () => getInventory(params) });

export const useSuppliers = (search?: string) =>
    useQuery({ queryKey: ['inventory', 'suppliers', search], queryFn: () => getSuppliers({ search }) });

export const useCreateInventoryItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createInventoryItem,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Item added to inventory'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useUpdateInventoryItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateInventoryItem,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Item updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useDeleteInventoryItem = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteInventoryItem,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Item deleted'); },
    });
};

export const useRecordStockTransaction = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: recordStockTransaction,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['inventory'] }); toast.success('Stock transaction recorded'); },
    });
};
