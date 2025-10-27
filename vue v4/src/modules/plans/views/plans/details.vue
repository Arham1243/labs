<script setup>
import lodash from 'lodash';
import {
    computed,
    ref,
    onBeforeMount,
    watch,
    onUnmounted,
    onMounted,
    nextTick
} from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useHelpers } from '@/composables';
import useEventsBus from '@/composables/event-bus';

import PlanDetails from '@/modules/plans/components/plans/PlanDetails.vue';
import PlanPolicyDefaults from '@/modules/plans/components/plans/PlanPolicyDefaults.vue';
import PlanPolicyAction from '@/modules/plans/components/plans/PlanPolicyAction.vue';
import PlanDates from '@/modules/plans/components/plans/PlanDates.vue';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import AuditTable from '@/components/common/AuditTable.vue';
import AttachBenefitInit from '@/modules/plans/components/shared/AttachBenefit/AttachBenefitInit.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';
import Bundles from '@/modules/plans/components/plans/Bundles.vue';
import SyncPricesDialog from '@/modules/plans/components/shared/AttachBenefit/dialogs/SyncPricesDialog.vue';

import AlternateInsuranceDetails from '@/modules/plans/components/plans/AlternateInsuranceDetails.vue';
import OptOutNotificationsEmailsDetails from '@/modules/plans/components/plans/OptOutNotificationsEmailsDetails.vue';
import DeclarationTextDetails from '@/modules/plans/components/plans/DeclarationTextDetails.vue';
import { useExpiration } from '@/composables/useExpiration.js';
import TabList from 'primevue/tablist';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const planStore = usePlanStore();
const helpers = useHelpers();
const router = useRouter();
const { t } = useI18n();
const { bus } = useEventsBus();

const {
    showUnsavedDialog,
    shouldUseLazy,
    activeEditComponent,
    confirmDiscard,
    cancelDiscard,
    clearActiveComponent,
    triggerCancelEdit,
    setForceSkipConfirmation,
    setupTabPrevention,
    clearTabListeners
} = provideEditState();

const loading = ref(false);
const busy = ref(false);
const item = ref({});
const alternateInsuranceItem = ref({});
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);
const menu = ref();

const showExitEditDialog = ref(false);
const pendingAction = ref(null);
const menuTriggeredExitDialog = ref(false);
const pendingTabIndex = ref(null);
const activeTabIndex = ref(0);

const openSyncPricesDialog = ref(false);
const nonInsuranceProductActionType = ref('');
const syncDialogProcessed = ref(false);

const emailTemplateOptions = ref([]);
const declarationTemplateOptions = ref([]);

const planEndDate = computed(() => planStore.currentPlan?.end_date);
const { isAboutToExpire, expirationMessage } = useExpiration(planEndDate, 30);

const setShowExitEditDialog = (value) => {
    showExitEditDialog.value = value;
};

const setPendingTabIndex = (value) => {
    pendingTabIndex.value = value;
};

const setMenuTriggeredExitDialog = (value) => {
    menuTriggeredExitDialog.value = value;
};

onBeforeMount(async () => {
    await getItem();
    checkPendingSyncs();
});

onMounted(() => {
    setTimeout(() => {
        setupTabPrevention(
            setShowExitEditDialog,
            setPendingTabIndex,
            setMenuTriggeredExitDialog
        );
    }, 100);
});

onUnmounted(() => {
    bus.value.set('openSyncPricesDialog', null);
    syncDialogProcessed.value = false;
    clearTabListeners();
});

watch(
    () => bus.value.get('reloadPlanDetails'),
    async () => {
        await getItem();
    }
);

