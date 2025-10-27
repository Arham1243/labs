<script setup>
import lodash from 'lodash';
import { useI18n } from 'vue-i18n';
import { onBeforeMount, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import { useClientStore } from '@/modules/clients/stores/Client';
import useEventsBus from '@/composables/event-bus';

import PlanDetails from '@/modules/plans/components/plans/associated/PlanDetails.vue';
import PlanRecentGraduate from '@/modules/plans/components/plans/associated/PlanRecentGraduate.vue';
import PlanDates from '@/modules/plans/components/plans/associated/PlanDates.vue';
import AttachBenefitInit from '@/modules/plans/components/shared/AttachBenefit/AttachBenefitInit.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';
import SectionPlanDetails from '@/modules/plans/components/plans/associated/partials/SectionPlanDetails.vue';
import Bundles from '@/modules/plans/components/plans/Bundles.vue';
import DependantSettings from '@/modules/plans/components/plans/associated/DependantSettings.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';
import SyncPricesDialog from '@/modules/plans/components/shared/AttachBenefit/dialogs/SyncPricesDialog.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    },
    plan: {
        type: String,
        required: true
    }
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const planStore = usePlanStore();
const clientStore = useClientStore();
const associatedPlanStore = useAssociatedPlanStore();
const { bus } = useEventsBus();

const {
    activeEditComponent,
    showUnsavedDialog,
    handleUnsavedChanges,
    triggerCancelEdit
} = provideEditState();

const planDetails = ref({});
const busy = ref(false);
const loadingPlan = ref(false);
const isPublishDialog = ref(false);

const pendingNavigation = ref(null);

const openSyncPricesDialog = ref(false);
const nonInsuranceProductActionType = ref('');
const syncDialogProcessed = ref(false);

defineEmits(['showConfirmation']);

const formData = ref({
    category: null,
    early_arrivals_periods: [],
    gap_periods: [],
    category_code: ''
});

onBeforeMount(() => {
    getAssociatedPlan();
    checkPendingSyncs();
});

watch(
    () => bus.value.get('reloadPlan'),
    async () => {
        await getAssociatedPlan();
    }
);

const checkPendingSyncs = async () => {
    if (!syncDialogProcessed.value) {
        const nonInsuranceProductAction = bus.value.get('openSyncPricesDialog');
        if (
            nonInsuranceProductAction &&
            nonInsuranceProductAction !== 'disabled'
        ) {
            bus.value.set('openSyncPricesDialog', null);

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
                    nonInsuranceProductActionType.value =
                        nonInsuranceProductAction;
                    openSyncPricesDialog.value = true;
                } else {
                    await associatedPlanStore.syncPrices(props.id);
                }
                syncDialogProcessed.value = true;
            } catch (error) {
                console.error('Error checking prices:', error);
                syncDialogProcessed.value = true;
            }
        } else if (nonInsuranceProductAction) {
            bus.value.set('openSyncPricesDialog', null);
            syncDialogProcessed.value = true;
        }
    }
};

const handleNonInsuranceProductChanged = async (action) => {
    if (action !== 'disabled') {
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
                nonInsuranceProductActionType.value = action;
                openSyncPricesDialog.value = true;
            } else {
                await associatedPlanStore.syncPrices(props.id);
                await getAssociatedPlan();
            }
        } catch (error) {
            console.error('Error checking prices:', error);
        }
    }
};

const handleSyncDialogClose = () => {
    openSyncPricesDialog.value = false;
    nonInsuranceProductActionType.value = '';
    getAssociatedPlan();
};

const getPlan = async () => {
    const res = await planStore.getPlan(props.plan, {
        include: 'businessUnit,periods'
    });
    planDetails.value = res.data;
    await getClient();
};

const getClient = async () => {
    const res = await clientStore.getBusinessUnit(
        planDetails.value.business_unit.id
    );
    planDetails.value.business_unit.client_id = res.data.client_id;
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
                'authorized,gapPeriods.planPeriod,earlyArrivalPeriods.planPeriod,nonInsuranceProducts,dependantsSetting.dependantsSettingsPricingDiscounts',
            'aggregates[0][relation]': 'benefits',
            'aggregates[0][type]': 'count',
            'aggregates[1][relation]': 'benefitGroupBenefits',
            'aggregates[1][type]': 'count'
        }
    );
    loadingPlan.value = false;

    associatedPlanStore.setCurrentPlan(lodash.cloneDeep(res.data));
    formData.value = associatedPlanStore.transferObject(res.data);
};

const goBack = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            router.push({
                name: 'New Associated Plan Step 4',
                params: { id: props.id }
            });
        });
        pendingNavigation.value = 'back';
    } else {
        router.push({
            name: 'New Associated Plan Step 4',
            params: { id: props.id }
        });
    }
};

const showPublishDialog = () => {
    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            triggerCancelEdit();
            setTimeout(() => {
                isPublishDialog.value = true;
            }, 50);
        });
        pendingNavigation.value = 'publish';
    } else {
        isPublishDialog.value = true;
    }
};
const publish = async () => {
    try {
        busy.value = true;
        await associatedPlanStore.updateAssociatedPlanStatus(
            route.params.id,
            {
                status: 'active'
            },
            formData.value
        );
        await router.push({
            name: 'Business Unit Details',
            params: {
                clientId: planDetails.value.business_unit.client_id,
                id: planDetails.value.business_unit.id
            },
            query: {
                shouldExpandBusinessUnitPlan: 'true'
            }
        });
    } finally {
        busy.value = false;
    }
};

