import AxiosService from '@/services/Axios.service';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const listAllActivityTemplates = () => {
    return AxiosService.get(`${BASE_URL}/activity-templates`);
};

export const searchActivityTemplates = (payload) => {
    return AxiosService.post(`${BASE_URL}/activity-templates/search`, payload);
};

export const createActivityTemplate = (payload) => {
    return AxiosService.post(`${BASE_URL}/activity-templates`, payload);
};

export const createActivity = (clientId, feedable, payload) => {
    if (feedable === 'communication') {
        return AxiosService.post(
            `${BASE_URL}/clients/${clientId}/communications/${payload.communication_source}`,
            payload
        );
    }

    return AxiosService.post(
        `${BASE_URL}/clients/${clientId}/${feedable}s`,
        payload
    );
};

export const updateActivity = (clientId, feedable, payload, activityId) => {
    if (feedable === 'communication') {
        return AxiosService.put(
            `${BASE_URL}/clients/${clientId}/communications/${payload.communication_source}/${activityId}`,
            payload
        );
    }

    return AxiosService.put(
        `${BASE_URL}/clients/${clientId}/${feedable}s/${activityId}`,
        payload
    );
};

export const deleteActivity = ({ clientId, feedable, activityId, source }) => {
    if (feedable === 'communication') {
        return AxiosService.delete(
            `${BASE_URL}/clients/${clientId}/communications/${source}/${activityId}`
        );
    }
    return AxiosService.delete(
        `${BASE_URL}/clients/${clientId}/${feedable}s/${activityId}`
    );
};
