import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getTeam = (id) => {
    return AxiosService.get(`${BASE_URL}/teams/${id}`);
};

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/teams/search`, payload, {
        params
    });
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/teams`, payload);
};

export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/teams/${id}`, payload);
};

export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/teams/${id}`);
};
