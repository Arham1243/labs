import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

// Benfits

export const searchBenefits = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/benefits/search`, payload, {
        params
    });
};

export const searchBenefitGroupBenefits = (benefitGroupId, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-groups/${benefitGroupId}/benefits/search`,
        payload,
        {
            params
        }
    );
};

export const getBenefits = (params) => {
    return AxiosService.get(`${BASE_URL}/benefits?include=category`, {
        params: { params }
    });
};

export const getBenefit = (id, params) => {
    return AxiosService.get(`${BASE_URL}/benefits/${id}`, { params });
};

export const createBenefit = (payload) => {
    return AxiosService.post(`${BASE_URL}/benefits`, payload);
};

export const updateBenefit = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/benefits/${id}`, payload);
};

export const deleteBenefit = (id) => {
    return AxiosService.delete(`${BASE_URL}/benefits/${id}`);
};

export const changeBenefitStatus = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/benefits/${id}/change-status`,
        payload
    );
};

export const duplicateBenefit = (id, payload) => {
    return AxiosService.post(`${BASE_URL}/benefits/${id}/duplicate`, payload);
};

// Benefit Categories

export const searchBenefitCategories = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/benefit-categories/search`, payload, {
        params
    });
};

export const getBenefitCategories = (params) => {
    return AxiosService.get(`${BASE_URL}/benefit-categories`, params);
};

export const getBenefitCategory = (id) => {
    return AxiosService.get(`${BASE_URL}/benefit-categories/${id}`);
};

export const createBenefitCategory = (payload) => {
    return AxiosService.post(`${BASE_URL}/benefit-categories`, payload);
};

export const updateBenefitCategory = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/benefit-categories/${id}`, payload);
};

export const updateBenefitCategoryStatus = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/benefit-categories/${id}/change-status`,
        payload
    );
};

export const deleteBenefitCategory = (id) => {
    return AxiosService.delete(`${BASE_URL}/benefit-categories/${id}`);
};

export const attachBenefitWithCodeServices = (id, resources) => {
    return AxiosService.post(
        `${BASE_URL}/benefits/${id}/service-codes/attach`,
        {
            resources
        }
    );
};

export const attachBenefitWithCodeServicesGroup = (id, resources) => {
    return AxiosService.post(
        `${BASE_URL}/benefits/${id}/service-code-groups/attach`,
        {
            resources
        }
    );
};

export const getBenefitCodeServices = (id) => {
    return AxiosService.get(`${BASE_URL}/benefits/${id}/service-codes`);
};

export const getBenefitCodeServicesGroups = (id) => {
    return AxiosService.get(`${BASE_URL}/benefits/${id}/service-code-groups`);
};

export const purgeServiceCodes = (id) => {
    return AxiosService.delete(
        `${BASE_URL}/benefits/${id}/service-codes/purge/all`
    );
};

export const purgeIndividualServices = (id) => {
    return AxiosService.delete(
        `${BASE_URL}/benefits/${id}/service-codes/purge/individual`
    );
};

export const excludeBenefitServiceCodeGroups = (id, resources) => {
    return AxiosService.delete(
        `${BASE_URL}/benefit-service-code-groups/${id}/service-codes/detach`,
        { data: resources }
    );
};

export const includeBenefitServiceCodeGroups = (id, resources) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-service-code-groups/${id}/service-codes/attach`,
        resources
    );
};

export const excludeBenefitServiceCode = (id, resources) => {
    return AxiosService.delete(
        `${BASE_URL}/benefits/${id}/service-codes/detach`,
        { data: resources }
    );
};

export const updateBenefitService = (id, codeId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/benefits/${id}/service-codes/${codeId}/pivot`,
        payload
    );
};

export const updateBenefitServiceCodeGroupBulk = (id, payload) => {
    return AxiosService.put(
        `${BASE_URL}/benefit-service-code-groups/${id}/service-codes/pivot/bulk`,
        payload
    );
};

export const updateBenefitIndividualServicesBulk = (id, payload) => {
    return AxiosService.put(
        `${BASE_URL}/benefits/${id}/service-codes/pivot/bulk`,
        payload
    );
};

export const searchBenefitEntityServiceCodes = (
    entity,
    id,
    payload,
    params
) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-service-code-${entity}/${id}/service-codes/search`,
        payload,
        {
            params
        }
    );
};

