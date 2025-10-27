import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchItems = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/countries/search`, payload, {
        params
    });
};
export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/countries`, payload);
};

export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/countries/${id}`, payload);
};

export const updateStatus = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/countries/${id}/change-status`,
        payload
    );
};
