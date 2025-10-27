import AxiosService from '@/services/Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

// Code Sets

export const searchCodeSets = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/service-code-sets/search`, payload, {
        params
    });
};

export const getCodeSets = (params) => {
    return AxiosService.get(`${BASE_URL}/service-code-sets`, {
        params
    });
};

export const getCodeSet = (id) => {
    return AxiosService.get(`${BASE_URL}/service-code-sets/${id}`);
};

export const createCodeSet = (payload) => {
    return AxiosService.post(`${BASE_URL}/service-code-sets`, payload);
};

export const updateCodeSet = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/service-code-sets/${id}`, payload);
};

export const deleteCodeSet = (id) => {
    return AxiosService.delete(`${BASE_URL}/service-code-sets/${id}`);
};

export const getCodeSetTags = (id) => {
    return AxiosService.get(`${BASE_URL}/service-code-sets/${id}/tags`);
};

// Code Groups

export const searchCodeGroupsExclude = (id, serviceCodeId, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/benefits/${id}/service-code-sets/${serviceCodeId}/service-code-groups/excluded/search`,
        payload,
        { params }
    );
};

export const searchCodeGroups = (payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/service-code-groups/search`,
        payload,
        { params }
    );
};

export const getCodeGroups = (params) => {
    return AxiosService.get(`${BASE_URL}/service-code-groups`, {
        params
    });
};

export const getCodeGroup = (id) => {
    return AxiosService.get(`${BASE_URL}/service-code-groups/${id}`);
};

export const createCodeGroup = (payload) => {
    return AxiosService.post(`${BASE_URL}/service-code-groups`, payload);
};

export const updateCodeGroup = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/service-code-groups/${id}`, payload);
};

export const deleteCodeGroup = (id) => {
    return AxiosService.delete(`${BASE_URL}/service-code-groups/${id}`);
};

export const syncCodeGroupByTags = (id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/service-code-groups/${id}/service-codes/tags/sync`,
        payload
    );
};

// Service Codes

export const searchServiceCodes = (value) => {
    return AxiosService.post(`${BASE_URL}/service-codes/search`, {
        search: { value }
    });
};

export const getEntityServiceCodes = (entity, id, params) => {
    return AxiosService.get(
        `${BASE_URL}/service-code-${entity}/${id}/service-codes`,
        {
            params
        }
    );
};

export const getExcludedServiceCodes = (entity, id, params) => {
    return AxiosService.get(
        `${BASE_URL}/service-code-${entity}/${id}/service-codes/excluded`,
        {
            params
        }
    );
};

export const searchEntityServiceCodes = (entity, id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/service-code-${entity}/${id}/service-codes/search`,
        payload,
        {
            params
        }
    );
};

export const searchExcludedServicesCodes = (entity, id, payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/service-code-${entity}/${id}/service-codes/excluded/search`,
        payload,
        {
            params
        }
    );
};

export const getExcludedServicesCodesForBenefit = (
    id,
    service_code_set,
    payload,
    params
) => {
    return AxiosService.post(
        `${BASE_URL}/benefits/${id}/service-code-sets/${service_code_set}/service-codes/excluded/search`,
        payload,
        { params }
    );
};

export const createServiceCode = (payload) => {
    return AxiosService.post(`${BASE_URL}/service-codes`, payload);
};

export const updateServiceCode = (id, payload) => {
    return AxiosService.put(`${BASE_URL}/service-codes/${id}`, payload);
};

export const syncServiceCodes = (entity, id, payload) => {
    return AxiosService.patch(
        `${BASE_URL}/service-code-${entity}/${id}/service-codes/sync`,
        payload
    );
};

export const attachServiceCodes = (entity, id, payload) => {
    return AxiosService.post(
        `${BASE_URL}/service-code-${entity}/${id}/service-codes/attach`,
        payload
    );
};

export const detachServiceCodes = (entity, id, data) => {
    return AxiosService.delete(
        `${BASE_URL}/service-code-${entity}/${id}/service-codes/detach`,
        {
            data
        }
    );
};

export const importServiceCodes = (payload, config) => {
    return AxiosService.post(`${BASE_URL}/service-codes/import`, payload, {
        ...config
    });
};

export const checkImportLogStatus = (import_log_id, config) => {
    return AxiosService.get(`${BASE_URL}/import-logs/${import_log_id}`, {
        ...config
    });
};
