import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getCampaigns, createCampaign, updateCampaign, getMarketingStats, deleteCampaign } from '../services/marketing.service';
import type { MarketingParams } from '../services/marketing.service';

export const useCampaigns = (params?: MarketingParams) =>
    useQuery({ queryKey: ['campaigns', params], queryFn: () => getCampaigns(params) });

export const useMarketingStats = () =>
    useQuery({ queryKey: ['campaigns', 'stats'], queryFn: getMarketingStats });

export const useCreateCampaign = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createCampaign,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaign created'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useUpdateCampaign = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: updateCampaign,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaign updated'); },
        onError: (e: Error & { response?: { data?: { message?: string } } }) =>
            toast.error(e.response?.data?.message || 'Failed'),
    });
};

export const useDeleteCampaign = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteCampaign,
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['campaigns'] }); toast.success('Campaign deleted'); },
    });
};
