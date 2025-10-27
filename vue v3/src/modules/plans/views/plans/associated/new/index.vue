<script setup>
import { ref, watch, onBeforeMount } from 'vue';
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

const stepperItems = ref([
    {
        label: t('plans.plan_details'),
        to: { name: 'New Associated Plan' }
    },
    {
        label: t('common.select_benefits'),
        to: { name: 'New Associated Plan Step 2' }
    },
    {
        label: t('common.set_pricing'),
        to: { name: 'New Associated Plan Step 3' }
    },
    {
        label: t('common.documents'),
        to: { name: 'New Associated Plan Step 4' }
    },
    {
        label: t('common.review'),
        to: { name: 'New Associated Plan Step 5' }
    }
]);

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
    stepperItems.value.splice(3, 0, {
        label: t('plans.dependant_settings'),
        to: { name: 'New Associated Plan Dependant' }
    });
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
                    <div class="flex align-items-center">
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
                    @click="handleBack"
                    icon="pi pi-times"
                    severity="secondary"
                    outlined
                    class="px-4 py-2"
                    data-testid="back-button"
                />
            </template>
        </Header>

        <div class="mt-6">
            <Steps :model="stepperItems" />
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
