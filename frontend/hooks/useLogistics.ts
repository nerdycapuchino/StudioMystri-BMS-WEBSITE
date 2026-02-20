import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getShipments, createShipment, updateShipmentStatus, deleteShipment } from '../services/logistics.service';
import type { LogisticsParams } from '../services/logistics.service';

export const useShipments = (params?: LogisticsParams) =>
    useQuery({ queryKey: ['shipments', params], queryFn: () => getShipments(params) });

export const useCreateShipment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createShipment,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment created'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useUpdateShipmentStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateShipmentStatus,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment status updated'); },
    });
};

export const useDeleteShipment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteShipment,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment deleted'); },
    });
};
