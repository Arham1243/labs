import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchUsers = (id, action, payload, params) => {
    const url =
        action === 'included'
            ? `${BASE_URL}/roles/${id}/company-users/search`
            : `${BASE_URL}/roles/${id}/company-users/excluded/search`;

    return AxiosService.post(url, payload, { params });
};

export const syncUsers = (id, action, payload) => {
    const url = `${BASE_URL}/roles/${id}/company-users/${action}`;
    return action === 'attach'
        ? AxiosService.post(url, payload)
        : AxiosService.delete(url, { data: payload });
};