const confirmDiscard = () => {
    showUnsavedDialog.value = false;
    triggerCancelEdit();
    if (pendingNavigation.value === 'back') {
        router.push({
            name: 'New Associated Plan Step 4',
            params: { id: props.id }
        });
    } else if (pendingNavigation.value === 'publish') {
        setTimeout(() => {
            isPublishDialog.value = true;
        }, 50);
    }
    pendingNavigation.value = null;
};

const cancelDiscard = () => {
    showUnsavedDialog.value = false;
    pendingNavigation.value = null;
};
</script>
<template>
    <Loader v-if="loadingPlan" />
    <div v-else>
        <div class="mt-6 mb-3 mx-8 px-3">
            <h4 data-testid="review-title">
                {{ t('plans.associated.review_plan_summary') }}
            </h4>
        </div>
        <div class="grid mt-4 mx-8">
            <div class="col-7">
                <Card class="mb-3">
                    <template #content>
                        <PlanDetails
                            :data="formData"
                            :plan="plan"
                            component-id="plan-details"
                            :is-review="true"
                        />
                    </template>
                </Card>
                <Card
                    v-if="
                        ['gap', 'early_arrivals'].includes(
                            formData.category?.code
                        )
                    "
                >
                    <template #content>
                        <PlanDates
                            :data="formData"
                            :plan="plan"
                            :periods="planDetails.periods"
                            component-id="plan-dates"
                            :is-review="true"
                        />
                    </template>
                </Card>
                <Card
                    v-if="['recent_graduate'].includes(formData.category?.code)"
                >
                    <template #content>
                        <PlanRecentGraduate
                            :data="formData"
                            :plan="plan"
                            component-id="plan-recent-graduate"
                            :is-review="true"
                        />
                    </template>
                </Card>
                <Card class="mt-3">
                    <template #content>
                        <Bundles
                            :data="formData"
                            variant="associatedPlan"
                            @nonInsuranceProductChanged="
                                handleNonInsuranceProductChanged
                            "
                            component-id="bundles"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
            <div class="col-5">
                <Loader v-if="loadingPlan" />
                <SectionPlanDetails v-else :plan="planDetails" />
            </div>
        </div>
        <div v-if="['dependants'].includes(formData.category?.code)">
            <div class="mx-8 my-3 px-3">
                <Card>
                    <template #content>
                        <DependantSettings
                            :data="formData"
                            :plan="plan"
                            :planDetails="planDetails"
                            component-id="dependant-settings"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
        </div>
        <div class="mx-8 px-3">
            <Card>
                <template #content>
                    <AttachBenefitInit
                        is-copy
                        :id="props.id"
                        :title="$t('common.benefits')"
                        :store="associatedPlanStore"
                        component-id="attach-benefit"
                        :is-review="true"
                    />
                </template>
            </Card>
            <Card class="mt-3">
                <template #content>
                    <AttachPricingInit
                        is-disabled-net-price
                        is-copy
                        :id="props.id"
                        :parent="props.plan"
                        :store="associatedPlanStore"
                        :title="$t('common.pricing')"
                        has-price-breakdown
                        can-recalculate-pricings
                        component-id="attach-pricing"
                        :is-review="true"
                        is-associated-plan
                    />
                </template>
            </Card>
            <Card class="mt-3">
                <template #content>
                    <DocumentsTable
                        type="associated-plans"
                        :id="props.id"
                        :is-new="false"
                        component-id="documents"
                        :is-review="true"
                    />
                </template>
            </Card>
        </div>
        <div class="grid my-8">
            <div class="col-12 mx-auto">
                <div
                    class="mt-4 flex justify-content-between align-items-center"
                >
                    <Button
                        :label="t('buttons.back')"
                        class="p-button-outlined"
                        icon="pi pi-chevron-left"
                        @click="goBack"
                        data-testid="back-button"
                    />
                    <Button
                        :label="t('buttons.confirm_and_publish')"
                        :loading="busy"
                        @click="showPublishDialog"
                        icon-pos="right"
                        icon="pi pi-chevron-right"
                        data-testid="confirm-publish-button"
                    />
                </div>
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

    <Confirmation
        v-model="showUnsavedDialog"
        header="Exit Edit Mode"
        content="Are you sure you want to exit edit mode? Any changes made will be lost."
        confirm-button-class="p-button-danger"
        confirm-button-text="Exit Edit Mode"
        cancel-button-text="Continue Editing"
        class="w-auto"
        @confirm="confirmDiscard"
        @cancel="cancelDiscard"
    />

    <Confirmation
        v-if="isPublishDialog"
        v-model="isPublishDialog"
        :confirm-button-text="$t('buttons.publish')"
        :header="$t('plans.publish_associated_plan')"
        :content="
            $t('plans.publish_associated_plan_content', {
                item: formData.category.name.toLowerCase()
            })
        "
        @confirm="publish"
    />
</template>
