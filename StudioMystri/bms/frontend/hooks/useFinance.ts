import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getFinanceSummary, getCashflow } from '../services/finance.service';
import type { FinanceParams } from '../services/finance.service';

export const useTransactions = (params?: FinanceParams) =>
    useQuery({ queryKey: ['finance', params], queryFn: () => getTransactions(params) });

export const useFinanceSummary = (period?: string) =>
    useQuery({ queryKey: ['finance', 'summary', period], queryFn: () => getFinanceSummary(period) });

export const useCashflow = () =>
    useQuery({ queryKey: ['finance', 'cashflow'], queryFn: getCashflow });

export const useCreateTransaction = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createTransaction,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance'] }); toast.success('Transaction recorded'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useUpdateTransaction = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateTransaction,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance'] }); toast.success('Transaction updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useDeleteTransaction = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteTransaction,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['finance'] }); toast.success('Transaction deleted'); },
    });
};
