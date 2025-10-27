import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/carts`;

export const getCarts = (params) => {
    return AxiosService.get(`${BASE_URL}/`, {
        params
    });
};

export const searchCarts = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/search`, payload, {
        params
    });
};

export const getCheckout = (cartId) => {
    return AxiosService.get(`${BASE_URL}/${cartId}/checkout`);
};

export const processCheckout = (cartId, payload) => {
    return AxiosService.post(`${BASE_URL}/${cartId}/checkout`, payload);
};
