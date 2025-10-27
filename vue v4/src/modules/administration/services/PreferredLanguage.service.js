import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/languages/search`, payload, {
        params
    });
};

export const updateStatus = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/languages/${id}/change-status`,
        payload
    );
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/languages`, payload);
};

export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/languages/${id}`, payload);
};

export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/languages/${id}`);
};
