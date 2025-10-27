import lodash from 'lodash';
import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';

import { useGlobalStore } from '@/stores';
import * as PlanService from '../services/Plan.service';
import * as BenefitService from '@/modules/plans/services/Benefit.service.js';

export const usePlanStore = defineStore('PlanStore', () => {
    const globalStore = useGlobalStore();
    const { t, locale } = useI18n();

    const currentPlan = ref();
    const currentAssociatedPlan = ref();

    const setCurrentPlan = (value) => {
        currentPlan.value = value;
    };

    const setCurrentAssociatedPlan = (value) => {
        currentAssociatedPlan.value = value;
    };

    const getPlans = () => {
        return [];
    };

    const searchPlans = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.searchPlans(payload, params);
            return res.data;
        });
    };

    const searchPlanByBusinessUnitUuids = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.searchPlanByBusinessUnitUuids(
                payload,
                params
            );
            return res.data;
        });
    };

    const searchBenefitGroupsBenefits = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.searchBenefitGroupsBenefits(
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const searchBenefitGroupsBenefitsExcluded = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.searchBenefitGroupsBenefitsExcluded(
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const getPlan = (id, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.getPlan(id, params);
            return res.data;
        });
    };

    const createPlan = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.createPlan(payload);
            globalStore.showSuccess(
                t('notifications.plan_created'),
                t('notifications.plan_created_detail')
            );
            return res.data;
        });
    };

    const updatePlan = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.updatePlan(id, payload);
            globalStore.showSuccess(
                t('notifications.plan_updated'),
                t('notifications.plan_updated_detail')
            );
            return res.data;
        });
    };

    const updatePlanStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.updatePlanStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.plan_updated'),
                t('notifications.plan_updated_detail')
            );
            return res.data;
        });
    };

    const deletePlan = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.deletePlan(id);
            globalStore.showSuccess(
                t('notifications.plan_deleted'),
                t('notifications.plan_deleted_detail')
            );
            return res.data;
        });
    };

    const searchBenefits = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.searchBenefits(payload, params);
            return res.data;
        });
    };

    const searchBenefitGroups = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.searchBenefitGroups(payload, params);
            return res.data;
        });
    };

    const attachBenefits = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.attachBenefits(id, resources);
            globalStore.showSuccess(
                t('notifications.plan_benefit_attached'),
                t('notifications.plan_benefit_attached_detail')
            );
            return res.data;
        });
    };

    const attachBenefitGroups = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.attachBenefitGroups(id, resources);
            globalStore.showSuccess(
                t('notifications.plan_benefit_groups_attached'),
                t('notifications.plan_benefit_groups_attached_detail')
            );
            return res.data;
        });
    };

    const getBenefitGroups = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.getBenefitGroups(id);
            return res.data;
        });
    };

    const getDuplicatedBenefits = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.getDuplicatedBenefits(id);
            return res.data;
        });
    };

    const getPlanBenefits = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.getPlanBenefits(id, payload, params);
            return res.data;
        });
    };

    const deleteBenefitGroups = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.deleteBenefitGroups(id, resources);
            globalStore.showSuccess(
                t('notifications.plan_benefit_group_deleted'),
                t('notifications.plan_benefit_group_deleted_detail')
            );
            return res.data;
        });
    };

    const updateBenefitGroups = (id, groupId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.updateBenefitGroups(
                id,
                groupId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.plan_benefit_group_updated'),
                t('notifications.plan_benefit_group_updated_detail')
            );
            return res.data;
        });
    };

    const deleteBenefits = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.deleteBenefits(id, resources);
            globalStore.showSuccess(
                t('notifications.plan_benefit_deleted'),
                t('notifications.plan_benefit_deleted_detail')
            );
            return res.data;
        });
    };

    const purgeBenefits = (id, numberOfBenefits) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.purgeBenefits(id);
            numberOfBenefits > 1
                ? globalStore.showSuccess(
                      t('notifications.plan_benefits_deleted'),
                      t('notifications.plan_benefits_deleted_detail')
                  )
                : globalStore.showSuccess(
                      t('notifications.plan_benefit_deleted'),
                      t('notifications.plan_benefit_deleted_detail')
                  );
            return res.data;
        });
    };

    const purgeIndividualBenefits = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.purgeIndividualBenefits(id);
            globalStore.showSuccess(
                t('notifications.plan_benefit_deleted'),
                t('notifications.plan_benefit_deleted_detail')
            );
            return res.data;
        });
    };

    const excludeBenefitGroupBenefits = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.excludeBenefitGroupBenefits(
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
            const res = await PlanService.includeBenefitGroupBenefits(
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

    const updateIndividualBenefit = (id, benefitId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.updateIndividualBenefit(
                id,
                benefitId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.plan_individual_benefit_updated'),
                t('notifications.plan_individual_benefit_updated_detail')
            );
            return res.data;
        });
    };

    const updateBenefitGroupBenefit = (id, benefitId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.updateBenefitGroupBenefit(
                id,
                benefitId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.plan_benefit_group_updated'),
                t('notifications.plan_benefit_group_updated_detail')
            );
            return res.data;
        });
    };

    const planPricesUpdate = (id, priceId, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.planPricesUpdate(
                id,
                priceId,
                payload
            );
            globalStore.showSuccess(
                t('notifications.plan_price_updated'),
                t('notifications.plan_price_updated_detail')
            );
            return res.data;
        });
    };

    const planPricesStore = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.planPricesStore(id, payload);
            globalStore.showSuccess(
                t('notifications.plan_price_created'),
                t('notifications.plan_price_created_detail')
            );
            return res.data;
        });
    };

    const searchPlanPrices = (id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.searchPlanPrices(id, payload, params);
            return res.data;
        });
    };

    const detachPlanWithPrices = (id, resources) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.detachPlanWithPrices(id, resources);
            globalStore.showSuccess(
                t('notifications.plan_price_deleted'),
                t('notifications.plan_price_deleted_detail')
            );
            return res.data;
        });
    };

    const planPricesDelete = (id, priceId) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.planPricesDelete(id, priceId);
            globalStore.showSuccess(
                t('notifications.plan_price_deleted'),
                t('notifications.plan_price_deleted_detail')
            );
            return res.data;
        });
    };

    const publishPlan = (id, payload, item) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.publishPlan(id, payload);
            globalStore.showSuccess(
                t('notifications.plan_published'),
                t('notifications.plan_published_detail', {
                    item: item.name[locale.value]
                })
            );
            return res.data;
        });
    };

    const acceptAgreement = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.acceptAgreement(id);
            return res.data;
        });
    };

    const transferObject = (formData) => {
        const data = lodash.cloneDeep(formData);

        data.periods = lodash.cloneDeep(data.periods || []);

        data.cancellation_periods = (data.periods || [])
            .map((item) => item.cancellation_periods || [])
            .flat()
            .map((item) => ({
                ...item,
                name: {
                    name: lodash.truncate(item?.name || '', { length: 20 }),
                    value: item?.name
                },
                plan_period_precedence: {
                    name: t(
                        `common.precedence_${item?.plan_period_precedence}`
                    ),
                    value: item?.plan_period_precedence
                },
                plan_period_date_reference: {
                    name: t(`common.${item?.plan_period_date_reference}`),
                    value: item?.plan_period_date_reference
                }
            }));

        data.extension_periods = (data.periods || [])
            .map((item) => item.extension_periods || [])
            .flat()
            .map((item) => ({
                ...item,
                name: {
                    name: lodash.truncate(item?.name || '', { length: 20 }),
                    value: item?.name
                },
                plan_period_precedence: {
                    name: t(
                        `common.precedence_${item?.plan_period_precedence}`
                    ),
                    value: item?.plan_period_precedence
                },
                plan_period_date_reference: {
                    name: t(`common.${item?.plan_period_date_reference}`),
                    value: item?.plan_period_date_reference
                }
            }));

        data.early_return_periods = (data.periods || [])
            .map((item) => item.early_return_periods || [])
            .flat()
            .map((item) => ({
                ...item,
                name: {
                    name: lodash.truncate(item?.name || '', { length: 20 }),
                    value: item?.name
                },
                plan_period_precedence: {
                    name: t(
                        `common.precedence_${item?.plan_period_precedence}`
                    ),
                    value: item?.plan_period_precedence
                },
                plan_period_date_reference: {
                    name: t(`common.${item?.plan_period_date_reference}`),
                    value: item?.plan_period_date_reference
                }
            }));

        data.cancellation_type =
            data.cancellation_type && data.is_cancellations
                ? {
                      name: t(
                          `common.policy_action_type_${(
                              data.cancellation_type || ''
                          ).toLowerCase()}`
                      ),
                      value: data.cancellation_type
                  }
                : {
                      name: t(`common.policy_action_type_open`),
                      value: 'open'
                  };

        data.extension_type =
            data.extension_type && data.is_extensions
                ? {
                      name: data.extension_type
                          ? t(
                                `common.policy_action_type_${(
                                    data.extension_type || ''
                                ).toLowerCase()}`
                            )
                          : '',
                      value: data.extension_type
                  }
                : {
                      name: t(`common.policy_action_type_open`),
                      value: 'open'
                  };

        data.early_return_type =
            data.early_return_type && data.is_early_returns
                ? {
                      name: data.early_return_type
                          ? t(
                                `common.policy_action_type_${(
                                    data.early_return_type || ''
                                ).toLowerCase()}`
                            )
                          : '',
                      value: data.early_return_type
                  }
                : {
                      name: t(`common.policy_action_type_open`),
                      value: 'open'
                  };

        data.bound = {
            name: t(`plans.${data.bound?.value || data.bound || ''}`),
            value: data.bound?.value || data.bound
        };

        data.type = {
            name: t(`plans.${data.type?.value || data.type || ''}`),
            value: data.type?.value || data.type
        };

        if (data.enrolment_period_type) {
            data.enrolment_period_type = {
                id: data.enrolment_period_type,
                name: t(`common.${data.enrolment_period_type}`)
            };
        }
        if (data.minimum_age_type) {
            data.minimum_age_type = {
                id: data.minimum_age_type,
                name: t(`common.${data.minimum_age_type}`)
            };
        }
        if (data.maximum_age_type) {
            data.maximum_age_type = {
                id: data.maximum_age_type,
                name: t(`common.${data.maximum_age_type}`)
            };
        }
        if (data.policy_term_type) {
            data.policy_term_type = {
                id: data.policy_term_type,
                name: t(`common.${data.policy_term_type}`)
            };
        }
        data.shouldIncludeNonInsuranceProducts = formData.non_insurance_products
            ?.length
            ? true
            : false;

        return data;
    };

    const transferPayload = (formData, selectedPlan) => {
        let periods = [];
        formData.periods.map((item) => {
            periods.push(item);
        });

        let cancellation_periods = [];
        if (formData.cancellation_type?.value === 'fixed') {
            formData.cancellation_periods.map((item) => {
                cancellation_periods.push({
                    ...item,
                    name: item.name?.value,
                    plan_period_precedence: item.plan_period_precedence?.value,
                    plan_period_date_reference:
                        item.plan_period_date_reference?.value
                });
            });
        }
        let extension_periods = [];
        if (formData.extension_type?.value === 'fixed') {
            formData.extension_periods.map((item) => {
                extension_periods.push({
                    ...item,
                    name: item.name?.value,
                    plan_period_precedence: item.plan_period_precedence?.value,
                    plan_period_date_reference:
                        item.plan_period_date_reference?.value
                });
            });
        }
        let early_return_periods = [];
        if (formData.early_return_type?.value === 'fixed') {
            formData.early_return_periods.map((item) => {
                early_return_periods.push({
                    ...item,
                    name: item.name?.value,
                    plan_period_precedence: item.plan_period_precedence?.value,
                    plan_period_date_reference:
                        item.plan_period_date_reference?.value
                });
            });
        }
        if (selectedPlan?.id) {
            formData.source_plan_id = selectedPlan?.id;
        }
        let nonInsuranceProducts = [];
        if (formData.non_insurance_products.length > 0) {
            nonInsuranceProducts = formData.non_insurance_products.map(
                (m) => m.id
            );
        }

        return {
            ...formData,
            bound: formData.bound?.value,
            type: formData.type?.value,
            maximum_age_type: formData.maximum_age_type?.id,
            minimum_age_type: formData.minimum_age_type?.id,
            enrolment_period_type: formData.enrolment_period_type?.id,
            policy_term_type: formData.policy_term_type?.id,
            authorized_by_id: formData.authorized?.id,
            effective_date:
                formData.effective_date !== 'Invalid date'
                    ? formData.effective_date
                    : null,
            end_date:
                formData.end_date !== 'Invalid date' ? formData.end_date : null,
            periods,
            cancellation_periods,
            extension_periods,
            early_return_periods,
            cancellation_type: formData.cancellation_type?.value,
            extension_type: formData.extension_type?.value,
            early_return_type: formData.early_return_type?.value,
            non_insurance_products: nonInsuranceProducts
        };
    };

    const createAssociatedPlan = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.createAssociatedPlan(payload);
            globalStore.showSuccess(
                t('notifications.plan_created'),
                t('notifications.plan_created_detail')
            );
            return res.data;
        });
    };

    const updateAssociatedPlan = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.updateAssociatedPlan(id, payload);
            globalStore.showSuccess(
                t('notifications.plan_updated'),
                t('notifications.plan_updated_detail')
            );
            return res.data;
        });
    };

    const syncPrices = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.syncPrices(id);
            globalStore.showSuccess(
                t('notifications.sync_prices_toast_header'),
                t('notifications.sync_prices_toast_body')
            );
            return res.data;
        });
    };

    const mapPlanPeriodsToFixedWindowPeriods = (planPeriods) => {
        return (planPeriods ?? []).map((planPeriod) => ({
            plan_period_id: planPeriod.id,
            name: planPeriod.name,
            start_date: planPeriod.start_date,
            end_date: planPeriod.end_date
        }));
    };

    const mapPlanPeriodsToEligibilityPeriods = (planPeriods) => {
        return (planPeriods ?? []).map((planPeriod) => ({
            plan_period_id: planPeriod.id,
            name: planPeriod.name,
            start_date: planPeriod.start_date,
            end_date: planPeriod.end_date,
            allow_full_cancellation: false,
            cancellation_period_type: null,
            cancellation_period_date: null,
            cancellation_period_duration: 0,
            cancellation_period_unit: null
        }));
    };

    const transferAlternateInsurancePayload = (formData) => {
        const clonedFormData = lodash.cloneDeep(formData);

        let fixedWindowPeriods = clonedFormData.fixed_window_periods ?? [];

        fixedWindowPeriods.forEach((item) => {
            if (item.start_date === 'Invalid date') {
                item.start_date = null;
            }
            if (item.end_date === 'Invalid date') {
                item.end_date = null;
            }
        });

        let eligibilityPeriods = clonedFormData.eligibility_periods ?? [];

        eligibilityPeriods.forEach((item) => {
            if (item.start_date === 'Invalid date') {
                item.start_date = null;
            }
            if (item.end_date === 'Invalid date') {
                item.end_date = null;
            }
            if (item.cancellation_period_date === 'Invalid date') {
                item.cancellation_period_date = null;
            }
        });

        if (
            clonedFormData.automatic_cancellation_custom_date === 'Invalid date'
        ) {
            clonedFormData.automatic_cancellation_custom_date = null;
        }

        return {
            ...clonedFormData
        };
    };

    const createAlternateInsurance = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.createAlternateInsurance(id, payload);
            globalStore.showSuccess(
                t('notifications.plan_created'),
                t('notifications.plan_created_detail')
            );
            return res.data;
        });
    };

    const updateAlternateInsurance = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.updateAlternateInsurance(id, payload);
            globalStore.showSuccess(
                t('notifications.plan_updated'),
                t('notifications.plan_updated_detail')
            );
            return res.data;
        });
    };

    const getAlternateInsuranceFormData = () => {
        const clonedCurrentPlan = lodash.cloneDeep(currentPlan.value);

        if (clonedCurrentPlan.alternate_insurance) {
            return clonedCurrentPlan.alternate_insurance;
        }

        return {
            date_visibility_type: 'fixed_window',
            allow_automatic_cancellation: false,
            automatic_cancellation_condition: null,
            automatic_cancellation_custom_date: null,
            requires_alternate_insurance_info: false,
            allow_opt_out_resubmissions: false,
            requires_proof_of_coverage: false,
            allow_direct_refund_to_student: false,
            direct_refund_options: [],
            allow_late_opt_outs: false,
            late_opt_out_duration: 0,
            late_opt_out_unit: 'days',
            send_notifications: false,
            fixed_window_periods: mapPlanPeriodsToFixedWindowPeriods(
                clonedCurrentPlan.periods
            ),
            eligibility_periods: mapPlanPeriodsToEligibilityPeriods(
                clonedCurrentPlan.periods
            )
        };
    };

    const createOrUpdateAlternateInsurance = async (formData) => {
        if (currentPlan.value.alternate_insurance) {
            await updateAlternateInsurance(
                currentPlan.value.id,
                transferAlternateInsurancePayload(formData)
            );
        } else {
            await createAlternateInsurance(
                currentPlan.value.id,
                transferAlternateInsurancePayload(formData)
            );
        }
    };

    const updateContributorPrice = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PlanService.updateContributors(id, payload);
            globalStore.showSuccess(
                t('notifications.contributor_price_updated'),
                t('notifications.contributor_price_updated_detail')
            );
            return res.data;
        });
    };

    return {
        currentPlan,
        currentAssociatedPlan,

        setCurrentPlan,
        setCurrentAssociatedPlan,
        searchPlans,
        searchPlanByBusinessUnitUuids,
        getPlans,
        getPlan,
        createPlan,
        updatePlan,
        updatePlanStatus,
        deletePlan,
        searchBenefits,
        searchBenefitGroups,
        attachBenefits,
        attachBenefitGroups,
        getBenefitGroups,
        getDuplicatedBenefits,
        getPlanBenefits,
        deleteBenefitGroups,
        updateBenefitGroups,
        deleteBenefits,
        purgeBenefits,
        purgeIndividualBenefits,
        searchBenefitGroupsBenefits,
        searchBenefitGroupsBenefitsExcluded,
        excludeBenefitGroupBenefits,
        includeBenefitGroupBenefits,
        updateIndividualBenefit,
        updateBenefitGroupBenefit,
        planPricesUpdate,
        planPricesStore,
        searchPlanPrices,
        detachPlanWithPrices,
        planPricesDelete,
        publishPlan,
        acceptAgreement,
        transferObject,
        transferPayload,
        createAssociatedPlan,
        updateAssociatedPlan,
        syncPrices,
        updateContributorPrice,
        mapPlanPeriodsToFixedWindowPeriods,
        mapPlanPeriodsToEligibilityPeriods,
        transferAlternateInsurancePayload,
        getAlternateInsuranceFormData,
        createOrUpdateAlternateInsurance,

        createAlternateInsurance,
        updateAlternateInsurance
    };
});
