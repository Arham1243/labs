import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

export const getAssociatedPlan = (id, associatedPlanId, params) => {
    return AxiosService.get(
        `${BASE_URL}/plans/${id}/associated-plans/${associatedPlanId}`,
        { params }
    );
};

export const getAssociatedPlans = (id, params) => {
    return AxiosService.get(`${BASE_URL}/plans/${id}/associated-plans`, {
        params
    });
};

export const createAssociatedPlan = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/plans/${id}/associated-plans`,
        payload
    );
};

export const updateAssociatedPlan = (id, associatedPlanId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/plans/${id}/associated-plans/${associatedPlanId}`,
        payload
    );
};

export const updateAssociatedPlanDependantsSettings = (
    associatedPlanId,
    payload
) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plans/${associatedPlanId}/dependants-settings`,
        payload
    );
};

export const updateAssociatedPlanStatus = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/associated-plans/${id}/change-status`,
        payload
    );
};

export const deleteAssociatedPlan = (id, associatedPlanId) => {
    return AxiosService.delete(
        `${BASE_URL}/plans/${id}/associated-plans/${associatedPlanId}`
    );
};

export const copyBenefitsFromParent = (id, associatedPlanId) => {
    return AxiosService.post(
        `${BASE_URL}/plans/${id}/associated-plans/${associatedPlanId}/benefits/copy`
    );
};

export const searchBenefits = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plans/${id}/benefits/excluded/search`,
        payload,
        {
            params
        }
    );
};

export const searchBenefitGroups = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plans/${id}/benefit-groups/excluded/search`,
        payload,
        {
            params
        }
    );
};

export const attachBenefitGroups = (id, resources) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plans/${id}/benefit-groups/attach`,
        {
            resources
        }
    );
};

export const attachBenefits = (id, resources) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plans/${id}/benefits/attach`,
        {
            resources
        }
    );
};

export const purgeIndividualBenefits = (id) => {
    return AxiosService.delete(
        `${BASE_URL}/associated-plans/${id}/benefits/purge/individual`
    );
};

export const acceptAgreement = (id) => {
    return AxiosService.patch(
        `${BASE_URL}/associated-plans/${id}/change-statement-of-suitability`,
        {
            accepted_statement_of_suitability: true
        }
    );
};

export const deleteBenefitGroups = (id, resources) => {
    return AxiosService.delete(
        `${BASE_URL}/associated-plans/${id}/benefit-groups/detach`,
        { data: resources }
    );
};

export const getBenefitGroups = (id) => {
    return AxiosService.get(
        `${BASE_URL}/associated-plans/${id}/benefit-groups`
    );
};

export const getDuplicatedBenefits = (id) => {
    return AxiosService.get(
        `${BASE_URL}/associated-plans/${id}/benefits/duplicates/list`
    );
};

export const purgeBenefits = (id) => {
    return AxiosService.delete(
        `${BASE_URL}/associated-plans/${id}/benefits/purge/all`
    );
};

export const getPlanBenefits = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plans/${id}/benefits/search`,
        payload,
        {
            params
        }
    );
};

export const deleteBenefits = (id, resources) => {
    return AxiosService.delete(
        `${BASE_URL}/associated-plans/${id}/benefits/detach`,
        {
            data: resources
        }
    );
};

export const updateIndividualBenefit = (id, benefitId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/associated-plans/${id}/benefits/${benefitId}/pivot`,
        payload
    );
};

export const updateBenefitGroupBenefit = (id, benefitId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/associated-plan-benefit-groups/${id}/benefits/${benefitId}/pivot`,
        payload
    );
};

export const includeBenefitGroupBenefits = (id, data) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plan-benefit-groups/${id}/benefits/attach`,
        data
    );
};

export const excludeBenefitGroupBenefits = (id, data) => {
    return AxiosService.delete(
        `${BASE_URL}/associated-plan-benefit-groups/${id}/benefits/detach`,
        {
            data
        }
    );
};

export const searchBenefitGroupsBenefitsExcluded = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plan-benefit-groups/${id}/benefits/excluded/search`,
        payload,
        {
            params
        }
    );
};

export const searchBenefitGroupsBenefits = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plan-benefit-groups/${id}/benefits/search`,
        payload,
        {
            params
        }
    );
};

export const planPricesUpdate = (id, priceId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/associated-plans/${id}/prices/${priceId}`,
        payload
    );
};

export const planPricesStore = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plans/${id}/prices`,
        payload
    );
};

export const searchPlanPrices = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plans/${id}/prices/search`,
        payload,
        {
            params
        }
    );
};

export const detachPlanWithPrices = (id, data) => {
    return AxiosService.delete(
        `${BASE_URL}/associated-plans/${id}/prices/batch`,
        {
            data
        }
    );
};

export const planPricesDelete = (id, priceId) => {
    return AxiosService.delete(
        `${BASE_URL}/associated-plans/${id}/prices/${priceId}`
    );
};

export const updateBenefitGroups = (id, groupId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/associated-plans/${id}/benefit-groups/${groupId}/pivot`,
        payload
    );
};

export const overlapping = (planId, associatedPanId) => {
    return AxiosService.get(
        `${BASE_URL}/plans/${planId}/associated-plans/${associatedPanId}/prices/overlapping`
    );
};

export const copyPricingFromParent = (planId, associatedPanId) => {
    return AxiosService.post(
        `${BASE_URL}/plans/${planId}/associated-plans/${associatedPanId}/prices/copy`
    );
};

export const deletePlan = (plan, id) => {
    return AxiosService.delete(
        `${BASE_URL}/plans/${plan}/associated-plans/${id}`
    );
};

export const updatePlanStatus = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/associated-plans/${id}/change-status`,
        payload
    );
};

export const updateAssociatedPlanSettings = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plans/${id}/dependants-settings`,
        payload
    );
};

export const syncPrices = (id) => {
    return AxiosService.post(
        `${BASE_URL}/associated-plans/${id}/prices/calculate`
    );
};
