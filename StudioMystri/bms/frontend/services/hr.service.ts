import api from './api';

export interface HRParams {
    page?: number;
    limit?: number;
    search?: string;
}

export const getEmployees = (params?: HRParams) =>
    api.get('/hr/employees', { params }).then(r => r.data);

export const getEmployee = (id: string) =>
    api.get(`/hr/employees/${id}`).then(r => ('data' in r.data ? r.data.data : r.data));

export const createEmployee = (data: Record<string, unknown>) =>
    api.post('/hr/employees', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const updateEmployee = ({ id, data }: { id: string; data: Record<string, unknown> }) =>
    api.put(`/hr/employees/${id}`, data).then(r => ('data' in r.data ? r.data.data : r.data));

export const markAttendance = (data: Record<string, unknown>) =>
    api.post('/hr/attendance', data).then(r => ('data' in r.data ? r.data.data : r.data));

export const getAttendance = (params?: { employeeId?: string; month?: number; year?: number }) =>
    api.get('/hr/attendance', { params }).then(r => r.data);

export const getHRSummary = () =>
    api.get('/hr/summary').then(r => ('data' in r.data ? r.data.data : r.data));

export const uploadEmployeeDoc = ({ id, file }: { id: string; file: File }) => {
    const fd = new FormData();
    fd.append('document', file);
    return api.post(`/hr/employees/${id}/documents`, fd).then(r => ('data' in r.data ? r.data.data : r.data));
};
