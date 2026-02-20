import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getProducts, getProduct, getProductByBarcode, createProduct, updateProduct, deleteProduct, uploadProductImage } from '../services/products.service';
import type { ProductParams } from '../services/products.service';

export const useProducts = (params?: ProductParams) =>
    useQuery({ queryKey: ['products', params], queryFn: () => getProducts(params) });

export const useProduct = (id: string | null) =>
    useQuery({ queryKey: ['products', id], queryFn: () => getProduct(id!), enabled: !!id });

export const useProductByBarcode = (code: string | null) =>
    useQuery({ queryKey: ['products', 'barcode', code], queryFn: () => getProductByBarcode(code!), enabled: !!code });

export const useCreateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createProduct,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product created'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to create product'),
    });
};

export const useUpdateProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateProduct,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useDeleteProduct = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product deleted'); },
    });
};

export const useUploadProductImage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: uploadProductImage,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Image uploaded'); },
    });
};
