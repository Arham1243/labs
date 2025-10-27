import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const createCart = (payload) => {
    return AxiosService.post(`${BASE_URL}/carts`, payload);
};

export const getCart = (cartId) => {
    return AxiosService.get(`${BASE_URL}/carts/${cartId}`);
};

export const getOrder = (orderId) => {
    return AxiosService.get(`${BASE_URL}/orders/${orderId}`);
};

export const getCartOverview = (tenantId, cartId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${tenantId}/carts/${cartId}/overview`
    );
};

export const validateEnrollments = (tenantId, cartId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/carts/${cartId}/enrollments/validate`,
        payload
    );
};

export const createEnrollments = (tenantId, cartId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/carts/${cartId}/enrollments`,
        payload
    );
};

export const updateEnrollment = (tenantId, cartId, enrollmentId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/clients/${tenantId}/carts/${cartId}/enrollments/${enrollmentId}`,
        payload
    );
};

export const deleteEnrollments = (tenantId, cartId, enrollmentIds) => {
    return AxiosService.delete(
        `${BASE_URL}/clients/${tenantId}/carts/${cartId}/enrollments/batch`,
        {
            data: {
                resources: enrollmentIds
            }
        }
    );
};

export const deleteEnrollmentByPlan = (tenantId, cartId, planId) => {
    return AxiosService.delete(
        `${BASE_URL}/clients/${tenantId}/carts/${cartId}/enrollments/plan/batch`,
        {
            data: {
                plan_id: planId
            }
        }
    );
};

export const changeEnrollmentsPlan = (
    tenantId,
    cartId,
    newPlan,
    enrollmentIds
) => {
    return AxiosService.patch(
        `${BASE_URL}/clients/${tenantId}/carts/${cartId}/enrollments/plan/batch`,
        {
            plan_id: newPlan,
            enrollments: enrollmentIds
        }
    );
};

export const replaceEnrollmentsPlan = (
    tenantId,
    cartId,
    currentPlan,
    newPlan
) => {
    return AxiosService.patch(
        `${BASE_URL}/clients/${tenantId}/carts/${cartId}/enrollments/plan/replace`,
        {
            current_plan_id: currentPlan,
            new_plan_id: newPlan
        }
    );
};

export const searchEnrollments = (tenantId, cartId, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${tenantId}/carts/${cartId}/enrollments/search`,
        payload,
        {
            params
        }
    );
};

export const searchPolicies = (payload, params) => {
    if (
        payload?.filters?.length > 0 ||
        payload?.sort?.length > 0 ||
        payload?.search?.value
    ) {
        return AxiosService.post(`${BASE_URL}/policies/search`, payload, {
            params
        });
    } else {
        return AxiosService.get(`${BASE_URL}/policies/`, { params });
    }
};

export const getPolicy = (clientId, policyId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${clientId}/policies/${policyId}`
    );
};

export const generatePolicyDocument = (clientId, policyId, documentId) => {
    return AxiosService.get(
        `${BASE_URL}/clients/${clientId}/policies/${policyId}/documents/${documentId}`,
        { responseType: 'blob' }
    );
};

export const generatePolicyZipPackage = async (clientId, policyId, payload) => {
    const res = await AxiosService.post(
        `${BASE_URL}/clients/${clientId}/policies/${policyId}/documents/`,
        payload
    );

    return fetch(res?.data?.data?.url);
};

export const sendDocumentEmail = (clientId, policyId, payload) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${clientId}/policies/${policyId}/documents/mail`,
        payload
    );
};

export const searchEnrollmentTypes = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/applicant-types/search`, payload, {
        params
    });
};
