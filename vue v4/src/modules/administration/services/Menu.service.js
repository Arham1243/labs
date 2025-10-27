import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;
import icons from '@/modules/administration/mock/icons.json';

export const getMenus = () => {
    return AxiosService.get(`${BASE_URL}/menu-items`);
};
export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/menu-items/search`, payload, {
        params
    });
};

export const getIcons = () => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(icons), 0);
    });
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/menu-items`, payload);
};

export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/menu-items/${id}`, payload);
};

export const updateStatus = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/menu-items/${id}/change-status`,
        payload
    );
};
export const updateOrder = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/menu-items/${id}/change-order`,
        payload
    );
};

export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/menu-items/${id}`);
};
