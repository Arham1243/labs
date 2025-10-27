import AxiosService from '@/services/Axios.service';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getAllFeeds = (clientId, payload) => {
    return AxiosService.get(`${BASE_URL}/clients/${clientId}/feeds`, {
        params: payload
    });
};

export const searchFeeds = (clientId, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${clientId}/feeds/search`,
        payload,
        { params }
    );
};

export const updateFeed = (clientId, feedId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/clients/${clientId}/feeds/${feedId}`,
        payload
    );
};
