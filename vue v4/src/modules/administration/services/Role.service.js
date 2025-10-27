import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getRole = (id) => {
    return AxiosService.get(`${BASE_URL}/roles/${id}`);
};

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/roles/search`, payload, {
        params
    });
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/roles`, payload);
};

export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/roles/${id}`, payload);
};

export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/roles/${id}`);
};
