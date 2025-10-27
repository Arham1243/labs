import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const search = (payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/communication-templates/search`,
        payload,
        {
            params
        }
    );
};

export const getItem = (id) => {
    return AxiosService.get(`${BASE_URL}/communication-templates/${id}`);
};

export const create = (payload) => {
    return AxiosService.post(`${BASE_URL}/communication-templates`, payload);
};

export const getConfigs = () => {
    return AxiosService.get(`${BASE_URL}/communication-templates/config`);
};

export const update = (id, payload) => {
    return AxiosService.put(
        `${BASE_URL}/communication-templates/${id}`,
        payload
    );
};

export const updateStatus = (id, payload) => {
    return AxiosService.put(
        `${BASE_URL}/communication-templates/${id}/change-status`,
        payload
    );
};
