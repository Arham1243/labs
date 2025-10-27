import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getSettings = () => {
    return AxiosService.get(`${BASE_URL}/settings`);
};

export const updateSettings = (payload) => {
    return AxiosService.put(`${BASE_URL}/settings`, payload);
};
