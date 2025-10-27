import { defineStore } from 'pinia';

import { useGlobalStore } from '@/stores';
import * as InsuredsService from '../services/Insureds.service';
import { InsuredDependentRelations } from '@/config/enums';
import helpers from '@/utils/helpers';

export const useInsuredsStore = defineStore('InsuredsStore', () => {
    const globalStore = useGlobalStore();

    const insuredSections = {
        DETAILS: 'details',
        ADDRESS: 'address',
        SETTINGS: 'settings',
        OTHER: 'other'
    };

    const searchInsureds = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await InsuredsService.searchInsureds(payload, params);
            return res.data;
        });
    };

    const getInsured = (insuredId) => {
        return globalStore.actionWrapper(async () => {
            const res = await InsuredsService.getInsured(insuredId);
            return res.data;
        });
    };

    const getInsuredByClient = (tenantId, insuredId) => {
        return globalStore.actionWrapper(async () => {
            const res = await InsuredsService.getInsuredByClient(
                tenantId,
                insuredId
            );
            return res.data;
        });
    };

    const updateInsured = (clientId, insuredId, payload, section = null) => {
        return globalStore.actionWrapper(async () => {
            const res = await InsuredsService.updateInsured(
                clientId,
                insuredId,
                payload,
                section
            );
            return res.data;
        });
    };

    const getRelations = () => {
        let relations = [];
        Object.values(InsuredDependentRelations).forEach((value) => {
            relations.push({
                label: helpers.capitalizeWords(value),
                value: value
            });
        });

        return relations;
    };

    const addNonInsuranceProduct = (clientId, insuredId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await InsuredsService.addNonInsuranceProduct(
                clientId,
                insuredId,
                payload
            );
            return res.data;
        });
    };

    const addBeneficiary = (clientId, insuredId, payload) => {
        return globalStore.actionWrapper(async () => {
            await InsuredsService.addBeneficiary(clientId, insuredId, payload);
        });
    };

    const updateBeneficiary = (clientId, insuredId, beneficiaryId, payload) => {
        return globalStore.actionWrapper(async () => {
            await InsuredsService.updateBeneficiary(
                clientId,
                insuredId,
                beneficiaryId,
                payload
            );
        });
    };

    const addExternalBeneficiary = (clientId, insuredId, payload) => {
        return globalStore.actionWrapper(async () => {
            await InsuredsService.addExternalBeneficiary(
                clientId,
                insuredId,
                payload
            );
        });
    };

    const updateExternalBeneficiary = (
        clientId,
        insuredId,
        beneficiaryId,
        payload
    ) => {
        return globalStore.actionWrapper(async () => {
            await InsuredsService.updateExternalBeneficiary(
                clientId,
                insuredId,
                beneficiaryId,
                payload
            );
        });
    };

    const getBeneficiary = (clientId, insuredId, beneficiaryId) => {
        return globalStore.actionWrapper(async () => {
            const res = await InsuredsService.getBeneficiary(
                clientId,
                insuredId,
                beneficiaryId
            );

            return res.data;
        });
    };

    const deleteBeneficiary = (clientId, insuredId, beneficiaryId) => {
        return globalStore.actionWrapper(async () => {
            const res = await InsuredsService.deleteBeneficiary(
                clientId,
                insuredId,
                beneficiaryId
            );

            return res.data;
        });
    };

    return {
        searchInsureds,
        getInsured,
        getInsuredByClient,
        updateInsured,
        insuredSections,
        addNonInsuranceProduct,
        getRelations,
        addBeneficiary,
        updateBeneficiary,
        addExternalBeneficiary,
        updateExternalBeneficiary,
        getBeneficiary,
        deleteBeneficiary
    };
});
