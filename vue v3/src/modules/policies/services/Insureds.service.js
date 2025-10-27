import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchInsureds = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/insureds/search`, payload, {
        params
    });
};

export const getInsured = (insuredId) => {
    return AxiosService.get(
        `${BASE_URL}/insureds/${insuredId}?include=policies,policies.nonInsuranceProducts,nonInsuranceProducts,dependents,beneficiaries`
    );
};

export const getInsuredByClient = (tenantId, insuredId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/insureds/${insuredId}?include=policies,policies.nonInsuranceProducts,dependents`
    );
};

export const updateInsured = (tenantId, insuredId, payload, section = null) => {
    const url = `${BASE_URL}/clients/${tenantId}/insureds/${insuredId}`;
    const config = section ? { params: { section } } : undefined;
    return AxiosService.patch(url, payload, config);
};

export const addNonInsuranceProduct = (tenantId, insuredId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/insureds/${insuredId}/non-insurance-products`,
        payload
    );
};

export const addBeneficiary = (tenantId, insuredId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/insureds/${insuredId}/beneficiaries`,
        payload
    );
};

export const updateBeneficiary = (
    tenantId,
    insuredId,
    beneficiaryId,
    payload
) => {
    return AxiosService.patch(
        `${BASE_URL}/clients/${tenantId}/insureds/${insuredId}/beneficiaries/${beneficiaryId}/payment`,
        payload
    );
};

export const addExternalBeneficiary = (tenantId, insuredId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/insureds/${insuredId}/external-beneficiaries`,
        payload
    );
};

export const updateExternalBeneficiary = (
    tenantId,
    insuredId,
    beneficiaryId,
    payload
) => {
    return AxiosService.patch(
        `${BASE_URL}/clients/${tenantId}/insureds/${insuredId}/external-beneficiaries/${beneficiaryId}`,
        payload
    );
};

export const getBeneficiary = (tenantId, insuredId, beneficiaryId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/insureds/${insuredId}/beneficiaries/${beneficiaryId}`
    );
};

export const deleteBeneficiary = (tenantId, insuredId, beneficiaryId) => {
    return AxiosService.delete(
        `${BASE_URL}/clients/${tenantId}/insureds/${insuredId}/beneficiaries/${beneficiaryId}`
    );
};
