import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const searchPlans = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/plans/search`, payload, {
        params
    });
};

export const searchPlanByBusinessUnitUuids = (payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/business-units/plans/search`,
        payload,
        {
            params
        }
    );
};

export const getPlan = (id, params) => {
    return AxiosService.get(`${BASE_URL}/plans/${id}`, { params });
};

export const createPlan = (payload) => {
    return AxiosService.post(`${BASE_URL}/plans`, payload);
};

export const updatePlan = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/plans/${id}`, payload);
};

export const updatePlanStatus = (id, payload) => {
    return AxiosService.patch(`${BASE_URL}/plans/${id}/change-status`, payload);
};

export const deletePlan = (id) => {
    return AxiosService.delete(`${BASE_URL}/plans/${id}`);
};

export const searchBenefits = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/plans/${id}/benefits/excluded/search`,
        payload,
        {
            params
        }
    );
};

export const searchBenefitGroups = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/plans/${id}/benefit-groups/excluded/search`,
        payload,
        {
            params
        }
    );
};

export const attachBenefits = (id, resources) => {
    return AxiosService.post(`${BASE_URL}/plans/${id}/benefits/attach`, {
        resources
    });
};

export const attachBenefitGroups = (id, resources) => {
    return AxiosService.post(`${BASE_URL}/plans/${id}/benefit-groups/attach`, {
        resources
    });
};

export const getBenefitGroups = (id) => {
    return AxiosService.get(`${BASE_URL}/plans/${id}/benefit-groups`);
};

export const getDuplicatedBenefits = (id) => {
    return AxiosService.get(`${BASE_URL}/plans/${id}/benefits/duplicates/list`);
};

export const getPlanBenefits = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/plans/${id}/benefits/search`,
        payload,
        {
            params
        }
    );
};

export const searchBenefitGroupsBenefits = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-group-plans/${id}/benefits/search`,
        payload,
        {
            params
        }
    );
};

export const searchBenefitGroupsBenefitsExcluded = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-group-plans/${id}/benefits/excluded/search`,
        payload,
        {
            params
        }
    );
};

export const deleteBenefitGroups = (id, resources) => {
    return AxiosService.delete(
        `${BASE_URL}/plans/${id}/benefit-groups/detach`,
        { data: resources }
    );
};

export const purgeBenefits = (id) => {
    return AxiosService.delete(`${BASE_URL}/plans/${id}/benefits/purge/all`);
};

export const purgeIndividualBenefits = (id) => {
    return AxiosService.delete(
        `${BASE_URL}/plans/${id}/benefits/purge/individual`
    );
};

export const deleteBenefits = (id, resources) => {
    return AxiosService.delete(`${BASE_URL}/plans/${id}/benefits/detach`, {
        data: resources
    });
};

export const updateBenefitGroups = (id, groupId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/plans/${id}/benefit-groups/${groupId}/pivot`,
        payload
    );
};

export const excludeBenefitGroupBenefits = (id, data) => {
    return AxiosService.delete(
        `${BASE_URL}/benefit-group-plans/${id}/benefits/detach`,
        {
            data
        }
    );
};

export const includeBenefitGroupBenefits = (id, data) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-group-plans/${id}/benefits/attach`,
        data
    );
};

export const updateIndividualBenefit = (id, benefitId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/plans/${id}/benefits/${benefitId}/pivot`,
        payload
    );
};

export const updateBenefitGroupBenefit = (id, benefitId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/benefit-group-plans/${id}/benefits/${benefitId}/pivot`,
        payload
    );
};

export const planPricesUpdate = (id, priceId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/plans/${id}/prices/${priceId}`,
        payload
    );
};

export const planPricesStore = (id, payload) => {
    return AxiosService.post(`${BASE_URL}/plans/${id}/prices`, payload);
};

export const searchPlanPrices = (id, payload, params) => {
    return AxiosService.post(`${BASE_URL}/plans/${id}/prices/search`, payload, {
        params
    });
};

export const detachPlanWithPrices = (id, data) => {
    return AxiosService.delete(`${BASE_URL}/plans/${id}/prices/batch`, {
        data
    });
};

export const planPricesDelete = (id, priceId) => {
    return AxiosService.delete(`${BASE_URL}/plans/${id}/prices/${priceId}`);
};

export const publishPlan = (id, payload) => {
    return AxiosService.patch(`${BASE_URL}/plans/${id}/change-status`, payload);
};

export const acceptAgreement = (id) => {
    return AxiosService.patch(
        `${BASE_URL}/plans/${id}/change-statement-of-suitability`,
        {
            accepted_statement_of_suitability: true
        }
    );
};

export const createAssociatedPlan = (payload) => {
    return AxiosService.post(`${BASE_URL}/plans`, payload);
};

export const updateAssociatedPlan = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/plans/${id}`, payload);
};

export const createAlternateInsurance = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/plans/${id}/alternate-insurance`,
        payload
    );
};

export const updateAlternateInsurance = (id, payload) => {
    return AxiosService.put(
        `${BASE_URL}/plans/${id}/alternate-insurance`,
        payload
    );
};

export const syncPrices = (id) => {
    return AxiosService.post(`${BASE_URL}/plans/${id}/prices/calculate`);
};

export const updateContributors = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/price-contributions/${id}`, payload);
};
