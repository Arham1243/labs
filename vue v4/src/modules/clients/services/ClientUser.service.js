import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;
const BASE_AUTH_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export const getUser = (id, params) => {
    return AxiosService.get(`${BASE_URL}/client-users/${id}`, { params });
};
export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/client-users/search`, payload, {
        params
    });
};
export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/client-users`, payload);
};
export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/client-users/${id}`, payload);
};
export const cancelWorkflow = (id) => {
    return AxiosService.delete(
        `${BASE_URL}/client-users/${id}/cancel-workflow`
    );
};
export const resendActivation = (email) => {
    return AxiosService.post(`${BASE_AUTH_URL}/resend-activation-email`, {
        email: email
    });
};
export const updateStatus = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/client-users/${id}/change-status`,
        payload
    );
};
export const saveDecision = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/client-users/${id}/change-status`,
        payload
    );
};
export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/client-users/${id}`);
};
export const deleteItems = (payload) => {
    return AxiosService.delete(`${BASE_URL}/client-users/batch`, {
        data: payload
    });
};
