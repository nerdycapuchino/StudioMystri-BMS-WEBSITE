import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getEmployees, getEmployee, createEmployee, updateEmployee, markAttendance, getAttendance, getHRSummary } from '../services/hr.service';
import type { HRParams } from '../services/hr.service';

export const useEmployees = (params?: HRParams) =>
    useQuery({ queryKey: ['employees', params], queryFn: () => getEmployees(params) });

export const useEmployee = (id: string | null) =>
    useQuery({ queryKey: ['employees', id], queryFn: () => getEmployee(id!), enabled: !!id });

export const useHRSummary = () =>
    useQuery({ queryKey: ['hr', 'summary'], queryFn: getHRSummary });

export const useAttendance = (params?: { employeeId?: string; month?: number; year?: number }) =>
    useQuery({ queryKey: ['hr', 'attendance', params], queryFn: () => getAttendance(params) });

export const useCreateEmployee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createEmployee,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee onboarded'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useUpdateEmployee = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateEmployee,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); toast.success('Employee updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useMarkAttendance = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: markAttendance,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['hr'] }); qc.invalidateQueries({ queryKey: ['employees'] }); toast.success('Attendance marked'); },
    });
};
