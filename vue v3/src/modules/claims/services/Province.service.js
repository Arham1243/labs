import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getProvinces = (params) => {
    return AxiosService.get(`${BASE_URL}/provinces`, {
        params: { params }
    });
};

export const searchProvinces = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/provinces/search`, payload, {
        params
    });
};
