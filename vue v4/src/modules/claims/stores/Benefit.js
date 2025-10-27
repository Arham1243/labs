import { ref } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import * as BenefitService from '../services/Benefit.service';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';
import { useMutation, useResource } from '@/modules/claims/utils';

export const claimBenefitStore = defineStore('ClaimBenefitStore', () => {
    const globalStore = useGlobalStore();
    const { t, locale } = useI18n();

    const benefits = ref();

    /**
     * Get Benefits
     * @param refresh
     * @returns Resource elements - { data, loading, error, status }
     */
    const getBenefits = (refresh = false) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await BenefitService.getBenefits();
                return res.data;
            }),
            benefits,
            refresh
        );
    };

    // /**
    //  * Search claim policy
    //  * @param search_value
    //  * @returns {Promise<*|undefined>}
    //  */
    // const searchInsured = (search_value) => {
    //     return useMutation(async (search_value) => {
    //         return globalStore.actionWrapper(async () => {
    //             const res = await InsuredService.searchInsured( search_value );
    //             // console.log('Insured', {res})
    //             return res.data;
    //         });
    //     });
    // };

    return {
        benefits,
        getBenefits
    };
});

export const useClaimBenefitStore = () => {
    let store = claimBenefitStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
