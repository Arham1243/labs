import AxiosService from './Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const saveFilter = (payload) => {
    return AxiosService.post(`${BASE_URL}/filters`, payload);
};

export const updateFilter = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/filters/${id}`, payload);
};

export const getFilters = (payload) => {
    return AxiosService.get(`${BASE_URL}/filters`);
};

export const deleteFilter = (id) => {
    return AxiosService.delete(`${BASE_URL}/filters/${id}`);
};
