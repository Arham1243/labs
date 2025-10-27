import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;
const BASE_AUTH_URL = `${import.meta.env.VITE_API_BASE_URL}/api/auth`;

export const getUser = (id) => {
    return AxiosService.get(`${BASE_URL}/company-users/${id}`);
};

export const search = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/company-users/search`, payload, {
        params
    });
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/company-users`, payload);
};
export const update = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/company-users/${id}`, payload);
};
export const updateStatus = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/company-users/${id}/change-status`,
        payload
    );
};
export const deleteItem = (id) => {
    return AxiosService.delete(`${BASE_URL}/company-users/${id}`);
};
export const resendActivation = (email) => {
    return AxiosService.post(`${BASE_AUTH_URL}/resend-activation-email`, {
        email: email
    });
};
