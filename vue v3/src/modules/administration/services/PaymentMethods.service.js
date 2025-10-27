import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/payment-methods/search`, payload, {
        params
    });
};

export const list = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/payment-methods/list`, payload, {
        params
    });
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/payment-methods`, payload);
};

export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/payment-methods/${id}`, payload);
};

export const updateStatus = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/payment-methods/${id}/change-status`,
        payload
    );
};

export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/payment-methods/${id}`);
};
