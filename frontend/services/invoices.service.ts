import api from './api';

export interface InvoiceParams {
    page?: number;
    limit?: number;
    status?: string;
}

export const getInvoices = (params?: InvoiceParams) =>
    api.get('/invoices', { params }).then(r => r.data);

export const createInvoice = (data: Record<string, unknown>) =>
    api.post('/invoices', data).then(r => r.data.data || r.data);

export const updateInvoiceStatus = ({ id, status }: { id: string; status: string }) =>
    api.patch(`/invoices/${id}`, { status }).then(r => r.data.data || r.data);

export const downloadInvoicePDF = async (id: string, invoiceNumber: string) => {
    const response = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoiceNumber}.pdf`;
    a.click();
    window.URL.revokeObjectURL(url);
};