watch(
    () => bus.value.get('reloadDeclarationText'),
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

const handleTabClick = (tabIndex) => {
    const event = { index: tabIndex };
    handleTabChange(event);
};

const checkPendingSyncs = () => {
    if (!syncDialogProcessed.value) {
        const nonInsuranceProductAction = bus.value.get('openSyncPricesDialog');
        if (nonInsuranceProductAction) {
            bus.value.set('openSyncPricesDialog', null);
            nonInsuranceProductActionType.value = nonInsuranceProductAction;
            handleNonInsuranceProductSync(nonInsuranceProductAction);
            syncDialogProcessed.value = true;
        }
    }
};

const handleNonInsuranceProductChanged = async (action) => {
    if (action !== 'disabled') {
        nonInsuranceProductActionType.value = action;
        let prices = await planStore.searchPlanPrices(props.id, {}, {});
        if (prices.data.length > 0) {
            openSyncPricesDialog.value = true;
        } else {
            await syncPricesDirectly('nonInsuranceProduct');
        }
    }
};

const handleNonInsuranceProductSync = async (action) => {
    let prices = await planStore.searchPlanPrices(props.id, {}, {});
    if (prices.data.length > 0) {
        openSyncPricesDialog.value = true;
    } else {
        await syncPricesDirectly('nonInsuranceProduct');
    }
};

const syncPricesDirectly = async (context = 'benefit') => {
    await planStore.syncPrices(props.id);
    await getItem();
};

const handleSyncDialogClose = () => {
    openSyncPricesDialog.value = false;
    nonInsuranceProductActionType.value = '';
    bus.value.set('openSyncPricesDialog', null);
    syncDialogProcessed.value = true;
    getItem();
};
const menuItems = computed(() => {
    return [
        {
            label: t('buttons.duplicate'),
            icon: 'pi pi-copy',
            command: () => duplicateItem()
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog()
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog()
        }
    ];
});

const isItemActive = computed(() => {
    return item.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('plans.make_plan_inactive')
        : t('plans.make_plan_active');
});

const showStatusUpdateDialog = () => {
    if (activeEditComponent.value) {
        pendingAction.value = 'status';
        showExitEditDialog.value = true;
    } else {
        statusUpdateDialog.value = true;
    }
};

const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: helpers.getLocaleValue(item.value?.name)
          })
        : t('common.are_you_sure_active', {
              item: helpers.getLocaleValue(item.value?.name)
          });
});

const showMenu = (event) => {
    if (activeEditComponent.value) {
        menuTriggeredExitDialog.value = true;
        showExitEditDialog.value = true;
    } else {
        menu.value.toggle(event);
    }
};

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const deleteDialogContent = computed(() => {
    return t('plans.delete_plan_content', {
        item: helpers.getLocaleValue(item.value.name)
    });
});

const getItem = async () => {
    loading.value = true;
    const res = await planStore.getPlan(props.id, {
        include:
            'authorized,periods,periods.cancellationPeriods,periods.extensionPeriods,periods.earlyReturnPeriods,nonInsuranceProducts,alternateInsurance,alternateInsurance.fixedWindowPeriods,alternateInsurance.eligibilityPeriods',
        'aggregates[0][relation]': 'benefits',
        'aggregates[0][type]': 'count',
        'aggregates[1][relation]': 'benefitGroupBenefits',
        'aggregates[1][type]': 'count'
    });
    loading.value = false;
    planStore.setCurrentPlan(res.data);
    item.value = planStore.transferObject(res.data);
    alternateInsuranceItem.value = planStore.getAlternateInsuranceFormData();
    await nextTick();
    setupTabPrevention(
        setShowExitEditDialog,
        setPendingTabIndex,
        setMenuTriggeredExitDialog
    );
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...item.value,
            status: item.value.status == 'active' ? 'inactive' : 'active'
        };
        await planStore.updatePlanStatus(item.value.id, payload);
        await getItem();
        clearActiveComponent();
    } finally {
        loading.value = false;
    }
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const deleteItem = async () => {
    try {
        busy.value = true;
        await planStore.deletePlan(item.value.id);
        router.go(-1);
    } finally {
        busy.value = false;
    }
};

const goBack = () => {
    router.push({ name: 'Plans' });
};

const handleTabChange = (event) => {
    if (!activeEditComponent.value) {
        activeTabIndex.value = event.index;
    }
};

const duplicateItem = () => {};

