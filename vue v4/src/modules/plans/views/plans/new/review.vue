<script setup>
import lodash from 'lodash';
import { ref, onBeforeMount, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useClientStore } from '@/modules/clients/stores/Client';
import { useHelpers } from '@/composables';
import useEventsBus from '@/composables/event-bus';

import PlanDetails from '@/modules/plans/components/plans/PlanDetails.vue';
import PlanPolicyDefaults from '@/modules/plans/components/plans/PlanPolicyDefaults.vue';
import PlanPolicyAction from '@/modules/plans/components/plans/PlanPolicyAction.vue';
import PlanDates from '@/modules/plans/components/plans/PlanDates.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import AttachBenefitInit from '@/modules/plans/components/shared/AttachBenefit/AttachBenefitInit.vue';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';
import Bundles from '@/modules/plans/components/plans/Bundles.vue';
import SyncPricesDialog from '@/modules/plans/components/shared/AttachBenefit/dialogs/SyncPricesDialog.vue';
import AlternateInsuranceDetails from '@/modules/plans/components/plans/AlternateInsuranceDetails.vue';
import OptOutNotificationsEmailsDetails from '@/modules/plans/components/plans/OptOutNotificationsEmailsDetails.vue';
import DeclarationTextDetails from '@/modules/plans/components/plans/DeclarationTextDetails.vue';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const router = useRouter();
const planStore = usePlanStore();
const clientStore = useClientStore();
const helpers = useHelpers();
const { bus } = useEventsBus();

const {
    activeEditComponent,
    showUnsavedDialog,
    handleUnsavedChanges,
    triggerCancelEdit
} = provideEditState();

const item = ref({});
const alternateInsuranceItem = ref({});
const busy = ref(false);
const loading = ref(false);
const isPublishDialog = ref(false);

const pendingNavigation = ref(null);

const openSyncPricesDialog = ref(false);
const nonInsuranceProductActionType = ref('');
const syncDialogProcessed = ref(false);

const emailTemplateOptions = ref([]);
const declarationTemplateOptions = ref([]);

onBeforeMount(() => {
    getItem();
    checkPendingSyncs();
});

watch(
    () => bus.value.get('reloadReviewPlanDetails'),
    async () => {
        await getItem();
    }
);

watch(
    () => bus.value.get('reloadReviewOptOutNotifications'),
    async () => {
        await getItem();
    }
);

watch(
    () => bus.value.get('reloadReviewDeclarationText'),
    async () => {
        await getItem();
    }
);

const handleTemplatePreview = (templateData) => {
    console.log('Preview template:', templateData);
};

const handleDeclarationTemplateChanged = (templateData) => {
    console.log('Declaration template changed:', templateData);
};

const handleDeclarationContentChanged = (contentData) => {
    console.log('Declaration content changed:', contentData);
};

const handleViewFullContent = (content) => {
    console.log('View full declaration content:', content);
};

