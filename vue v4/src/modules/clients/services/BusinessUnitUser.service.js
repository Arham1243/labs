import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getUser = (id, params) => {
    return AxiosService.get(`${BASE_URL}/business-unit-users/${id}`, {
        params
    });
};
export const search = (payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/business-unit-users/search`,
        payload,
        {
            params
        }
    );
};
export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/business-unit-users`, payload);
};
export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/business-unit-users/${id}`, payload);
};
export const updateStatus = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/business-unit-users/${id}/change-status`,
        payload
    );
};
export const saveDecision = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/business-unit-users/${id}/change-status`,
        payload
    );
};
export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/business-unit-users/${id}`);
};
export const deleteItems = (payload) => {
    return AxiosService.delete(`${BASE_URL}/business-unit-users/batch`, {
        data: payload
    });
};
