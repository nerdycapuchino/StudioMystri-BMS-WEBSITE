import api from './api';
import type { Product } from '../types';

export interface ProductParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}

export const getProducts = (params?: ProductParams) =>
    api.get('/products', { params }).then(r => r.data);

export const getProduct = (id: string): Promise<Product> =>
    api.get(`/products/${id}`).then(r => ('data' in r.data ? r.data.data : r.data));

export const getProductByBarcode = (code: string): Promise<Product> =>
    api.get(`/products/barcode/${code}`).then(r => ('data' in r.data ? r.data.data : r.data));

export const createProduct = (data: Partial<Product>) =>
    api.post('/products', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateProduct = ({ id, data }: { id: string; data: Partial<Product> }) =>
    api.patch(`/products/${id}`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const deleteProduct = (id: string) =>
    api.delete(`/products/${id}`).then(() => undefined);

export const uploadProductImage = ({ id, file }: { id: string; file: File }) => {
    const fd = new FormData();
    fd.append('image', file);
    return api.post(`/products/${id}/images`, fd).then(r => ('data' in r.data ? r.data.data : r.data));
};
