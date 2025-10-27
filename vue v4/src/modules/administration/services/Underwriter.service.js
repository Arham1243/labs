import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchUnderwriters = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/underwriters/search`, payload, {
        params
    });
};

export const createUnderwriter = (payload) => {
    return AxiosService.post(`${BASE_URL}/underwriters`, payload);
};

export const updateUnderwriter = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/underwriters/${id}`, payload);
};

export const updateUnderwriterStatus = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/underwriters/${id}/change-status`,
        payload
    );
};
