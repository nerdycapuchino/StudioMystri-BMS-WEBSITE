import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getProjects, getProject, createProject, updateProject, updateProjectStage, addProjectPayment, deleteProject, getProjectStats } from '../services/projects.service';
import type { ProjectParams } from '../services/projects.service';

export const useProjects = (params?: ProjectParams) =>
    useQuery({ queryKey: ['projects', params], queryFn: () => getProjects(params) });

export const useProject = (id: string | null) =>
    useQuery({ queryKey: ['projects', id], queryFn: () => getProject(id!), enabled: !!id });

export const useProjectStats = () =>
    useQuery({ queryKey: ['projects', 'stats'], queryFn: getProjectStats });

export const useCreateProject = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createProject,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project created'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useUpdateProject = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateProject,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useUpdateProjectStage = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateProjectStage,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project stage updated'); },
    });
};

export const useAddProjectPayment = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: addProjectPayment,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Payment recorded'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useDeleteProject = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteProject,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['projects'] }); toast.success('Project deleted'); },
    });
};
