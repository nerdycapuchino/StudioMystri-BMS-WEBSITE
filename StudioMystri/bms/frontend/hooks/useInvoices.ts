import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getInvoices, createInvoice, updateInvoiceStatus, downloadInvoicePDF } from '../services/invoices.service';
import type { InvoiceParams } from '../services/invoices.service';

export const useInvoices = (params?: InvoiceParams) =>
    useQuery({ queryKey: ['invoices', params], queryFn: () => getInvoices(params) });

export const useCreateInvoice = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createInvoice,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice created'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to create invoice'),
    });
};

export const useUpdateInvoiceStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateInvoiceStatus,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['invoices'] }); toast.success('Invoice status updated'); },
    });
};

export const useDownloadInvoicePDF = () =>
    useMutation({
        mutationFn: ({ id, invoiceNumber }: { id: string; invoiceNumber: string }) =>
            downloadInvoicePDF(id, invoiceNumber),
        onSuccess: () => toast.success('PDF downloaded'),
        onError: () => toast.error('Failed to download PDF'),
    });
