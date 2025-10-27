import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchOrders = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/orders/search`, payload, {
        params
    });
};

export const updateOrder = (payload, params) => {
    return AxiosService.put(
        `${BASE_URL}/clients/${payload.client.id}/orders/${payload.id}/`,
        payload,
        {
            params
        }
    );
};

export const getOverview = (clientId, orderId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${clientId}/orders/${orderId}/overview`
    );
};

export const searchEnrollments = (clientId, orderId, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${clientId}/orders/${orderId}/enrollments/search`,
        payload,
        {
            params
        }
    );
};
