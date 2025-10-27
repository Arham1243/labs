import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchNonInsuranceProduct = (payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/non-insurance-products/search`,
        payload,
        {
            params
        }
    );
};

export const getNonInsuranceProduct = (id, params) => {
    return AxiosService.get(`${BASE_URL}/non-insurance-products/${id}`, {
        params
    });
};

export const createNonInsuranceProduct = (payload) => {
    return AxiosService.post(`${BASE_URL}/non-insurance-products`, payload);
};

export const updateNonInsuranceProduct = (id, payload) => {
    return AxiosService.put(
        `${BASE_URL}/non-insurance-products/${id}`,
        payload
    );
};

export const updateNonInsuranceProductStatus = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/non-insurance-products/${id}/change-status`,
        payload
    );
};

export const deleteNonInsuranceProduct = (id) => {
    return AxiosService.delete(`${BASE_URL}/non-insurance-products/${id}`);
};

export const nonInsuranceProductPricesDelete = (id, priceId) => {
    return AxiosService.delete(
        `${BASE_URL}/non-insurance-products/${id}/prices/${priceId}`
    );
};

export const changeNonInsuranceProductStatus = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/non-insurance-products/${id}/change-status`,
        payload
    );
};

export const detachNonInsuranceProductWithPrices = (id, data) => {
    return AxiosService.delete(
        `${BASE_URL}/non-insurance-products/${id}/prices/batch`,
        {
            data
        }
    );
};

export const nonInsuranceProductPricesUpdate = (id, priceId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/non-insurance-products/${id}/prices/${priceId}`,
        payload
    );
};

export const nonInsuranceProductPricesStore = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/non-insurance-products/${id}/prices`,
        payload
    );
};

export const searchNonInsuranceProductPrices = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/non-insurance-products/${id}/prices/search`,
        payload,
        {
            params
        }
    );
};

export const nonInsuranceProductablePricesDelete = (id, priceId) => {
    return AxiosService.delete(
        `${BASE_URL}/non-insurance-productables/${id}/prices/${priceId}`
    );
};

export const detachNonInsuranceProductableWithPrices = (id, data) => {
    return AxiosService.delete(
        `${BASE_URL}/non-insurance-productables/${id}/prices/batch`,
        {
            data
        }
    );
};

export const nonInsuranceProductablePricesUpdate = (id, priceId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/non-insurance-productables/${id}/prices/${priceId}`,
        payload
    );
};

export const nonInsuranceProductablePricesStore = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/non-insurance-productables/${id}/prices`,
        payload
    );
};

export const searchNonInsuranceProductablePrices = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/non-insurance-productables/${id}/prices/search`,
        payload,
        {
            params
        }
    );
};

export const revertToDefaultNonInsuranceProductablePrices = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/non-insurance-productables/${id}/revert-to-default-prices`,
        payload
    );
};
