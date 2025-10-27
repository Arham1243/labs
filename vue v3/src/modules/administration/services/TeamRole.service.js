import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchRoles = (id, action, payload, params) => {
    const url =
        action === 'included'
            ? `${BASE_URL}/teams/${id}/roles/search`
            : `${BASE_URL}/teams/${id}/roles/excluded/search`;

    return AxiosService.post(url, payload, { params });
};

export const syncRoles = (id, action, payload) => {
    const url = `${BASE_URL}/teams/${id}/roles/${action}`;
    return action === 'attach'
        ? AxiosService.post(url, payload)
        : AxiosService.delete(url, { data: payload });
};
