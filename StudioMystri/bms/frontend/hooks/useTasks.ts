import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getTasks, getMyTasks, createTask, updateTask, deleteTask } from '../services/tasks.service';
import type { TaskParams } from '../services/tasks.service';

export const useTasks = (params?: TaskParams) =>
    useQuery({ queryKey: ['tasks', params], queryFn: () => getTasks(params) });

export const useMyTasks = () =>
    useQuery({ queryKey: ['tasks', 'my'], queryFn: getMyTasks });

export const useCreateTask = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createTask,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task created'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useUpdateTask = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateTask,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useDeleteTask = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteTask,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks'] }); toast.success('Task deleted'); },
    });
};
