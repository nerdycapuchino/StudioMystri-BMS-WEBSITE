import api from './api';

export const globalSearch = (q: string, modules?: string) =>
    api.get('/search', { params: { q, modules } }).then(r => ('data' in r.data ? r.data.data : r.data));