const checkPendingSyncs = async () => {
    if (!syncDialogProcessed.value) {
        const nonInsuranceProductAction = bus.value.get('openSyncPricesDialog');
        if (
            nonInsuranceProductAction &&
            nonInsuranceProductAction !== 'disabled'
        ) {
            bus.value.set('openSyncPricesDialog', null);
            try {
                const prices = await planStore.searchPlanPrices(
                    props.id,
                    {},
                    {}
                );
                if (prices.data?.length > 0) {
                    nonInsuranceProductActionType.value =
                        nonInsuranceProductAction;
                    openSyncPricesDialog.value = true;
                } else {
                    await planStore.syncPrices(props.id);
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
            const prices = await planStore.searchPlanPrices(props.id, {}, {});
            if (prices.data?.length > 0) {
                nonInsuranceProductActionType.value = action;
                openSyncPricesDialog.value = true;
            } else {
                await planStore.syncPrices(props.id);
                await getItem();
            }
        } catch (error) {
            console.error('Error checking prices:', error);
        }
    }
};

const handleSyncDialogClose = () => {
    openSyncPricesDialog.value = false;
    nonInsuranceProductActionType.value = '';
    getItem();
};

const getItem = async () => {
    loading.value = true;
    const res = await planStore.getPlan(props.id, {
        include:
            'authorized,periods,businessUnit,periods.cancellationPeriods,periods.extensionPeriods,periods.earlyReturnPeriods,nonInsuranceProducts,alternateInsurance,alternateInsurance.fixedWindowPeriods,alternateInsurance.eligibilityPeriods',
        'aggregates[0][relation]': 'benefits',
        'aggregates[0][type]': 'count',
        'aggregates[1][relation]': 'benefitGroupBenefits',
        'aggregates[1][type]': 'count'
    });
    loading.value = false;
    planStore.setCurrentPlan(lodash.cloneDeep(res.data));
    item.value = planStore.transferObject(lodash.cloneDeep(res.data));
    alternateInsuranceItem.value = planStore.getAlternateInsuranceFormData();

    await getClient();
};

const getClient = async () => {
    if (!item.value.business_unit) return;

    const res = await clientStore.getBusinessUnit(item.value.business_unit.id);

    item.value.business_unit.client_id = res.data.client_id;
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
        const payload = {
            ...item.value,
            status: 'active'
        };
        await planStore.publishPlan(props.id, payload, item.value);
        if (item.value.business_unit?.id?.length > 0) {
            await router.push({
                name: 'Business Unit Details',
                params: {
                    clientId: item.value.business_unit.client_id,
                    id: item.value.business_unit.id
                }
            });
        } else {
            await router.push({
                name: 'Plans'
            });
        }
    } finally {
        busy.value = false;
    }
};

const goBack = () => {
    const hasOptOut = planStore.currentPlan?.is_opt_out;

    if (activeEditComponent.value) {
        handleUnsavedChanges(() => {
            if (hasOptOut) {
                router.push({
                    name: 'New Plan Step 5 Documents',
                    params: { id: props.id }
                });
            } else {
                router.push({
                    name: 'New Plan Step 4 Documents',
                    params: { id: props.id }
                });
            }
        });
        pendingNavigation.value = 'back';
    } else {
        if (hasOptOut) {
            router.push({
                name: 'New Plan Step 5 Documents',
                params: { id: props.id }
            });
        } else {
            router.push({
                name: 'New Plan Step 4 Documents',
                params: { id: props.id }
            });
        }
    }
};

const confirmDiscard = () => {
    const hasOptOut = planStore.currentPlan?.is_opt_out;

    showUnsavedDialog.value = false;
    triggerCancelEdit();

    if (pendingNavigation.value === 'back') {
        if (hasOptOut) {
            router.push({
                name: 'New Plan Step 5 Documents',
                params: { id: props.id }
            });
        } else {
            router.push({
                name: 'New Plan Step 4 Documents',
                params: { id: props.id }
            });
        }
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
    <Loader v-if="loading" />
    <div v-else class="mt-10">
        <h4 data-testid="review-title" class="mb-4">
            {{ $t('plans.review_plan_summary') }}
        </h4>
        <div class="grid grid-cols-12 gap-6 mt-2">
            <div class="col-span-6">
                <Card class="mb-4">
                    <template #content>
                        <PlanDetails
                            ref="PlanDetailsRef"
                            :data="item"
                            component-id="plan-details"
                            :is-review="true"
                        />
                    </template>
                </Card>
                <Card class="mb-4">
                    <template #content>
                        <PlanDates
                            ref="PlanDatesRef"
                            :data="item"
                            :validateDates="true"
                            component-id="plan-dates"
                            :is-review="true"
                        />
                    </template>
                </Card>
                <Card>
                    <template #content>
                        <Bundles
                            :data="item"
                            @nonInsuranceProductChanged="
                        handleNonInsuranceProductChanged
                    "
                            component-id="plan-bundles"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
            <div class="col-span-6">
                <Card class="mb-4">
                    <template #content>
                        <PlanPolicyAction
                            ref="PolicyActionsRef"
                            :data="item"
                            component-id="plan-policy-actions"
                            :is-review="true"
                        />
                    </template>
                </Card>
                <Card>
                    <template #content>
                        <PlanPolicyDefaults
                            ref="PolicyDefaultsRef"
                            :data="item"
                            component-id="plan-policy-defaults"
                            :is-review="true"
                        />
                    </template>
                </Card>
            </div>
        </div>

 <Card class="mt-6">
            <template #content>
                <AttachBenefitInit
                    ref="AttachBenefitInitRef"
                    :id="props.id"
                    :title="$t('plans.plan_benefit_title')"
                    :store="planStore"
                    component-id="attach-benefit"
                    :is-review="true"
                />
            </template>
        </Card>
 <Card class="mt-6">
            <template #content>
                <AttachPricingInit
                    ref="AttachPricingInitRef"
                    is-disabled-net-price
                    :id="props.id"
                    :store="planStore"
                    :title="$t('plans.pricing')"
                    has-price-breakdown
                    can-recalculate-pricings
                    component-id="attach-pricing"
                    :is-review="true"
                    is-plan
                />
            </template>
        </Card>
        <template v-if="item.is_opt_out">
            <Card class="mt-7">
                <template #content>
                    <AlternateInsuranceDetails
                        ref="AlternateInsuranceDetailsRef"
                        :alternate-insurance-data="alternateInsuranceItem"
                        component-id="alternate-insurance-details"
                        :is-review="true"
                    />
                </template>
            </Card>
            <Card class="mt-7">
                <template #content>
                    <OptOutNotificationsEmailsDetails
                        ref="OptOutNotificationsEmailsDetailsRef"
                        v-model="alternateInsuranceItem"
                        :template-options="emailTemplateOptions"
                        component-id="opt-out-notifications-emails-details"
                        :is-review="true"
                        @preview-template="handleTemplatePreview"
                    />
                </template>
            </Card>
            <Card class="mt-7">
                <template #content>
                    <DeclarationTextDetails
                        ref="DeclarationTextDetailsRef"
                        :model-value="item"
                        :template-options="declarationTemplateOptions"
                        component-id="declaration-text-details"
                        :is-review="true"
                        editor-height="300px"
                        @template-changed="handleDeclarationTemplateChanged"
                        @content-changed="handleDeclarationContentChanged"
                        @view-full-content="handleViewFullContent"
                    />
                </template>
            </Card>
        </template>
 <Card class="mt-6">
            <template #content>
                <DocumentsTable
                    ref="PlanDocumentsRef"
                    :is-new="false"
                    type="plans"
                    :id="props.id"
                    component-id="plan-documents"
                    :is-review="true"
                />
            </template>
        </Card>
        <div class="my-8 flex justify-between items-center">
            <Button
                :label="$t('buttons.back')"
                icon="pi pi-chevron-left"
                class="p-button-outlined"
                @click="goBack"
                data-testid="back-button"
            />
            <Button
                :label="$t('buttons.confirm_and_publish')"
                icon-pos="right"
                icon="pi pi-chevron-right"
                @click="showPublishDialog"
                data-testid="confirm-publish-button"
            />
        </div>
    </div>

    <SyncPricesDialog
        v-if="openSyncPricesDialog"
        :openDialog="openSyncPricesDialog"
        :id="props.id"
        :store="planStore"
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
        v-model="isPublishDialog"
        :confirm-button-text="$t('buttons.publish')"
        :header="$t('plans.publish_plan')"
        :content="
            $t('plans.publish_plan_content', {
                item: helpers.getLocaleValue(item.name)
            })
        "
        @confirm="publish"
    />
</template>
