import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/contact-sources/search`, payload, {
        params
    });
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/contact-sources`, payload);
};

export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/contact-sources/${id}`, payload);
};

export const updateStatus = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/contact-sources/${id}/change-status`,
        payload
    );
};
export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/contact-sources/${id}`);
};
