<script setup>
import lodash from 'lodash';
import { useI18n } from 'vue-i18n';
import { onBeforeMount, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import { usePlanStore } from '@/modules/plans/stores/Plan';

import PlanDetailsForm from '@/modules/plans/components/plans/associated/forms/PlanDetailsForm.vue';
import PlanDatesForm from '@/modules/plans/components/plans/associated/forms/PlanDatesForm.vue';
import PlanRecentGraduateForm from '@/modules/plans/components/plans/associated/forms/PlanRecentGraduateForm.vue';
import SectionPlanDetails from '@/modules/plans/components/plans/associated/partials/SectionPlanDetails.vue';
import useEventsBus from '@/composables/event-bus';
import { useClientStore } from '@/modules/clients/stores';
import { useHelpers } from '@/composables';
import BundlesForm from '@/modules/plans/components/plans/forms/BundlesForm.vue';
import SyncPricesDialog from '@/modules/plans/components/shared/AttachBenefit/dialogs/SyncPricesDialog.vue';

const props = defineProps({
    plan: {
        type: String,
        required: true
    },
    id: {
        type: String,
        required: true
    }
});

const route = useRoute();
const router = useRouter();
const planStore = usePlanStore();
const clientStore = useClientStore();
const associatedPlanStore = useAssociatedPlanStore();

const helpers = useHelpers();

const { t } = useI18n();
const { emit } = useEventsBus();

const emits = defineEmits(['showConfirmation']);

const showUnsavedData = ref(false);
const loadingPlan = ref(false);
const planDetails = ref({});

const openSyncPricesDialog = ref(false);
const nonInsuranceProductActionType = ref('');
const originalNonInsuranceProduct = ref([]);
const nonInsuranceProductChangeAction = ref(null);

const busy = ref(false);
const formData = ref({
    effective_date: null,
    end_date: null,
    category: null,
    early_arrivals_type: 'open',
    gap_type: 'open',
    early_arrivals_periods: [],
    gap_periods: [],
    category_code: '',
    non_insurance_products: [],
    shouldIncludeNonInsuranceProducts: false
});

onBeforeMount(async () => {
    await getAssociatedPlan();
    if (formData.value?.non_insurance_products) {
        originalNonInsuranceProduct.value = [
            ...formData.value.non_insurance_products
        ];
    }
});

const handleBack = () => {
    showUnsavedData.value = true;
    emits('showConfirmation');
};

const getPlan = async () => {
    const res = await planStore.getPlan(props.plan, {
        include: 'businessUnit,periods'
    });

    const clientRes = await clientStore.getBusinessUnit(
        res.data.business_unit.id
    );
    associatedPlanStore.setParentPlan({
        ...res.data,
        business_unit: clientRes.data
    });
    planDetails.value = res.data;
};

const getAssociatedPlan = async () => {
    loadingPlan.value = true;
    await getPlan();
    if (route.params.id == '-1') {
        associatedPlanStore.setCurrentPlan(null);
        loadingPlan.value = false;
        return;
    }

    const res = await associatedPlanStore.getPlan(
        route.params.plan,
        route.params.id,
        {
            include:
                'authorized,gapPeriods.planPeriod,earlyArrivalPeriods.planPeriod,nonInsuranceProducts',
            'aggregates[0][relation]': 'benefits',
            'aggregates[0][type]': 'count',
            'aggregates[1][relation]': 'benefitGroupBenefits',
            'aggregates[1][type]': 'count'
        }
    );
    loadingPlan.value = false;

    associatedPlanStore.setCurrentPlan(lodash.cloneDeep(res.data));
    formData.value = lodash.cloneDeep(res.data);

    if (formData.value?.non_insurance_products) {
        originalNonInsuranceProduct.value = [
            ...formData.value.non_insurance_products
        ];
    }

    formData.value.category = {
        name: t('common.' + formData.value.category),
        code: formData.value.category
    };

    formData.value.early_arrivals_periods =
        res.data.early_arrivals_periods?.map((item) => ({
            days: item.days,
            plan_period_id: item.plan_period,
            plan_period_date_reference: {
                name: `${t('common.' + item.plan_period_date_reference)} (${
                    item.plan_period && item.plan_period_date_reference
                        ? helpers.formatDate(
                              item.plan_period[item.plan_period_date_reference],
                              'D MMM'
                          )
                        : ''
                })`,
                value: item.plan_period_date_reference
            },
            plan_period_precedence: {
                name: t('common.precedence_' + item.plan_period_precedence),
                value: item.plan_period_precedence
            }
        }));

    formData.value.gap_periods = res.data.gap_periods?.map((item) => ({
        days: item.days,
        plan_period_id: item.plan_period,
        plan_period_date_reference: {
            name: `${t('common.' + item.plan_period_date_reference)} (${
                item.plan_period && item.plan_period_date_reference
                    ? helpers.formatDate(
                          item.plan_period[item.plan_period_date_reference],
                          'D MMM'
                      )
                    : ''
            })`,
            value: item.plan_period_date_reference
        },
        plan_period_precedence: {
            name: t('common.precedence_' + item.plan_period_precedence),
            value: item.plan_period_precedence
        }
    }));
};

const save = async () => {
    try {
        busy.value = true;
        props.id === '-1' ? await create() : await update();

        if (
            props.id === '-1' &&
            formData.value.category.code === 'dependants'
        ) {
            emit('setDependantStep');
        }
    } finally {
        busy.value = false;
    }
};

const create = async () => {
    let nonInsuranceProducts = [];
    if (formData.value.non_insurance_products.length > 0) {
        nonInsuranceProducts = formData.value.non_insurance_products.map(
            (m) => m.id
        );
    }
    const res = await associatedPlanStore.createAssociatedPlan(
        planDetails.value.id,
        {
            ...formData.value,
            effective_date:
                formData.value.effective_date !== 'Invalid date'
                    ? formData.value.effective_date
                    : null,
            end_date:
                formData.value.end_date !== 'Invalid date'
                    ? formData.value.end_date
                    : null,
            authorized_by_id: formData.value.authorized?.id,
            category: formData.value.category?.code,
            early_arrivals_periods: formData.value.early_arrivals_periods?.map(
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
            gap_periods: formData.value.gap_periods?.map((item) => {
                return {
                    ...item,
                    plan_period_id: item.plan_period_id?.id,
                    plan_period_date_reference:
                        item.plan_period_date_reference?.value,
                    plan_period_precedence: item.plan_period_precedence?.value
                };
            }),
            non_insurance_products: nonInsuranceProducts
        }
    );

    goNext(res);
};

const update = async () => {
    const hasNonInsuranceProductChanges = checkForNonInsuranceProductChanges();
    let nonInsuranceProducts = [];
    if (formData.value.non_insurance_products.length > 0) {
        nonInsuranceProducts = formData.value.non_insurance_products.map(
            (m) => m.id
        );
    }
    const res = await associatedPlanStore.updateAssociatedPlan(
        planDetails.value.id,
        associatedPlanStore.currentPlan.id,
        {
            ...formData.value,
            effective_date:
                formData.value.effective_date !== 'Invalid date'
                    ? formData.value.effective_date
                    : null,
            end_date:
                formData.value.end_date !== 'Invalid date'
                    ? formData.value.end_date
                    : null,
            authorized_by_id: formData.value.authorized?.id,
            category: formData.value.category?.code,
            early_arrivals_periods: formData.value.early_arrivals_periods?.map(
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
            gap_periods: formData.value.gap_periods?.map((item) => {
                return {
                    ...item,
                    plan_period_id: item.plan_period_id?.id,
                    plan_period_date_reference:
                        item.plan_period_date_reference?.value,
                    plan_period_precedence: item.plan_period_precedence?.value
                };
            }),
            non_insurance_products: nonInsuranceProducts
        }
    );

    if (hasNonInsuranceProductChanges) {
        await handleNonInsuranceProductChangesInUpdate(res);
    } else {
        goNext(res);
    }
};

const checkForNonInsuranceProductChanges = () => {
    if (
        !originalNonInsuranceProduct.value ||
        !formData.value.non_insurance_products
    ) {
        return false;
    }

    const originalIds = originalNonInsuranceProduct.value
        .map((m) => m.id)
        .sort();
    const currentIds = formData.value.non_insurance_products
        .map((m) => m.id)
        .sort();

    if (originalIds.length !== currentIds.length) {
        return true;
    }

    for (let i = 0; i < originalIds.length; i++) {
        if (originalIds[i] !== currentIds[i]) {
            return true;
        }
    }

    return false;
};

const handleNonInsuranceProductChangesInUpdate = async (res) => {
    associatedPlanStore.setCurrentPlan(res.data);
    const originalIds = originalNonInsuranceProduct.value.map((m) => m.id);
    const currentIds = formData.value.non_insurance_products.map((m) => m.id);
    nonInsuranceProductActionType.value =
        currentIds.length > originalIds.length
            ? 'added'
            : currentIds.length < originalIds.length
              ? 'removed'
              : 'changed';
    try {
        let prices = await associatedPlanStore.searchPlanPrices(
            props.id,
            {},
            {}
        );
        if (
            prices.data &&
            Array.isArray(prices.data) &&
            prices.data.length > 0
        ) {
            openSyncPricesDialog.value = true;
        } else {
            await syncPricesDirectly();
            await router.push({
                name: 'New Associated Plan Step 2',
                params: { id: props.id, plan: props.plan }
            });
        }
    } catch (error) {
        console.error('Error checking prices:', error);
    }
};

const handleNonInsuranceProductChanged = (event) => {
    nonInsuranceProductChangeAction.value = event.action;
};

const syncPricesDirectly = async () => {
    try {
        await associatedPlanStore.syncPrices(props.id);
        const res = await associatedPlanStore.getPlan(props.plan, props.id);
        associatedPlanStore.setCurrentPlan(res.data);
    } catch (error) {
        console.error('Error syncing prices:', error);
    }
};

const handleSyncDialogClose = async () => {
    openSyncPricesDialog.value = false;
    nonInsuranceProductActionType.value = '';
    router.push({
        name: 'New Associated Plan Step 2',
        params: { id: props.id, plan: props.plan }
    });
};

const goNext = (res) => {
    associatedPlanStore.setCurrentPlan(res.data);
    if (nonInsuranceProductChangeAction.value && props.id === '-1') {
        emit('openSyncPricesDialog', nonInsuranceProductChangeAction.value);
    }
    router.push({
        name: 'New Associated Plan Step 2',
        params: { id: res.data.id, plan: props.plan }
    });
};

const goBack = () => {
    router.push({
        name: 'Business Unit Details',
        params: {
            clientId: associatedPlanStore.parentPlan.business_unit.client.id,
            id: associatedPlanStore.parentPlan.business_unit.id
        }
    });
};
</script>

<template>
    <Loader v-if="loadingPlan" />
    <div v-else>
        <div class="grid grid-cols-12 mt-12 gap-8">
            <div class="col-span-7">
                <Card class="mb-4">
                    <template #content>
                        <div class="flex justify-between">
                            <h5 data-testid="plan-details-title" class="mb-6">
                                {{ $t('plans.plan_details') }}
                            </h5>
                        </div>
                        <PlanDetailsForm is-new v-model="formData" />
                    </template>
                </Card>
                <Card
                    class="mb-12"
                    v-if="
                        ['gap', 'early_arrivals'].includes(
                            formData.category?.code
                        )
                    "
                >
                    <template #content>
                        <div class="flex justify-between">
                            <h5 class="mb-4">
                                {{ formData.category.name }}
                                {{ $t('common.settings') }}
                            </h5>
                        </div>
                        <PlanDatesForm
                            is-new
                            v-model="formData"
                            :planCategory="formData.category.code"
                            :periods="planDetails.periods"
                        />
                    </template>
                </Card>
                <Card
                    class="mb-4"
                    v-if="['recent_graduate'].includes(formData.category?.code)"
                >
                    <template #content>
                        <div class="flex justify-between mb-4">
                            <h5>
                                {{ formData.category.name }}
                                {{ $t('common.settings') }}
                            </h5>
                        </div>
                        <PlanRecentGraduateForm is-new v-model="formData" />
                    </template>
                </Card>
                <Card class="mb-4">
                    <template #content>
                        <h5
                            data-testid="bundle-non-insurance-product-title"
                        >
                            {{ $t('plans.bundles') }}
                        </h5>
                        <BundlesForm
                            is-new
                            v-model="formData"
                            @nonInsuranceProductChanged="
                                handleNonInsuranceProductChanged
                            "
                        />
                    </template>
                </Card>
            </div>
            <div class="col-span-5">
                <Loader v-if="loadingPlan" />
                <SectionPlanDetails v-else :plan="planDetails" />
            </div>
        </div>
        <div class="grid grid-cols-12 my-20">
            <div class="col-span-12">
                <div
                    class="mt-12 flex justify-between items-center"
                >
                    <Button
                        label="Cancel"
                        class="p-button-outlined"
                        @click="handleBack"
                        data-testid="cancel-button"
                    />
                    <Button
                        label="Save & Continue"
                        :loading="busy"
                        @click="save"
                        data-testid="save-continue-button"
                    />
                </div>
            </div>
        </div>

        <SyncPricesDialog
            v-if="openSyncPricesDialog"
            :openDialog="openSyncPricesDialog"
            :id="props.id"
            :store="associatedPlanStore"
            :action="nonInsuranceProductActionType"
            context="nonInsuranceProduct"
            @closeDialog="handleSyncDialogClose"
        />
    </div>
</template>
