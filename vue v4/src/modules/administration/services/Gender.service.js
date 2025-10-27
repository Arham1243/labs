import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/genders/search`, payload, {
        params
    });
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/genders`, payload);
};

export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/genders/${id}`, payload);
};

export const updateStatus = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/genders/${id}/change-status`,
        payload
    );
};
export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/genders/${id}`);
};
