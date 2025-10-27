import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getPermissions = (payload) => {
    return AxiosService.post(`${BASE_URL}/permissions/search`, payload);
};

export const getRolePermissions = (id) => {
    return AxiosService.get(`${BASE_URL}/roles/${id}/permissions`);
};

export const savePermissions = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/roles/${id}/permissions/sync`,
        payload
    );
};
