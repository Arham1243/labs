import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useGlobalStore } from '@/stores';
import * as BenefitService from '../services/Benefit.service';

export const useBenefitStore = defineStore('BenefitStore', () => {
    const globalStore = useGlobalStore();
    const { t, locale } = useI18n();

    const currentBenefit = ref();

    const setCurrentBenefit = (value) => {
        currentBenefit.value = value;
    };

    // Benfits

    const searchBenefits = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.searchBenefits(payload, params);
            return res.data;
        });
    };

    const searchBenefitGroupBenefits = (benefitGroupId, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.searchBenefitGroupBenefits(
                benefitGroupId,
                payload,
                params
            );
            return res.data;
        });
    };

    const getBenefits = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.getBenefits(params);
            return res.data;
        });
    };

    const getBenefit = (id, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.getBenefit(id, params);
            return res.data;
        });
    };

    const createBenefit = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.createBenefit(payload);
            globalStore.showSuccess(
                t('notifications.benefit_created'),
                t('notifications.benefit_created_detail')
            );
            return res.data;
        });
    };

    const updateBenefit = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.updateBenefit(id, payload);
            globalStore.showSuccess(
                t('notifications.benefit_updated'),
                t('notifications.benefit_updated_detail')
            );
            return res.data;
        });
    };

    const publishBenefit = (id) => {
        const data = { status: 'active' };
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.changeBenefitStatus(id, data);
            globalStore.showSuccess(
                t('notifications.benefit_published'),
                t('notifications.benefit_published_detail')
            );
            return res.data;
        });
    };

    const deleteBenefit = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.deleteBenefit(id);
            globalStore.showSuccess(
                t('notifications.benefit_deleted'),
                t('notifications.benefit_deleted_details')
            );
            return res.data;
        });
    };

    const changeBenefitStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.changeBenefitStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.benefit_updated'),
                t('notifications.benefit_updated_detail')
            );
            return res.data;
        });
    };

    const duplicateBenefit = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.duplicateBenefit(id, payload);
            globalStore.showSuccess(
                t('notifications.benefit_duplicated'),
                t('notifications.benefit_duplicated_detail')
            );
            return res.data;
        });
    };

    // Benefit Categories

    const searchBenefitCategories = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.searchBenefitCategories(
                payload,
                params
            );
            return res.data;
        });
    };

    const getBenefitCategories = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.getBenefitCategories(params);
            return res.data;
        });
    };

    const getBenefitCategory = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.getBenefitCategory(id);
            return res.data;
        });
    };

    const createBenefitCategory = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.createBenefitCategory(payload);
            globalStore.showSuccess(
                t('notifications.benefit_category_created'),
                t('notifications.benefit_category_created_detail')
            );
            return res.data;
        });
    };

    const updateBenefitCategory = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.updateBenefitCategory(id, payload);
            return res.data;
        });
    };

    const updateBenefitCategoryStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.updateBenefitCategoryStatus(
                id,
                payload
            );
            globalStore.showSuccess(
                t('notifications.benefit_category_updated'),
                t('notifications.benefit_category_updated_detail')
            );
            return res.data;
        });
    };

    const deleteBenefitCategory = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.deleteBenefitCategory(id);
            globalStore.showSuccess(
                t('notifications.benefit_category_deleted'),
                t('notifications.benefit_category_deleted_details')
            );
            return res.data;
        });
    };

    const attachBenefitWithCodeServices = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.attachBenefitWithCodeServices(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.benefit_service_codes_attached'),
                t('notifications.benefit_service_codes_attached_detail')
            );
            return res.data;
        });
    };

    const attachBenefitWithCodeServicesGroup = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.attachBenefitWithCodeServicesGroup(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.benefit_code_groups_attached'),
                t('notifications.benefit_code_groups_attached_detail')
            );
            return res.data;
        });
    };

    const getBenefitCodeServices = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.getBenefitCodeServices(id);
            return res.data;
        });
    };

    const getBenefitCodeServicesGroups = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.getBenefitCodeServicesGroups(id);
            return res.data;
        });
    };

    const deleteBenefitCodeGroups = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.deleteBenefitCodeGroups(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.benefit_code_group_deleted'),
                t('notifications.benefit_code_group_deleted_detail')
            );
            return res.data;
        });
    };

    const purgeServiceCodes = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.purgeServiceCodes(id);
            globalStore.showSuccess(
                t('notifications.benefit_code_group_deleted'),
                t('notifications.benefit_code_group_deleted_detail')
            );
            return res.data;
        });
    };

    const purgeIndividualServices = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.purgeIndividualServices(id);
            globalStore.showSuccess(
                t('notifications.benefit_code_group_deleted'),
                t('notifications.benefit_code_group_deleted_detail')
            );
            return res.data;
        });
    };

    const excludeBenefitServiceCodeGroups = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.excludeBenefitServiceCodeGroups(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.service_code_excluded'),
                t('notifications.service_code_excluded_detail')
            );
            return res.data;
        });
    };

    const includeBenefitServiceCodeGroups = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.includeBenefitServiceCodeGroups(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.service_code_included'),
                t('notifications.service_code_included_detail')
            );
            return res.data;
        });
    };

    const excludeBenefitServiceCode = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.excludeBenefitServiceCode(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.service_code_excluded'),
                t('notifications.service_code_excluded_detail')
            );
            return res.data;
        });
    };

    const searchBenefitEntityServiceCodes = (entity, id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.searchBenefitEntityServiceCodes(
                entity,
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const searchBenefitServiceCodeGroupExcluded = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res =
                await BenefitService.searchBenefitServiceCodeGroupExcluded(
                    id,
                    payload,
                    params
                );
            return res.data;
        });
    };

    const searchBenefitServicesCodes = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.searchBenefitServicesCodes(
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const updateBenefitServiceCodeGroup = (id, groupId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.updateBenefitServiceCodeGroup(
                id,
                groupId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.benefit_service_code_group_updated'),
                t('notifications.benefit_service_code_group_updated_detail')
            );
            return res.data;
        });
    };

    const updateBenefitServiceCodeGroupBulk = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.updateBenefitServiceCodeGroupBulk(
                id,
                payload
            );
            globalStore.showSuccess(
                t('notifications.benefit_service_code_group_updated'),
                t('notifications.benefit_service_code_group_updated_detail')
            );
            return res.data;
        });
    };

    const updateBenefitIndividualServicesBulk = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res =
                await BenefitService.updateBenefitIndividualServicesBulk(
                    id,
                    payload
                );
            globalStore.showSuccess(
                t('notifications.benefit_service_code_group_updated'),
                t('notifications.benefit_service_code_group_updated_detail')
            );
            return res.data;
        });
    };

    const updateBenefitService = (id, codeId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.updateBenefitService(
                id,
                codeId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.benefit_service_code_group_updated'),
                t('notifications.benefit_service_code_group_updated_detail')
            );
            return res.data;
        });
    };

    const getDuplicatedServices = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.getDuplicatedServices(id);
            return res.data;
        });
    };

    // Benefit groups
    const currentBenefitGroup = ref();

    const setCurrentBenefitGroup = (value) => {
        currentBenefitGroup.value = value;
    };

    const createBenefitGroup = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.createBenefitGroup(payload);
            globalStore.showSuccess(
                t('notifications.benefit_group_created'),
                t('notifications.benefit_group_created_detail')
            );
            return res.data;
        });
    };

    const updateBenefitGroup = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.updateBenefitGroup(id, payload);
            globalStore.showSuccess(
                t('notifications.benefit_group_updated'),
                t('notifications.benefit_group_updated_detail')
            );
            return res.data;
        });
    };

    const updateBenefitGroupBenefitPivot = (
        id,
        benefitId,
        payload,
        shouldShowSuccessNotification = true
    ) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.updateBenefitGroupBenefitPivot(
                id,
                benefitId,
                payload
            );

            if (shouldShowSuccessNotification) {
                globalStore.showSuccess(
                    t('notifications.benefit_updated'),
                    t('notifications.benefit_updated_detail')
                );
            }

            return res.data;
        });
    };

    const getBenefitGroup = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.getBenefitGroup(id);
            return res.data;
        });
    };

    const reloadBenefitGroup = async () => {
        globalStore.actionWrapper(async () => {
            const res = await getBenefitGroup(currentBenefitGroup.value.id);
            setCurrentBenefitGroup(res.data);
            return;
        });
    };

    const searchBenefitGroups = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.searchBenefitGroups(
                payload,
                params
            );
            return res.data;
        });
    };

    const getBenefitGroups = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.getBenefitGroups(params);
            return res.data;
        });
    };

    const updateBenefitGroupStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.updateBenefitGroupStatus(
                id,
                payload
            );
            globalStore.showSuccess(
                t('notifications.benefit_group_updated'),
                t('notifications.benefit_group_updated_detail')
            );
            return res.data;
        });
    };

    const deleteBenefitGroup = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.deleteBenefitGroup(id);
            globalStore.showSuccess(
                t('notifications.benefit_group_deleted'),
                t('notifications.benefit_group_deleted_detail')
            );
            return res.data;
        });
    };

    const syncBenefitGroupWithBenefits = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.syncBenefitGroupWithBenefits(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.benefit_group_synced'),
                t('notifications.benefit_group_synced_detail')
            );
            return res.data;
        });
    };

    const detachBenefitGroupWithBenefits = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.detachBenefitGroupWithBenefits(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.benefit_group_detached'),
                t('notifications.benefit_group_detached_detail')
            );
            return res.data;
        });
    };

    const getAllBenefitCategoryForList = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res =
                await BenefitService.getAllBenefitCategoryForList(payload);
            return res.data;
        });
    };

    const getAllBenefitsByCategory = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.getAllBenefitsByCategory(payload);
            return res.data;
        });
    };

    const searchBenefitGroupPrices = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.searchBenefitGroupPrices(
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const searchBenefitPrices = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.searchBenefitPrices(
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const benefitGroupPricesStore = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.benefitGroupPricesStore(
                id,
                payload
            );
            globalStore.showSuccess(
                t('notifications.benefit_group_price_created'),
                t('notifications.benefit_group_price_created_detail')
            );
            return res.data;
        });
    };

    const benefitPricesStore = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.benefitPricesStore(id, payload);
            globalStore.showSuccess(
                t('notifications.benefit_price_created'),
                t('notifications.benefit_price_created_detail')
            );
            return res.data;
        });
    };

    const benefitGroupPricesDelete = (id, priceId) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.benefitGroupPricesDelete(
                id,
                priceId
            );
            globalStore.showSuccess(
                t('notifications.benefit_group_price_deleted'),
                t('notifications.benefit_group_price_deleted_detail')
            );
            return res.data;
        });
    };

    const benefitPricesDelete = (id, priceId) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.benefitPricesDelete(id, priceId);
            globalStore.showSuccess(
                t('notifications.benefit_price_deleted'),
                t('notifications.benefit_price_deleted_detail')
            );
            return res.data;
        });
    };

    const detachBenefitGroupWithPrices = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.detachBenefitGroupWithPrices(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.benefit_group_price_detached'),
                t('notifications.benefit_group_price_detached_detail')
            );
            return res.data;
        });
    };

    const detachBenefitWithPrices = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.detachBenefitWithPrices(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.benefit_prices_deleted'),
                t('notifications.benefit_prices_deleted_detail')
            );
            return res.data;
        });
    };

    const benefitGroupPricesUpdate = (id, priceId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.benefitGroupPricesUpdate(
                id,
                priceId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.benefit_group_price_updated'),
                t('notifications.benefit_group_price_updated_detail')
            );
            return res.data;
        });
    };

    const benefitPricesUpdate = (id, priceId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.benefitPricesUpdate(
                id,
                priceId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.benefit_price_updated'),
                t('notifications.benefit_price_updated_detail')
            );
            return res.data;
        });
    };

    const publishBenefitGroup = (id, payload, item) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.publishBenefitGroup(id, payload);
            globalStore.showSuccess(
                t('notifications.benefit_group_published'),
                t('notifications.benefit_group_published_detail', {
                    item: item.name[locale.value]
                })
            );
            return res.data;
        });
    };

    const searchBenefitGroupDocuments = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.searchBenefitGroupDocuments(
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const benefitGroupDocumentsDelete = (id, priceId) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.benefitGroupDocumentsDelete(
                id,
                priceId
            );
            globalStore.showSuccess(
                t('notifications.benefit_group_price_deleted'),
                t('notifications.benefit_group_price_deleted_detail')
            );
            return res.data;
        });
    };

    const syncPrices = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await BenefitService.syncPrices(id);
            globalStore.showSuccess(
                t('notifications.sync_prices_toast_header'),
                t('notifications.sync_prices_toast_body')
            );
            return res.data;
        });
    };

    const processPayload = (formData) => {
        return {
            ...formData,
            end_date:
                formData.end_date !== 'Invalid date' ? formData.end_date : null,
            bound: formData.bound?.value,
            type: formData.type?.value
        };
    };

    const processResponse = (response) => {
        return {
            ...response,
            bound: {
                name: t(
                    `plans.${response.bound?.value || response.bound || ''}`
                ),
                value: response.bound?.value || response.bound
            },
            type: {
                name: t(`plans.${response.type?.value || response.type || ''}`),
                value: response.type?.value || response.type
            }
        };
    };

    return {
        currentBenefit,
        setCurrentBenefit,

        searchBenefits,
        getBenefits,
        getBenefit,
        createBenefit,
        updateBenefit,
        publishBenefit,
        deleteBenefit,
        changeBenefitStatus,
        duplicateBenefit,

        searchBenefitCategories,
        getBenefitCategories,
        getBenefitCategory,
        createBenefitCategory,
        updateBenefitCategory,
        updateBenefitCategoryStatus,
        deleteBenefitCategory,
        attachBenefitWithCodeServices,
        attachBenefitWithCodeServicesGroup,
        getBenefitCodeServices,
        getBenefitCodeServicesGroups,
        purgeServiceCodes,
        purgeIndividualServices,
        excludeBenefitServiceCodeGroups,
        includeBenefitServiceCodeGroups,
        searchBenefitEntityServiceCodes,
        searchBenefitServiceCodeGroupExcluded,
        searchBenefitServicesCodes,
        excludeBenefitServiceCode,
        updateBenefitServiceCodeGroup,
        updateBenefitService,
        getDuplicatedServices,

        // Benefit groups
        currentBenefitGroup,
        setCurrentBenefitGroup,

        updateBenefitGroup,
        createBenefitGroup,
        getBenefitGroup,
        getBenefitGroups,
        searchBenefitGroups,
        updateBenefitGroupStatus,
        updateBenefitGroupBenefitPivot,
        searchBenefitGroupBenefits,
        deleteBenefitGroup,
        syncBenefitGroupWithBenefits,
        reloadBenefitGroup,
        detachBenefitGroupWithBenefits,
        searchBenefitGroupPrices,
        searchBenefitPrices,
        benefitGroupPricesStore,
        benefitPricesStore,
        benefitGroupPricesDelete,
        benefitPricesDelete,
        detachBenefitGroupWithPrices,
        detachBenefitWithPrices,
        benefitGroupPricesUpdate,
        benefitPricesUpdate,
        publishBenefitGroup,
        searchBenefitGroupDocuments,
        benefitGroupDocumentsDelete,
        updateBenefitServiceCodeGroupBulk,
        updateBenefitIndividualServicesBulk,
        deleteBenefitCodeGroups,

        getAllBenefitCategoryForList,
        getAllBenefitsByCategory,
        syncPrices,

        processPayload,
        processResponse
    };
});