const confirmExitEdit = () => {
    showExitEditDialog.value = false;
    const wasMenuTriggered = menuTriggeredExitDialog.value;
    const pendingTab = pendingTabIndex.value;
    menuTriggeredExitDialog.value = false;
    pendingTabIndex.value = null;
    wasMenuTriggered && setForceSkipConfirmation(true);

    triggerCancelEdit();
    setTimeout(
        () => {
            if (wasMenuTriggered && pendingTab !== null) {
                activeTabIndex.value = pendingTab;
            } else if (!wasMenuTriggered && pendingAction.value === 'status') {
                statusUpdateDialog.value = true;
            }
            pendingAction.value = null;
        },
        wasMenuTriggered ? 100 : 50
    );
};

const cancelExitEdit = () => {
    showExitEditDialog.value = false;
    pendingTabIndex.value = null;
};
</script>

<template>
    <Loader v-if="loading" />
    <div>
        <Header @goBack="router.go(-1)">
            <template #title>
                <div data-testid="plan-name-title" class="p-break-all">
                    {{
                        lodash.truncate(helpers.getLocaleValue(item.name), {
                            length: 80
                        })
                    }}
                </div>
                <StatusTag class="mx-2" :status="item.status" />
            </template>
            <template #actions>
                <div class="custom-button-header-action">
                    <Button
                        label="0"
                        icon="pi pi-check-square"
                        data-testid="square-button"
                        class="mr-2 p-button-outlined"
                        iconPos="left"
                    />
                    <Button
                        label="2"
                        icon="pi pi-comment"
                        data-testid="comment-button"
                        class="mr-2 p-button-outlined"
                        iconPos="left"
                    />
                    <Button
                        label="Actions"
                        data-testid="actions-button"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        :loading="busy"
                        @click="showMenu"
                    />
                    <Menu
                        ref="menu"
                        id="overlay_menu"
                        :model="menuItems"
                        :popup="true"
                    />
                </div>
            </template>
        </Header>

        <Tabs
            :value="activeTabIndex"
        >
            <TabList class="custom-tab">
                <Tab :value="0" @click="handleTabClick(0)">{{ $t('common.overview') }}</Tab>
                <Tab :value="1" @click="handleTabClick(1)">{{ $t('common.benefits') }}</Tab>
                <Tab :value="2" @click="handleTabClick(2)">{{ $t('common.pricing') }}</Tab>
                <Tab
                    v-if="item.is_opt_out"
                    :value="3"
                    @click="handleTabClick(3)"
                >{{ $t('plans.opt_out_settings') }}</Tab>
                <Tab
                    :value="item.is_opt_out ? 4 : 3"
                    @click="handleTabClick(item.is_opt_out ? 4 : 3)"
                >Documents</Tab>
                <Tab
                    :value="item.is_opt_out ? 5 : 4"
                    @click="handleTabClick(item.is_opt_out ? 5 : 4)"
                >{{ $t('common.audit_logs') }}</Tab>
            </TabList>
            <TabPanels>
                <TabPanel :value="0">
                    <div class="grid mt-4" v-if="!loading">
                        <div
                            v-if="isAboutToExpire"
                            class="col-span-12 mb-4">
                            <InputField
                                variant="message"
                                severity="error"
                                icon="pi pi-exclamation-triangle"
                                :closable="false"
                            >
                        <span class="font-bold">
                            {{ expirationMessage }}
                        </span>
                            </InputField>
                        </div>
                        <div class="col-span-12">
                            <div class="masonry-container">
                                <div class="masonry-column">
                                    <div class="masonry-item mb-4">
                                        <Card>
                                            <template #content>
                                                <PlanDetails
                                                    :data="item"
                                                    component-id="plan-details"
                                                />
                                            </template>
                                        </Card>
                                    </div>
                                    <div class="masonry-item">
                                        <Card>
                                            <template #content>
                                                <PlanDates
                                                    :data="item"
                                                    :validateDates="true"
                                                    component-id="plan-dates"
                                                />
                                            </template>
                                        </Card>
                                    </div>
                                    <div class="masonry-item mt-4">
                                        <Card>
                                            <template #content>
                                                <Bundles
                                                    :data="item"
                                                    component-id="bundles"
                                                    @nonInsuranceProductChanged="handleNonInsuranceProductChanged"
                                                />
                                            </template>
                                        </Card>
                                    </div>
                                </div>
                                <div class="masonry-column">
                                    <div class="masonry-item mb-4">
                                        <Card>
                                            <template #content>
                                                <PlanPolicyAction
                                                    :data="item"
                                                    component-id="plan-policy-action"
                                                />
                                            </template>
                                        </Card>
                                    </div>
                                    <div class="masonry-item">
                                        <Card>
                                            <template #content>
                                                <PlanPolicyDefaults
                                                    :data="item"
                                                    component-id="plan-policy-defaults"
                                                />
                                            </template>
                                        </Card>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </TabPanel>
                <TabPanel :value="1">
                    <Card class="mt-7">
                        <template #content>
                            <AttachBenefitInit
                                :id="props.id"
                                :title="$t('common.benefits')"
                                :store="planStore"
                                component-id="attach-benefit-init"
                            />
                        </template>
                    </Card>
                </TabPanel>
                <TabPanel :value="2">
                    <Card class="mt-7">
                        <template #content>
                            <AttachPricingInit
                                is-disabled-net-price
                                :isCopy="false"
                                :id="props.id"
                                :store="planStore"
                                :title="$t('plans.pricing')"
                                has-price-breakdown
                                can-recalculate-pricings
                                component-id="attach-pricing-init"
                                is-plan
                            />
                        </template>
                    </Card>
                </TabPanel>
                <TabPanel
                    v-if="item.is_opt_out"
                    :value="3"
                >
                    <Card class="mt-7">
                        <template #content>
                            <AlternateInsuranceDetails
                                ref="AlternateInsuranceDetailsRef"
                                :alternate-insurance-data="alternateInsuranceItem"
                                component-id="alternate-insurance-details"
                            />
                        </template>
                    </Card>
                    <Card class="mt-7">
                        <template #content>
                            <OptOutNotificationsEmailsDetails
                                ref="OptOutNotificationsEmailsDetailsRef"
                                :model-value="alternateInsuranceItem"
                                :template-options="emailTemplateOptions"
                                component-id="opt-out-notifications-emails-details"
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
                                editor-height="300px"
                                @template-changed="handleDeclarationTemplateChanged"
                                @content-changed="handleDeclarationContentChanged"
                                @view-full-content="handleViewFullContent"
                            />
                        </template>
                    </Card>
                </TabPanel>
                <TabPanel :value="item.is_opt_out ? 4 : 3">
                    <Card class="mt-7">
                        <template #content>
                            <DocumentsTable
                                :isNew="false"
                                type="plans"
                                :id="props.id"
                                component-id="documents-table"
                            />
                        </template>
                    </Card>
                </TabPanel>
                <TabPanel :value="item.is_opt_out ? 5 : 4">
                    <Card class="mt-7">
                        <template #content>
                            <AuditTable
                                entity="plan"
                                :entity_id="props.id"
                                component-id="audit-table"
                            />
                        </template>
                    </Card>
                </TabPanel>
            </TabPanels>
        </Tabs>

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
            v-if="statusUpdateDialog"
            v-model="statusUpdateDialog"
            :header="statusDialogHeader"
            :content="statusDialogContent"
            :confirm-button-class="statusDialogButtonClass"
            :confirm-button-text="statusDialogButtonText"
            @confirm="updateStatus"
        />
        <Confirmation
            v-if="deleteDialog"
            show-alert-icon
            confirm-button-class="p-button-danger"
            v-model="deleteDialog"
            :header="$t('plans.delete_plan_header')"
            :content="deleteDialogContent"
            @confirm="deleteItem"
        />
        <Confirmation
            v-model="showUnsavedDialog"
            show-alert-icon
            header="Discard Changes"
            content="Are you sure you want to discard changes made on this page?"
            confirm-button-class="p-button-danger"
            confirm-button-text="Discard"
            cancel-button-text="Continue Editing"
            class="w-auto"
            @confirm="confirmDiscard"
            @cancel="cancelDiscard"
        />

        <Confirmation
            v-model="showExitEditDialog"
            header="Exit Edit Mode"
            content="Are you sure you want to exit edit mode? Any changes made will be lost."
            confirm-button-class="p-button-danger"
            confirm-button-text="Exit Edit Mode"
            cancel-button-text="Continue Editing"
            class="w-auto"
            @confirm="confirmExitEdit"
            @cancel="cancelExitEdit"
        />
    </div>
</template>
