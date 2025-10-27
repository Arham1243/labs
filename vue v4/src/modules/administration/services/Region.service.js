import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchItems = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/regions/search`, payload, {
        params
    });
};

export const updateStatus = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/regions/${id}/change-status`,
        payload
    );
};
