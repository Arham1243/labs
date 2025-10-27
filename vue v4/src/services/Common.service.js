import AxiosService from './Axios.service';
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;
export const getRegions = (params) => {
    return AxiosService.get(`${BASE_URL}/regions?limit=500`, {
        params: { params }
    });
};

export const searchRegions = (params) => {
    const body = {
        ...params,
        sort: [
            {
                field: 'name',
                direction: 'asc'
            }
        ]
    };
    return AxiosService.post(`${BASE_URL}/regions/list?limit=500`, body);
};

export const getCountries = (params) => {
    return AxiosService.get(`${BASE_URL}/countries`, {
        params: { params }
    });
};

export const getTaxTypes = () => {
    return AxiosService.get(`${BASE_URL}/tax-types`);
};

export const showCountry = (countryId, includeParam = null) => {
    const url = includeParam
        ? `${BASE_URL}/countries/${countryId}?include=${includeParam}`
        : `${BASE_URL}/countries/${countryId}`;
    return AxiosService.get(url);
};

export const searchCountries = (payload) => {
    const body = {
        ...payload,
        sort: [
            {
                field: 'name',
                direction: 'asc'
            }
        ]
    };
    return AxiosService.post(`${BASE_URL}/countries/list?limit=500`, body);
};
export const searchProvinces = (payload) => {
    const body = {
        ...payload,
        sort: [
            {
                field: 'name',
                direction: 'asc'
            }
        ]
    };
    return AxiosService.post(`${BASE_URL}/provinces/list?limit=500`, body);
};

export const searchVendors = (payload) => {
    return AxiosService.post(`${BASE_URL}/vendors/list`, payload);
};

export const getUnderwriters = (params) => {
    return AxiosService.get(`${BASE_URL}/underwriters`, {
        params
    });
};

export const searchUnderwriters = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/underwriters/list`, payload, {
        params
    });
};
export const searchRoles = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/roles/search`, payload, {
        params
    });
};

export const searchLanguages = (payload) => {
    return AxiosService.post(`${BASE_URL}/languages/list?limit=500`, payload);
};

export const getAppsByCategory = (category) => {
    return AxiosService.get(`${BASE_URL}/apps/categories/${category}`);
};

export const searchCurrencies = (payload) => {
    return AxiosService.post(`${BASE_URL}/currencies/list?limit=500`, payload);
};

export const searchActivityLogs = (payload, params, resource, resource_id) => {
    return AxiosService.post(
        `${BASE_URL}/${resource}/${resource_id}/logs/search`,
        payload,
        {
            params
        }
    );
};

export const searchInsureds = (payload, params, client_id) => {
    return AxiosService.post(
        `${BASE_URL}/clients/${client_id}/insureds/search`,
        payload,
        {
            params
        }
    );
};

export const searchTags = (payload) => {
    return AxiosService.post(`${BASE_URL}/tags/search`, payload);
};

export const getTags = (params) => {
    return AxiosService.get(`${BASE_URL}/tags`, {
        params
    });
};

export const searchCompanyUsers = (payload, params = { limit: 500 }) => {
    return AxiosService.post(`${BASE_URL}/company-users/list`, payload, {
        params
    });
};

export const getClientUsers = (payload, params) => {
    return AxiosService.post(`${BASE_URL}/client-users/search`, payload, {
        params
    });
};

export const getBusinessUnitUsers = (payload, params) => {
    return AxiosService.post(
        `${BASE_URL}/business-unit-users/search`,
        payload,
        {
            params
        }
    );
};

export const searchClientSectors = (payload) => {
    return AxiosService.post(`${BASE_URL}/client-sectors/list`, payload);
};

export const searchContactTypes = (payload) => {
    return AxiosService.post(`${BASE_URL}/contact-types/list`, payload);
};

export const searchBenefitCategories = (payload) => {
    return AxiosService.post(`${BASE_URL}/benefit-categories/list`, payload);
};
export const getGeneralSettings = () => {
    return AxiosService.get(`${BASE_URL}/general`);
};
