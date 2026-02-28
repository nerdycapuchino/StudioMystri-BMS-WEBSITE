import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getUsers, createUser, updateUser, deactivateUser, getCompanySettings, updateCompanySettings, uploadCompanyLogo, generateResetLink } from '../services/admin.service';

export const useUsers = (params?: { page?: number; limit?: number }) =>
    useQuery({ queryKey: ['admin', 'users', params], queryFn: () => getUsers(params) });

export const useCompanySettings = () =>
    useQuery({ queryKey: ['admin', 'settings'], queryFn: getCompanySettings });

export const useCreateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createUser,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User created'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useUpdateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateUser,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useDeactivateUser = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deactivateUser,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('User deactivated'); },
    });
};

export const useGenerateResetLink = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: generateResetLink,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'users'] }); toast.success('Reset link generated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to generate link'),
    });
};

export const useUpdateCompanySettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateCompanySettings,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'settings'] }); toast.success('Settings saved'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to save settings'),
    });
};

export const useUploadCompanyLogo = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: uploadCompanyLogo,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin', 'settings'] }); toast.success('Logo uploaded'); },
    });
};
