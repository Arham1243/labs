import AxiosService from '@/services/Axios.service';
import { BASE_URL } from '@/modules/claims/utils';

export const getCurrencies = () => {
    return AxiosService.get(`${BASE_URL}/currencies?limit=500`);
};

export const getCountry = (countryId) => {
    return AxiosService.get(`${BASE_URL}/countries/${countryId}`);
};

export const getProvinces = () => {
    return AxiosService.get(`${BASE_URL}/provinces?limit=500&include=country`);
};

export const getProvince = (provinceId) => {
    return AxiosService.get(`${BASE_URL}/provinces/${provinceId}`);
};

export const getInsured = (tenantId, insuredId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/insureds/${insuredId}?include=policies`
    );
};

export const getPolicy = (tenantId, policyId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/policies/${policyId}?include=benefits.serviceCodes`
    );
};

export const getPolicyBatch = (tenantId, policyBatchId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/policy-batches/${policyBatchId}`
    );
};

export const getBusinessUnit = (businessUnitId) => {
    return AxiosService.get(
        `${BASE_URL}/business-units/${businessUnitId}?include=accountManager,client,billingDetail,country,province`
    );
};

export const getPlans = (plans) => {
    return AxiosService.get(`${BASE_URL}/plans?limit=200`);
};
