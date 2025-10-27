import { defineStore, storeToRefs } from 'pinia';
import { useCommonStore, useGlobalStore } from '@/stores';
import * as CommonService from '@/services/Common.service';
import * as GeneralService from '@/modules/claims/services/General.service';
import { ref } from 'vue';
import { useResource } from '@/modules/claims/utils';
import { getProvinces } from '@/modules/claims/services/General.service';

// const commonStore = useCommonStore();

export const generalStore = defineStore('GeneralStore', () => {
    const globalStore = useGlobalStore();

    // CURRENCY
    const currencies = ref();
    const currentInsured = ref({});

    /**
     * Get currencies
     * @param refresh
     * @returns Resource elements - { data, loading, error, status }
     */
    const getCurrencies = (refresh = false) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await GeneralService.getCurrencies();
                return res.data;
            }),
            currencies,
            refresh
        );
    };

    // COUNTRIES
    const countries = ref();

    /**
     * Get countries
     * @param refresh
     * @returns Resource elements - { data, loading, error, status }
     */
    const getCountries = (refresh = false) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await CommonService.searchCountries();
                return {
                    ...res.data,
                    data: res.data.data.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    )
                };
            }),
            countries,
            refresh
        );
    };

    /**
     * Get country by ID
     * @param countryId
     * @returns {Promise<*|undefined>}
     */
    const getCountryById = (countryId) => {
        return globalStore.actionWrapper(async () => {
            const res = await GeneralService.getCountry(countryId);
            return res.data;
        });
    };

    // PROVINCES
    const provinces = ref();

    /**
     * Get provinces
     * @param refresh
     * @returns Resource elements - { data, loading, error, status }
     */
    const getProvinces = (refresh = false) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await GeneralService.getProvinces();
                return {
                    ...res.data,
                    data: res.data.data
                        .map((province) => ({
                            id: province.id,
                            name: province.name,
                            code: province.code,
                            country: {
                                id: province.country.id,
                                name: province.country.name
                            }
                        }))
                        .sort((a, b) => a.name.localeCompare(b.name))
                };
            }),
            provinces,
            refresh
        );
    };

    /**
     * Get province by ID
     * @param provinceId
     * @returns {Promise<*|undefined>}
     */
    const getProvinceById = (provinceId) => {
        return globalStore.actionWrapper(async () => {
            const res = await GeneralService.getProvince(provinceId);
            return res.data;
        });
    };

    /**
     * Get insured
     * @param tenantId
     * @param insuredId
     * @param refresh
     * @returns Resource elements - { }data, loading, error, status }
     */
    const getInsured = (tenantId, insuredId, refresh = true) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await GeneralService.getInsured(
                    tenantId,
                    insuredId
                );
                return res.data;
            }),
            currentInsured,
            refresh
        );
    };

    /**
     * Get policy
     * @param {*} tenantId
     * @param {*} policyId
     * @returns
     */
    const getPolicy = (tenantId, policyId) => {
        return globalStore.actionWrapper(async () => {
            const res = await GeneralService.getPolicy(tenantId, policyId);
            return res.data;
        });
    };

    /**
     * Get policy batch
     * @param {*} tenantId
     * @param {*} policyBatchId
     * @returns
     */
    const getPolicyBatch = (tenantId, policyBatchId) => {
        return globalStore.actionWrapper(async () => {
            const res = await GeneralService.getPolicyBatch(
                tenantId,
                policyBatchId
            );
            return res.data;
        });
    };

    /**
     * Get business unit
     * @param businessUnitId
     * @returns {Promise<*|undefined>}
     */
    const getBusinessUnit = (businessUnitId) => {
        return globalStore.actionWrapper(async () => {
            const res = await GeneralService.getBusinessUnit(businessUnitId);
            return res.data;
        });
    };

    // Plans
    let plans = ref();
    /**
     * Get plans
     * @returns {Promise<*|undefined>}
     */
    const getPlans = (refresh = false) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await GeneralService.getPlans();
                return {
                    ...res.data,
                    data: res.data.data.map((plan) => ({
                        id: plan.id,
                        name: plan.name?.en
                    }))
                };
            }),
            plans,
            refresh
        );
    };

    return {
        currencies,
        countries,
        provinces,
        currentInsured,
        plans,
        getCurrencies,
        getCountries,
        getCountryById,
        getProvinces,
        getProvinceById,
        getInsured,
        getPolicy,
        getPolicyBatch,
        getBusinessUnit,
        getPlans
    };
});

export const useGeneralStore = () => {
    let store = generalStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
