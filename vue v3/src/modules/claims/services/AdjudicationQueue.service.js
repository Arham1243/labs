import AxiosService from '@/services/Axios.service';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getAdjudicationQueue = (queueId, params, payload) => {
    if (
        payload?.filters?.length > 0 ||
        payload?.sort?.length > 0 ||
        payload?.search?.value
    ) {
        return AxiosService.post(`${BASE_URL}/queues/search`, payload, {
            params
        });
    } else
        return AxiosService.get(
            `${BASE_URL}/queues${queueId ? '/' + queueId : ''}`,
            { params }
        );
};

export const getAdjudicationQueueSubmissions = (payload) => {
    return AxiosService.get(`${BASE_URL}/queues/submissions`, {
        params: payload
    });
};

export const searchAdjudicationQueueSubmissions = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/queues/submissions/search`, payload, {
        params
    });
};

export const createAdjudicationQueue = (payload) => {
    return AxiosService.post(`${BASE_URL}/queues`, payload);
};

export const updateAdjudicationQueue = (payload, queueId) => {
    return AxiosService.put(`${BASE_URL}/queues/${queueId}`, payload);
};

export const changeStatusAdjudicationQueue = (queueId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/queues/${queueId}/change-status`,
        payload
    );
};

export const deleteAdjudicationQueue = (queueId) => {
    return AxiosService.delete(`${BASE_URL}/queues/${queueId}`);
};

export const getQueueDashboard = (payload) => {
    return AxiosService.get(`${BASE_URL}/queues/dashboard`, {
        params: payload
    });
};

export const changeQueuePriority = (payload) => {
    return AxiosService.patch(`${BASE_URL}/queues/change-priority`, payload);
};
