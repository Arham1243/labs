<script setup>
import { ref, watch, onBeforeMount, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useClientStore } from '@/modules/clients/stores/Client';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import useEventsBus from '@/composables/event-bus';
import { useHelpers } from '@/composables';

import { provideEditState } from '@/modules/plans/composables/useEditState';

provideEditState();

const { t } = useI18n();
const router = useRouter();
const associatedPlanStore = useAssociatedPlanStore();
const planStore = usePlanStore();
const clientStore = useClientStore();
const route = useRoute();
const { bus } = useEventsBus();
const id = ref(-1);
const showUnsavedData = ref(false);
const helpers = useHelpers();

// Track if dependant step is enabled
const hasDependantStep = ref(false);

// Dynamic route mapping based on dependant step
const routeToStepMap = computed(() => {
    if (hasDependantStep.value) {
        return {
            'New Associated Plan': '1',
            'New Associated Plan Step 2': '2',
            'New Associated Plan Step 3': '3',
            'New Associated Plan Dependant': '4',
            'New Associated Plan Step 4': '5',
            'New Associated Plan Step 5': '6'
        };
    } else {
        return {
            'New Associated Plan': '1',
            'New Associated Plan Step 2': '2',
            'New Associated Plan Step 3': '3',
            'New Associated Plan Step 4': '4',
            'New Associated Plan Step 5': '5'
        };
    }
});

const stepToRouteMap = computed(() => {
    if (hasDependantStep.value) {
        return {
            '1': 'New Associated Plan',
            '2': 'New Associated Plan Step 2',
            '3': 'New Associated Plan Step 3',
            '4': 'New Associated Plan Dependant',
            '5': 'New Associated Plan Step 4',
            '6': 'New Associated Plan Step 5'
        };
    } else {
        return {
            '1': 'New Associated Plan',
            '2': 'New Associated Plan Step 2',
            '3': 'New Associated Plan Step 3',
            '4': 'New Associated Plan Step 4',
            '5': 'New Associated Plan Step 5'
        };
    }
});

// Dynamic stepper items based on dependant step
const stepperItems = computed(() => {
    const baseSteps = [
        { value: '1', label: 'Plan Details' },
        { value: '2', label: 'Select Benefits' },
        { value: '3', label: 'Set Pricing' }
    ];

    if (hasDependantStep.value) {
        return [
            ...baseSteps,
            { value: '4', label: t('plans.dependant_settings') },
            { value: '5', label: 'Documents' },
            { value: '6', label: 'Review' }
        ];
    } else {
        return [
            ...baseSteps,
            { value: '4', label: 'Documents' },
            { value: '5', label: 'Review' }
        ];
    }
});

