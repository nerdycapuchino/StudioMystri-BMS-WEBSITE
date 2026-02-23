import { useQuery } from '@tanstack/react-query';
import { globalSearch } from '../services/search.service';

export const useSearch = (query: string | null, modules?: string) =>
    useQuery({
        queryKey: ['search', query, modules],
        queryFn: () => globalSearch(query!, modules),
        enabled: !!query && query.length >= 2,
    });