export const searchBenefitServiceCodeGroupExcluded = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-service-code-groups/${id}/service-codes/excluded/search`,
        payload,
        {
            params
        }
    );
};

export const deleteBenefitCodeGroups = (id, resources) => {
    return AxiosService.delete(
        `${BASE_URL}/benefits/${id}/service-code-groups/detach`,
        { data: resources }
    );
};

export const searchBenefitServicesCodes = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/benefits/${id}/service-codes/search`,
        payload,
        {
            params
        }
    );
};

export const updateBenefitServiceCodeGroup = (id, groupId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/benefits/${id}/service-code-groups/${groupId}/pivot`,
        payload
    );
};

export const getDuplicatedServices = (id) => {
    return AxiosService.get(
        `${BASE_URL}/benefits/${id}/service-codes/duplicates/list`
    );
};

// Benefit Groups
export const createBenefitGroup = (payload) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-groups?include=benefits`,
        payload
    );
};

export const updateBenefitGroup = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/benefit-groups/${id}`, payload);
};

export const getBenefitGroup = (id) => {
    return AxiosService.get(`${BASE_URL}/benefit-groups/${id}`);
};

export const searchBenefitGroups = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/benefit-groups/search`, payload, {
        params
    });
};

export const getBenefitGroups = (params) => {
    return AxiosService.get(`${BASE_URL}/benefit-groups`, {
        params
    });
};

export const updateBenefitGroupStatus = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/benefit-groups/${id}/change-status`,
        payload
    );
};

export const updateBenefitGroupBenefitPivot = (id, benefitId, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/benefit-groups/${id}/benefits/${benefitId}/pivot`,
        payload
    );
};

export const deleteBenefitGroup = (id) => {
    return AxiosService.delete(`${BASE_URL}/benefit-groups/${id}`);
};

export const syncBenefitGroupWithBenefits = (id, resources) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-groups/${id}/benefits/attach`,
        {
            resources
        }
    );
};

export const detachBenefitGroupWithBenefits = (id, data) => {
    return AxiosService.delete(
        `${BASE_URL}/benefit-groups/${id}/benefits/detach`,
        {
            data
        }
    );
};

export const getAllBenefitCategoryForList = (payload) => {
    return AxiosService.post(`${BASE_URL}/benefit-categories/search`, payload);
};

export const getAllBenefitsByCategory = (payload) => {
    return AxiosService.post(`${BASE_URL}/benefits/search`, payload);
};

export const searchBenefitGroupPrices = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-groups/${id}/prices/search`,
        payload,
        {
            params
        }
    );
};

export const searchBenefitPrices = (id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/benefits/${id}/prices/search`,
        payload,
        {
            params
        }
    );
};

export const benefitGroupPricesStore = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-groups/${id}/prices`,
        payload
    );
};

export const benefitPricesStore = (id, payload) => {
    return AxiosService.post(`${BASE_URL}/benefits/${id}/prices`, payload);
};

export const benefitGroupPricesDelete = (id, priceId) => {
    return AxiosService.delete(
        `${BASE_URL}/benefit-groups/${id}/prices/${priceId}`
    );
};

export const benefitPricesDelete = (id, priceId) => {
    return AxiosService.delete(`${BASE_URL}/benefits/${id}/prices/${priceId}`);
};

export const detachBenefitGroupWithPrices = (id, data) => {
    return AxiosService.delete(
        `${BASE_URL}/benefit-groups/${id}/prices/batch`,
        {
            data
        }
    );
};

export const detachBenefitWithPrices = (id, data) => {
    return AxiosService.delete(`${BASE_URL}/benefits/${id}/prices/batch`, {
        data
    });
};

export const benefitGroupPricesUpdate = (id, priceId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/benefit-groups/${id}/prices/${priceId}`,
        payload
    );
};

export const benefitPricesUpdate = (id, priceId, payload) => {
    return AxiosService.put(
        `${BASE_URL}/benefits/${id}/prices/${priceId}`,
        payload
    );
};

export const publishBenefitGroup = (id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/benefit-groups/${id}/change-status`,
        payload
    );
};

export const searchBenefitGroupDocuments = (id, payload, params) => {
    return AxiosService.get(
        `${BASE_URL}/benefit-groups/${id}/documents`,
        payload,
        {
            params
        }
    );
};

export const benefitGroupDocumentsDelete = (id, documentId) => {
    return AxiosService.delete(
        `${BASE_URL}/benefit-groups/${id}/documents/${documentId}`
    );
};

export const syncPrices = (id) => {
    return AxiosService.post(
        `${BASE_URL}/benefit-groups/${id}/prices/calculate`
    );
};
