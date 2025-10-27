import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/contacts/search`, payload, {
        params
    });
};
export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/contacts`, payload);
};
export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/contacts/${id}`, payload);
};
export const deleteItems = (payload) => {
    return AxiosService.delete(`${BASE_URL}/contacts/batch`, { data: payload });
};
