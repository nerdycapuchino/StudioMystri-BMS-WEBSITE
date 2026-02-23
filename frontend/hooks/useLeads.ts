import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getLeads, getLeadsPipeline, createLead, updateLead, updateLeadStage, deleteLead, convertToProject } from '../services/leads.service';
import type { LeadParams } from '../services/leads.service';

export const useLeads = (params?: LeadParams) =>
    useQuery({ queryKey: ['leads', params], queryFn: () => getLeads(params) });

export const useLeadsPipeline = () =>
    useQuery({ queryKey: ['leads', 'pipeline'], queryFn: getLeadsPipeline });

export const useCreateLead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createLead,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Lead created'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to create lead'),
    });
};

export const useUpdateLead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateLead,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Lead updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useUpdateLeadStage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateLeadStage,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Lead stage updated'); },
    });
};

export const useDeleteLead = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteLead,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['leads'] }); toast.success('Lead deleted'); },
    });
};

export const useConvertLeadToProject = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: convertToProject,
        onSuccess: (project: any) => {
            qc.invalidateQueries({ queryKey: ['leads'] });
            qc.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Converted to Project!');
            return project;
        },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed to convert lead'),
    });
};
