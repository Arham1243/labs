import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useGlobalStore } from '@/stores';
import * as AssociatedPlanService from '../services/AssociatedPlan.service';
import lodash from 'lodash';
import { useHelpers } from '@/composables';

export const useAssociatedPlanStore = defineStore('AssociatedPlanStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();
    const helpers = useHelpers();

    const currentPlan = ref();
    const parentPlan = ref();

    const setCurrentPlan = (value) => {
        currentPlan.value = value;
    };

    const setParentPlan = (value) => {
        parentPlan.value = value;
    };

    const getAssociatedPlans = (id, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.getAssociatedPlan(
                id,
                params
            );
            return res.data;
        });
    };

    const getPlan = (id, associatedPlanId, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.getAssociatedPlan(
                id,
                associatedPlanId,
                params
            );
            return res.data;
        });
    };

    const createAssociatedPlan = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.createAssociatedPlan(
                id,
                payload
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_created'),
                t('notifications.associated_plan_created_detail')
            );
            return res.data;
        });
    };

    const updateAssociatedPlan = (id, associatedPlanId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.updateAssociatedPlan(
                id,
                associatedPlanId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_updated'),
                t('notifications.associated_plan_updated_detail')
            );
            return res.data;
        });
    };

    const updateAssociatedPlanSettings = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res =
                await AssociatedPlanService.updateAssociatedPlanSettings(
                    id,
                    payload
                );
            globalStore.showSuccess(
                t('notifications.associated_plan_dependant_settings_created'),
                t(
                    'notifications.associated_plan_dependant_settings_created_detail'
                )
            );
            return res.data;
        });
    };

    const updateAssociatedPlanDependantsSettings = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res =
                await AssociatedPlanService.updateAssociatedPlanDependantsSettings(
                    id,
                    payload
                );
            globalStore.showSuccess(
                t('notifications.associated_plan_dependant_settings_updated'),
                t(
                    'notifications.associated_plan_dependant_settings_updated_detail'
                )
            );
            return res.data;
        });
    };

    const updateAssociatedPlanStatus = (id, associatedPlanId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.updateAssociatedPlanStatus(
                id,
                associatedPlanId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_published'),
                t('notifications.associated_plan_published_detail', {
                    item: `${payload.category?.name} plan`
                })
            );
            return res.data;
        });
    };

    const deleteAssociatedPlan = (id, associatedPlanId) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.deleteAssociatedPlan(
                id,
                associatedPlanId
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_deleted'),
                t('notifications.associated_plan_deleted_detail')
            );
            return res.data;
        });
    };

    const searchBenefits = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.searchBenefits(
                payload,
                params
            );
            return res.data;
        });
    };

    const searchBenefitGroups = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.searchBenefitGroups(
                payload,
                params
            );
            return res.data;
        });
    };

    const attachBenefitGroups = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.attachBenefitGroups(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_benefit_groups_attached'),
                t(
                    'notifications.associated_plan_benefit_groups_attached_detail'
                )
            );
            return res.data;
        });
    };

    const attachBenefits = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.attachBenefits(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_benefit_attached'),
                t('notifications.associated_plan_benefit_attached_detail')
            );
            return res.data;
        });
    };

    const getBenefitGroups = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.getBenefitGroups(id);
            return res.data;
        });
    };

    const getDuplicatedBenefits = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.getDuplicatedBenefits(id);
            return res.data;
        });
    };

    const deleteBenefitGroups = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.deleteBenefitGroups(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_benefit_group_deleted'),
                t('notifications.associated_plan_benefit_group_deleted_detail')
            );
            return res.data;
        });
    };

    const purgeBenefits = (id, numberOfBenefits) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.purgeBenefits(id);
            numberOfBenefits > 1
                ? globalStore.showSuccess(
                      t('notifications.associated_plan_benefits_deleted'),
                      t('notifications.associated_plan_benefits_deleted_detail')
                  )
                : globalStore.showSuccess(
                      t('notifications.associated_plan_benefit_deleted'),
                      t('notifications.associated_plan_benefit_deleted_detail')
                  );
            return res.data;
        });
    };

    const purgeIndividualBenefits = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.purgeIndividualBenefits(id);
            globalStore.showSuccess(
                t('notifications.associated_plan_benefit_deleted'),
                t('notifications.associated_plan_benefit_deleted_detail')
            );
            return res.data;
        });
    };

    const acceptAgreement = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.acceptAgreement(id);
            return res.data;
        });
    };

    const getPlanBenefits = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.getPlanBenefits(
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const deleteBenefits = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.deleteBenefits(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_benefit_deleted'),
                t('notifications.associated_plan_benefit_deleted_detail')
            );
            return res.data;
        });
    };

    const updateIndividualBenefit = (id, benefitId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.updateIndividualBenefit(
                id,
                benefitId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_individual_benefit_updated'),
                t(
                    'notifications.associated_plan_individual_benefit_updated_detail'
                )
            );
            return res.data;
        });
    };

    const searchBenefitGroupsBenefits = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.searchBenefitGroupsBenefits(
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const searchBenefitGroupsBenefitsExcluded = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res =
                await AssociatedPlanService.searchBenefitGroupsBenefitsExcluded(
                    id,
                    payload,
                    params
                );
            return res.data;
        });
    };

    const excludeBenefitGroupBenefits = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.excludeBenefitGroupBenefits(
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

    const includeBenefitGroupBenefits = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.includeBenefitGroupBenefits(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.benefit_group_attached'),
                t('notifications.benefit_group_attached_detail')
            );
            return res.data;
        });
    };

    const updateBenefitGroupBenefit = (id, benefitId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.updateBenefitGroupBenefit(
                id,
                benefitId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_benefit_group_updated'),
                t('notifications.associated_plan_benefit_group_updated_detail')
            );
            return res.data;
        });
    };
    const copyBenefitsFromParent = (planId, associatedPlanId, payload = {}) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.copyBenefitsFromParent(
                planId,
                associatedPlanId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_benefits_copied'),
                t('notifications.associated_plan_benefits_copied_detail')
            );
            return res.data;
        });
    };

    const searchPlanPrices = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.searchPlanPrices(
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const detachPlanWithPrices = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.detachPlanWithPrices(
                id,
                resources
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_price_deleted'),
                t('notifications.associated_plan_price_deleted_detail')
            );
            return res.data;
        });
    };

    const planPricesDelete = (id, priceId) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.planPricesDelete(
                id,
                priceId
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_price_deleted'),
                t('notifications.associated_plan_price_deleted_detail')
            );
            return res.data;
        });
    };

    const planPricesUpdate = (id, priceId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.planPricesUpdate(
                id,
                priceId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_price_updated'),
                t('notifications.associated_plan_price_updated_detail')
            );
            return res.data;
        });
    };

    const planPricesStore = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.planPricesStore(
                id,
                payload
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_price_created'),
                t('notifications.associated_plan_price_created_detail')
            );
            return res.data;
        });
    };

    const updateBenefitGroups = (id, groupId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.updateBenefitGroups(
                id,
                groupId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.associated_plan_benefit_group_updated'),
                t('notifications.associated_plan_benefit_group_updated_detail')
            );
            return res.data;
        });
    };

    const overlapping = (planId, associatedPanId) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.overlapping(
                planId,
                associatedPanId
            );
            return res.data;
        });
    };

    const copyPricingFromParent = (planId, associatedPanId) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.copyPricingFromParent(
                planId,
                associatedPanId
            );

            globalStore.showSuccess(
                t('notifications.associated_plan_pricing_copied'),
                t('notifications.associated_plan_pricing_copied_detail')
            );
            return res.data;
        });
    };

    const deletePlan = (plan, id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.deletePlan(plan, id);
            globalStore.showSuccess(
                t('notifications.plan_deleted'),
                t('notifications.plan_deleted_detail')
            );
            return res.data;
        });
    };

    const updatePlanStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.updatePlanStatus(
                id,
                payload
            );
            globalStore.showSuccess(
                t('notifications.plan_updated'),
                t('notifications.plan_updated_detail')
            );
            return res.data;
        });
    };

    const syncPrices = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AssociatedPlanService.syncPrices(id);
            globalStore.showSuccess(
                t('notifications.sync_prices_toast_header'),
                t('notifications.sync_prices_toast_body')
            );
            return res.data;
        });
    };

    const transferObject = (formData) => {
        formData = lodash.cloneDeep(formData);

        formData.category = {
            name: t('common.' + formData.category),
            code: formData.category
        };

        formData.early_arrivals_periods = formData.early_arrivals_periods?.map(
            (item) => {
                return {
                    days: item.days,
                    plan_period_id: item.plan_period,
                    plan_period_date_reference: {
                        name: t('common.' + item.plan_period_date_reference),
                        value: item.plan_period_date_reference
                    },
                    plan_period_precedence: {
                        name: t(
                            'common.precedence_' + item.plan_period_precedence
                        ),
                        value: item.plan_period_precedence
                    }
                };
            }
        );

        formData.gap_periods = formData.gap_periods?.map((item) => {
            return {
                days: item.days,
                plan_period_id: item.plan_period,
                plan_period_date_reference: {
                    name: t('common.' + item.plan_period_date_reference),
                    value: item.plan_period_date_reference
                },
                plan_period_precedence: {
                    name: t('common.precedence_' + item.plan_period_precedence),
                    value: item.plan_period_precedence
                }
            };
        });

        formData.shouldIncludeNonInsuranceProducts =
            !!formData.non_insurance_products?.length;

        return formData;
    };

    const transferPayload = (formData) => {
        let nonInsuranceProducts = [];
        if (formData.non_insurance_products.length > 0) {
            nonInsuranceProducts = formData.non_insurance_products.map(
                (m) => m.id
            );
        }

        return {
            ...formData,
            authorized_by_id: formData.authorized?.id,
            category: formData.category?.code,
            effective_date:
                formData.effective_date !== 'Invalid date'
                    ? formData.effective_date
                    : null,
            end_date:
                formData.end_date !== 'Invalid date' ? formData.end_date : null,
            early_arrivals_periods: formData.early_arrivals_periods?.map(
                (item) => {
                    return {
                        ...item,
                        plan_period_id: item.plan_period_id?.id,
                        plan_period_date_reference:
                            item.plan_period_date_reference?.value,
                        plan_period_precedence:
                            item.plan_period_precedence?.value
                    };
                }
            ),
            gap_periods: formData.gap_periods?.map((item) => {
                return {
                    ...item,
                    plan_period_id: item.plan_period_id?.id,
                    plan_period_date_reference:
                        item.plan_period_date_reference?.value,
                    plan_period_precedence: item.plan_period_precedence?.value
                };
            }),
            non_insurance_products: nonInsuranceProducts
        };
    };

    const transferDependantSettingsObject = (dependantsSetting) => {
        if (!dependantsSetting) {
            return {
                restrict_eligibility: false,
                time_limit: false
            };
        }

        return {
            ...dependantsSetting,
            pricing_discounts: dependantsSetting.pricing_discounts.map(
                (item) => {
                    return {
                        ...item,
                        condition: {
                            name: t('plans.' + item.condition),
                            code: item.condition
                        }
                    };
                }
            ),
            main_applicant_age_condition: {
                id: dependantsSetting.main_applicant_age_condition,
                name: t(
                    'common.' + dependantsSetting.main_applicant_age_condition
                )
            },
            main_applicant_age_unit: {
                id: dependantsSetting.main_applicant_age_unit,
                name: t('common.' + dependantsSetting.main_applicant_age_unit)
            },
            min_dependant_age_unit: {
                id: dependantsSetting.min_dependant_age_unit,
                name: t('common.' + dependantsSetting.min_dependant_age_unit)
            },
            max_dependant_age_unit: {
                id: dependantsSetting.max_dependant_age_unit,
                name: t('common.' + dependantsSetting.max_dependant_age_unit)
            },
            available_from_unit: {
                id: dependantsSetting.available_from_unit,
                name: t('common.' + dependantsSetting.available_from_unit)
            },
            available_from_condition: {
                id: dependantsSetting.available_from_condition,
                name: t('common.' + dependantsSetting.available_from_condition)
            },
            available_from_value: setAvailableFromValue(
                dependantsSetting.available_from_value,
                dependantsSetting.available_from_value_id
            ),
            available_until_unit: {
                id: dependantsSetting.available_until_unit,
                name: t('common.' + dependantsSetting.available_until_unit)
            },
            available_until_condition: {
                id: dependantsSetting.available_until_condition,
                name: t('common.' + dependantsSetting.available_until_condition)
            },
            available_until_value: setAvailableFromValue(
                dependantsSetting.available_until_value,
                dependantsSetting.available_until_value_id
            )
        };
    };

    const setAvailableFromValue = (value, period) => {
        if (value === 'policy_start') {
            return { id: 'policy_start', name: t('common.policy_start') };
        }

        if (value === 'policy_end_date') {
            return { id: 'policy_end_date', name: t('common.policy_end_date') };
        }

        if (value?.includes('plan_period_start_date')) {
            return {
                id: 'plan_period_start_date_' + period.id,
                name:
                    period.name +
                    ' Start Date (' +
                    helpers.formatDate(period.start_date, 'DD-MMM') +
                    ')'
            };
        }

        if (value?.includes('plan_period_end_date')) {
            return {
                id: 'plan_period_end_date_' + period.id,
                name:
                    period.name +
                    ' End Date (' +
                    helpers.formatDate(period.end_date, 'DD-MMM') +
                    ')'
            };
        }
    };

    const transferDependantSettingsPayload = (formData) => {
        const pricingDiscounts = formData.pricing_discounts.map((item) => {
            return {
                ...item,
                condition: item.condition.code
            };
        });

        return {
            ...formData,
            pricing_discounts: pricingDiscounts,
            main_applicant_age_condition:
                formData.main_applicant_age_condition?.id,
            main_applicant_age_unit: formData.main_applicant_age_unit?.id,
            min_dependant_age_unit: formData.min_dependant_age_unit?.id,
            max_dependant_age_unit: formData.max_dependant_age_unit?.id,
            available_from_condition: formData.available_from_condition?.id,
            available_from_unit: formData.available_from_unit?.id,
            available_from_value: getAvailableFromValue(
                formData.available_from_value?.id
            ),
            available_from_value_id: getAvailableFromValueId(
                formData.available_from_value?.id
            ),
            available_until_condition: formData.available_until_condition?.id,
            available_until_unit: formData.available_until_unit?.id,
            available_until_value: getAvailableFromValue(
                formData.available_until_value?.id
            ),
            available_until_value_id: getAvailableFromValueId(
                formData.available_until_value?.id
            )
        };
    };

    const getAvailableFromValue = (value) => {
        if (!value) {
            return null;
        }

        if (value === 'policy_start') {
            return 'policy_start';
        }

        if (value === 'policy_end_date') {
            return 'policy_end_date';
        }

        if (value?.includes('plan_period_start_date_')) {
            return 'plan_period_start_date'; //value.split('_')[4];
        }

        if (value?.includes('plan_period_end_date_')) {
            return 'plan_period_end_date'; // value.split('_')[4];
        }
    };

    const getAvailableFromValueId = (value) => {
        if (!value) {
            return null;
        }

        if (value.includes('plan_period_start_date_')) {
            return value.split('_')[4];
        }

        if (value.includes('plan_period_end_date_')) {
            return value.split('_')[4];
        }

        return null;
    };

    return {
        currentPlan,
        parentPlan,
        getPlan,
        setParentPlan,
        getAssociatedPlans,
        createAssociatedPlan,
        updateAssociatedPlan,
        updateAssociatedPlanStatus,
        updateAssociatedPlanDependantsSettings,
        deleteAssociatedPlan,

        setCurrentPlan,
        searchBenefits,
        searchBenefitGroups,
        attachBenefitGroups,
        attachBenefits,
        getBenefitGroups,
        getDuplicatedBenefits,
        deleteBenefitGroups,
        purgeIndividualBenefits,
        purgeBenefits,
        getPlanBenefits,
        deleteBenefits,
        updateIndividualBenefit,
        acceptAgreement,

        updateBenefitGroupBenefit,
        includeBenefitGroupBenefits,
        excludeBenefitGroupBenefits,
        searchBenefitGroupsBenefitsExcluded,
        searchBenefitGroupsBenefits,
        copyBenefitsFromParent,
        searchPlanPrices,
        detachPlanWithPrices,
        planPricesDelete,
        planPricesUpdate,
        planPricesStore,
        updateBenefitGroups,
        overlapping,
        copyPricingFromParent,
        deletePlan,
        updatePlanStatus,
        updateAssociatedPlanSettings,
        syncPrices,

        transferObject,
        transferPayload,

        transferDependantSettingsObject,
        transferDependantSettingsPayload
    };
});
