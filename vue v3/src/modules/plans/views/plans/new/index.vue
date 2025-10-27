<script setup>
import lodash from 'lodash';
import { ref, watch, onBeforeMount, computed, provide } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useClientStore } from '@/modules/clients/stores/Client';
import useEventsBus from '@/composables/event-bus';
import { useGlobalStore } from '@/stores';
import { provideEditState } from '@/modules/plans/composables/useEditState';

provideEditState();

const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const planStore = usePlanStore();
const clientStore = useClientStore();
const { bus } = useEventsBus();
const loading = ref(false);
const parentBusinessUnit = ref(null);
const id = ref(-1);
const currentOptOutState = ref(false);

provide('currentOptOutState', currentOptOutState);

const stepperItems = computed(() => {
    const items = [
        {
            label: 'Plan Details',
            to: { name: 'New Plan' }
        },
        {
            label: 'Select Benefits',
            to: { name: 'New Plan Step 2' }
        },
        {
            label: 'Set Pricing',
            to: { name: 'New Plan Step 3' }
        }
    ];

    const isOptOutEnabled = currentOptOutState.value;

    if (isOptOutEnabled) {
        items.push({
            label: 'Opt Out Settings',
            to: { name: 'New Plan Step 4 OptOut' }
        });
        items.push({
            label: 'Documents',
            to: { name: 'New Plan Step 5 Documents' }
        });
        items.push({
            label: 'Review',
            to: { name: 'New Plan Step 6 Review' }
        });
    } else {
        items.push({
            label: 'Documents',
            to: { name: 'New Plan Step 4 Documents' }
        });
        items.push({
            label: 'Review',
            to: { name: 'New Plan Step 5 Review' }
        });
    }

    return items;
});

onBeforeMount(() => {
    getItem();
});

watch(
    () => bus.value.get('reloadPlanDetails'),
    async () => {
        await setPlan();
    }
);

watch(
    () => [planStore.currentPlan],
    () => {
        if (planStore.currentPlan) id.value = planStore.currentPlan.id;
    }
);

const resetStepperState = () => {
    currentOptOutState.value = false;
    console.log('Stepper state reset for new plan');
};

watch(
    () => route.params.id,
    (newId, oldId) => {
        if (newId === '-1') {
            resetStepperState();
            if (planStore.currentPlan !== null) {
                planStore.setCurrentPlan(null);
            }
        }
    },
    { immediate: true }
);

watch(
    () => planStore.currentPlan?.is_opt_out,
    (newValue) => {
        if (newValue !== undefined && route.params.id !== '-1') {
            currentOptOutState.value = newValue;
        }
    },
    { immediate: true }
);

const getItem = async () => {
    if (route.params.id == '-1') {
        planStore.setCurrentPlan(null);
        return;
    }
    loading.value = true;
    const res = await planStore.getPlan(route.params.id, {
        include: 'authorized,periods,businessUnit',
        'aggregates[0][relation]': 'benefits',
        'aggregates[0][type]': 'count',
        'aggregates[1][relation]': 'benefitGroupBenefits',
        'aggregates[1][type]': 'count'
    });
    if (res.data?.business_unit?.id) {
        const businessUnit = await clientStore.getBusinessUnit(
            res.data?.business_unit?.id,
            {
                include: 'client'
            }
        );
        parentBusinessUnit.value = businessUnit.data;
    }
    planStore.setCurrentPlan(res.data);
    loading.value = false;
};

const setPlan = async () => {
    loading.value = true;
    const res = await planStore.getPlan(route.params.id, {
        include: 'authorized,periods,businessUnit,businessUnit.client',
        'aggregates[0][relation]': 'benefits',
        'aggregates[0][type]': 'count',
        'aggregates[1][relation]': 'benefitGroupBenefits',
        'aggregates[1][type]': 'count'
    });
    planStore.setCurrentPlan(res.data);
    loading.value = false;
};

const routeHasBusinessUnitIdAndClientId = () => {
    return (
        route.query.business_unit_id?.length > 0 &&
        route.query.client_id?.length > 0
    );
};

const planIsAttachedToBusinessUnit = () => {
    return (
        planStore.currentPlan?.business_unit?.id?.length > 0 &&
        parentBusinessUnit.value.client?.id?.length > 0
    );
};

const goBack = () => {
    useGlobalStore().clearErrors();
    if (routeHasBusinessUnitIdAndClientId()) {
        router.push({
            name: 'Business Unit Details',
            params: {
                clientId: route.query.client_id,
                id: route.query.business_unit_id
            }
        });
    } else if (planIsAttachedToBusinessUnit()) {
        router.push({
            name: 'Business Unit Details',
            params: {
                clientId: parentBusinessUnit.value.client?.id,
                id: planStore.currentPlan?.business_unit?.id
            }
        });
    } else {
        router.push({ name: 'Plans' });
    }
};
</script>

<template>
    <div class="relative container">
        <Header hide-back>
            <template #title>
                <div>
                    <div class="flex align-items-center">
                        <div data-testid="plan-name-title" class="p-break-all">
                            {{
                                lodash.truncate(
                                    helpers.getLocaleValue(
                                        planStore.currentPlan?.name
                                    ),
                                    {
                                        length: 80
                                    }
                                ) || $t('plans.new_default_plan')
                            }}
                        </div>
                        <StatusTag
                            v-if="planStore.currentPlan?.status"
                            class="ml-2"
                            :status="planStore.currentPlan?.status"
                        />
                    </div>
                    <div
                        v-if="planStore.currentPlan"
                        class="text-sm font-normal text-gray-700"
                        data-testid="plan-details-subtitle"
                    >
                        {{ $t('plans.' + planStore.currentPlan.bound) }} •
                        {{ $t('plans.' + planStore.currentPlan.type) }}
                        {{
                            planStore.currentPlan.is_cancellations
                                ? ' • ' + $t('common.cancellations')
                                : ''
                        }}
                        {{
                            planStore.currentPlan.is_extensions
                                ? ' • ' + $t('common.extensions')
                                : ''
                        }}
                        {{
                            planStore.currentPlan.is_early_returns
                                ? ' • ' + $t('common.early_returns')
                                : ''
                        }}
                        {{
                            planStore.currentPlan.is_opt_out
                                ? ' • ' + $t('common.opt_out')
                                : ''
                        }}
                        {{
                            planStore.currentPlan.is_refundable
                                ? ' • ' + $t('common.refundable')
                                : ''
                        }}
                        {{
                            planStore.currentPlan.is_overlap
                                ? ' • ' + $t('common.overlap')
                                : ''
                        }}
                    </div>
                </div>
            </template>
            <template #actions>
                <Button
                    icon="pi pi-check-square"
                    class="px-2 py-2 p-button-outlined"
                    label="0"
                    data-testid="check-square-button"
                />
                <Button
                    icon="pi pi-comment"
                    label="0"
                    class="mx-3 px-2 py-2 p-button-outlined"
                    data-testid="comment-button"
                />
                <Button
                    @click="goBack"
                    icon="pi pi-times"
                    severity="secondary"
                    :disabled="loading"
                    outlined
                    class="px-4 py-2"
                    data-testid="back-button"
                />
            </template>
        </Header>

        <div class="mt-6">
            <Steps :model="stepperItems" />
            <router-view />
        </div>
    </div>
</template>
