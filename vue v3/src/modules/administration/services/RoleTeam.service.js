import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchTeams = (id, action, payload, params) => {
    const url =
        action === 'included'
            ? `${BASE_URL}/roles/${id}/teams/search`
            : `${BASE_URL}/roles/${id}/teams/excluded/search`;

    return AxiosService.post(url, payload, { params });
};

export const syncTeams = (id, action, payload) => {
    const url = `${BASE_URL}/roles/${id}/teams/${action}`;
    return action === 'attach'
        ? AxiosService.post(url, payload)
        : AxiosService.delete(url, { data: payload });
};
