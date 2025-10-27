import { ref } from 'vue';
import { defineStore } from 'pinia';
import { CommonService } from '@/services';
import { useGlobalStore } from '@/stores';

export const useCommonStore = defineStore('CommonStore', () => {
    const globalStore = useGlobalStore();
    const generalSettings = ref(null);

    const searchVendors = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchVendors(payload);
            return res.data;
        });
    };

    const getUnderwriters = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.getUnderwriters(params);
            return res.data;
        });
    };

    const searchLanguages = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchLanguages(payload);
            return res.data;
        });
    };

    const searchRoles = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchRoles(payload, params);
            return res.data;
        });
    };

    const getAppsByCategory = (category) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.getAppsByCategory(category);
            return res.data;
        });
    };

    const searchCurrencies = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchCurrencies(payload);
            return res.data;
        });
    };

    const searchUnderwriters = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchUnderwriters(payload, params);
            const originalResponse = res.data;
            return {
                ...originalResponse,
                data: originalResponse.data.map((u) => ({
                    ...u,
                    name: `${u.code} - ${u.name}`
                }))
            };
        });
    };

    const getCountries = () => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.getCountries();
            return res.data;
        });
    };

    const getTaxTypes = () => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.getTaxTypes();
            return res.data;
        });
    };

    const searchCountries = (payload = {}) => {
        payload.filters = [...(payload.filters ?? [])];
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchCountries(payload);
            return res.data;
        });
    };

    const searchCompanyUsers = (payload = {}) => {
        payload.filters = [...(payload.filters ?? [])];
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchCompanyUsers(payload);
            return res.data;
        });
    };

    const searchProvinces = (payload = {}) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchProvinces(payload);
            return res.data;
        });
    };

    const showCountry = (countryId, includeParam = null) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.showCountry(
                countryId,
                includeParam
            );
            return res.data;
        });
    };

    const getRegions = () => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.getRegions();
            return res.data;
        });
    };

    const searchRegions = (payload = {}) => {
        payload.filters = [...(payload.filters ?? [])];
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchRegions(payload);
            return res.data;
        });
    };

    const searchActivityLogs = (payload, params, resource, resource_id) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchActivityLogs(
                payload,
                params,
                resource,
                resource_id
            );
            return res.data;
        });
    };

    const searchInsureds = (payload, params, client_id) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchInsureds(
                payload,
                params,
                client_id
            );
            return res.data;
        });
    };

    const searchTags = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchTags(payload);
            return res.data;
        });
    };

    const getTags = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.getTags(params);
            return res.data;
        });
    };

    const getClientUsers = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.getClientUsers(payload, params);
            return res.data;
        });
    };
    const getBusinessUnitUsers = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.getBusinessUnitUsers(
                payload,
                params
            );
            return res.data;
        });
    };

    const searchClientSectors = (payload = {}) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchClientSectors(payload);
            return res.data;
        });
    };

    const searchContactTypes = (payload = {}) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchContactTypes(payload);
            return res.data;
        });
    };

    const searchBenefitCategories = (payload = {}) => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.searchBenefitCategories(payload);
            return res.data;
        });
    };

    const getGeneralSettings = () => {
        return globalStore.actionWrapper(async () => {
            const res = await CommonService.getGeneralSettings();
            generalSettings.value = res.data;
            return res.data;
        });
    };

    return {
        getRegions,
        searchRegions,
        showCountry,
        getCountries,
        getTaxTypes,
        searchCountries,
        searchCompanyUsers,
        searchRoles,
        searchProvinces,
        getUnderwriters,
        searchVendors,
        searchUnderwriters,
        searchLanguages,
        searchCurrencies,
        getAppsByCategory,
        searchActivityLogs,
        searchTags,
        getTags,
        searchInsureds,
        getClientUsers,
        getBusinessUnitUsers,
        searchClientSectors,
        searchContactTypes,
        searchBenefitCategories,
        generalSettings,
        getGeneralSettings
    };
});