// Compute current step based on route
const currentStep = computed(() => {
    return routeToStepMap.value[route.name] || '1';
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
    () => bus.value.get('setDependantStep'),
    () => {
        setDependantStep();
    }
);

watch(
    () => [associatedPlanStore.currentAssociatedPlan],
    () => {
        if (associatedPlanStore.currentAssociatedPlan)
            id.value = associatedPlanStore.currentAssociatedPlan.id;
    }
);

const setDependantStep = () => {
    hasDependantStep.value = true;
};

const handleBack = () => {
    showUnsavedData.value = true;
};

const getPlan = async () => {
    const res = await planStore.getPlan(route.params.plan, {
        include: 'businessUnit'
    });
    const clientRes = await clientStore.getBusinessUnit(
        res.data.business_unit.id
    );
    associatedPlanStore.setParentPlan({
        ...res.data,
        business_unit: clientRes.data
    });
};

const getItem = async () => {
    await getPlan();
    if (associatedPlanStore.currentAssociatedPlan || route.params.id == '-1') {
        associatedPlanStore.setCurrentPlan(null);
        return;
    }
    const res = await associatedPlanStore.getPlan(
        route.params.plan,
        route.params.id,
        {
            include:
                'authorized,gapPeriods.planPeriod,earlyArrivalPeriods.planPeriod,dependantsSetting.dependantsSettingsPricingDiscounts,plan.businessUnit.client,plan,plan.businessUnit.province.taxes',
            'aggregates[0][relation]': 'benefits',
            'aggregates[0][type]': 'count',
            'aggregates[1][relation]': 'benefitGroupBenefits',
            'aggregates[1][type]': 'count'
        }
    );
    associatedPlanStore.setCurrentPlan(res.data);
    if (res.data.category === 'dependants') {
        setDependantStep();
    }
};

const setPlan = async () => {
    const res = await associatedPlanStore.getPlan(
        route.params.plan,
        route.params.id,
        {
            include:
                'authorized,gapPeriods.planPeriod,earlyArrivalPeriods.planPeriod,dependantsSetting.dependantsSettingsPricingDiscounts,plan.periods,plan.businessUnit.client',
            'aggregates[0][relation]': 'benefits',
            'aggregates[0][type]': 'count',
            'aggregates[1][relation]': 'benefitGroupBenefits',
            'aggregates[1][type]': 'count'
        }
    );
    associatedPlanStore.setCurrentPlan(res.data);
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

const openConfirmation = () => {
    showUnsavedData.value = true;
};
</script>

<template>
    <div class="relative container">
        <Header hide-back>
            <template #title>
                <div>
                    <div class="flex items-center">
                        <div data-testid="index-title" class="p-break-word">
                            {{
                                associatedPlanStore.currentPlan
                                    ? t(
                                          'common.' +
                                              associatedPlanStore.currentPlan
                                                  .category
                                      )
                                    : $t('plans.new_associated_plan')
                            }}
                        </div>
                        <StatusTag
                            v-if="associatedPlanStore.currentPlan?.status"
                            class="ml-2"
                            :status="associatedPlanStore.currentPlan?.status"
                        />
                    </div>
                    <div
                        class="text-sm font-normal text-gray-700 mt-2 p-break-all"
                        data-testid="index-subtitle"
                        v-if="associatedPlanStore.parentPlan"
                    >
                        {{
                            'Associated with ' +
                            helpers.getLocaleValue(
                                associatedPlanStore.parentPlan?.name
                            )
                        }}
                    </div>
                </div>
            </template>
            <template #actions>
                <div class="custom-button-header-action flex">
                    <Button
                        icon="pi pi-check-square"
                        class="mr-2 p-button-outlined"
                        label="0"
                        data-testid="check-square-button"
                    />
                    <Button
                        icon="pi pi-comment"
                        label="0"
                        class="mr-2 p-button-outlined"
                        data-testid="comment-button"
                    />
                    <Button
                        @click="handleBack"
                        icon="pi pi-times"
                        severity="secondary"
                        outlined
                        data-testid="back-button"
                    />
                </div>
            </template>
        </Header>

        <div class="mt-12">
            <!-- Dynamic PrimeVue 4 Stepper -->
            <Stepper :value="currentStep" linear class="w-full vertical-stepper">
                <StepList>
                    <Step
                        v-for="item in stepperItems"
                        :key="item.value"
                        :value="item.value"
                        @click="onStepChange(item.value)"
                        :class="{ 'cursor-pointer': true }"
                    >
                        {{ item.label }}
                    </Step>
                </StepList>
            </Stepper>
            <router-view @showConfirmation="openConfirmation" />
        </div>
    </div>
    <Confirmation
        v-model="showUnsavedData"
        :header="$t('common.cancel_creation_header')"
        :content="
            $t('common.cancel_creation_content', { item: 'business unit' })
        "
        :confirm-button-text="$t('buttons.exit_without_saving')"
        :cancel-button-text="$t('buttons.cancel')"
        confirm-button-class="bg-red-500 border-red-500"
        @confirm="goBack"
    />
</template>
