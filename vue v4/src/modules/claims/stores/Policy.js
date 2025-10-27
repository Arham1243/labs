import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import * as PolicyService from '../services/Policy.service';
import * as InsuredService from '../services/Insured.service';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';
import { useMutation, useResource } from '@/modules/claims/utils';

export const claimPolicyStore = defineStore('ClaimPolicyStore', () => {
    const globalStore = useGlobalStore();
    const { t, locale } = useI18n();

    const currentPolicy = ref();
    const currentBusinessUnit = ref();

    /**
     * Set current policy
     * @param policy
     */
    const setCurrentPolicy = (policy) => {
        currentPolicy.value = policy;
    };

    /**
     * Get claim by ID
     * @param clientId
     * @param policyId
     * @param refresh
     * @returns Resource elements - { data, loading, error, status }
     */
    const getPolicyById = (clientId, policyId, refresh = false) => {
        // if( !clientId || !policyId ) return;
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await PolicyService.getPolicy(clientId, policyId);
                currentBusinessUnit.value = {
                    id: res.data.data.business_unit_id
                };
                return res.data;
            }),
            currentPolicy,
            refresh
        );
    };

    /**
     * Search claim policy
     * @param payload
     * @returns {Promise<*|undefined>}
     */
    const searchPolicy = () => {
        return useMutation(async ({ search = null, filters = null } = {}) => {
            return globalStore.actionWrapper(async () => {
                const res = await PolicyService.searchPolicy({
                    search,
                    filters
                });
                // console.log({res})
                return res.data;
            });
        });
    };

    /**
     * Get policy batch by ID
     * @param tenantId
     * @param policyBatchId
     * @returns {Promise<*|undefined>}
     */
    const getPolicyBatchById = (tenantId, policyBatchId) => {
        return globalStore.actionWrapper(async () => {
            const res = await PolicyService.getPolicyBatch(
                tenantId,
                policyBatchId
            );
            return res.data;
        });
    };

    /**
     * Get policy benefit by ID
     * @param policyBenefitId
     * @returns {Promise<*|undefined>}
     */
    const getPolicyBenefitById = (policyBenefitId) => {
        return globalStore.actionWrapper(async () => {
            const res =
                await PolicyService.getPolicyBenefitById(policyBenefitId);
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
            const res = await InsuredService.getBusinessUnit(businessUnitId);
            return res.data;
        });
    };

    return {
        currentPolicy,
        currentBusinessUnit,
        getPolicyById,
        setCurrentPolicy,
        searchPolicy,
        getPolicyBenefitById
    };
});

export const useClaimPolicyStore = () => {
    let store = claimPolicyStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
