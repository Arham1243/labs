import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getApps = () => {
    return AxiosService.get(`${BASE_URL}/apps`);
};

export const activateApp = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/apps/${id}/activate`, payload);
};

export const configureApp = (id, payload) => {
    return AxiosService.post(`${BASE_URL}/apps/${id}/configure`, payload);
};

export const deactivateApp = (id) => {
    return AxiosService.put(`${BASE_URL}/apps/${id}/deactivate`);
};
