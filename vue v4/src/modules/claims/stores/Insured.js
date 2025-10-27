import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import * as InsuredService from '../services/Insured.service';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';
import { useMutation, useResource } from '@/modules/claims/utils';

export const claimInsuredStore = defineStore('ClaimInsuredStore', () => {
    const globalStore = useGlobalStore();
    const { t, locale } = useI18n();

    const currentInsured = ref();
    const currentBusinessUnit = ref();

    /**
     * Set current insured
     * @param insured
     */
    const setCurrentInsured = (insured) => {
        currentInsured.value = insured;
    };

    /**
     * Get claim by ID
     * @param clientId
     * @param insuredId
     * @returns Resource elements - { data, loading, error, status }
     */
    const getInsuredById = (clientId, insuredId) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await InsuredService.getInsuredById(
                    clientId,
                    insuredId
                );
                return res.data;
            }),
            currentInsured,
            true
        );
    };

    /**
     * Search claim policy
     * @param search_value
     * @returns {Promise<*|undefined>}
     */
    const searchInsured = (search_value) => {
        return useMutation(async (search_value) => {
            return globalStore.actionWrapper(async () => {
                const res = await InsuredService.searchInsured(search_value);
                // console.log('Insured', {res})
                return res.data;
            });
        });
    };

    return {
        currentInsured,
        currentBusinessUnit,
        getInsuredById,
        setCurrentInsured,
        searchInsured
    };
});

export const useClaimInsuredStore = () => {
    let store = claimInsuredStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
