import AxiosService from '@/services/Axios.service';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getInsured = (id, params) => {
    return AxiosService.get(`${BASE_URL}/insureds/${id}`, { params });
};

export const getInsuredById = (clientId, insuredId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${clientId}/insureds/${insuredId}?include=policies`
    );
};

export const searchInsured = (value) => {
    return AxiosService.post(
        `${BASE_URL}/insureds/search?include=policies&limit=100`,
        {
            search: { value }
        }
    );
};

export const getBusinessUnit = (businessUnitId) => {
    return AxiosService.get(
        `${BASE_URL}/business-units/${businessUnitId}?include=accountManager,client,billingDetail,billingDetail.country`
    );
};
