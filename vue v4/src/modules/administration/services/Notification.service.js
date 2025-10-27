import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const createToken = (payload) => {
    return AxiosService.post(`${BASE_URL}/device-tokens`, payload);
};

export const getAllNotifications = () => {
    return AxiosService.get(`${BASE_URL}/notifications`);
};

export const readNotification = (id) => {
    return AxiosService.put(`${BASE_URL}/notifications/${id}/read`);
};

export const readAllNotification = (id) => {
    return AxiosService.put(`${BASE_URL}/notifications/read-all`);
};

export const clearAllNotification = (id) => {
    return AxiosService.delete(`${BASE_URL}/notifications/clear-all`);
};

export const deleteNotification = (id) => {
    return AxiosService.delete(`${BASE_URL}/notifications/${id}`);
};
