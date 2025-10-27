<script setup>
import {
    computed,
    onBeforeMount,
    onMounted,
    onUnmounted,
    ref,
    watch
} from 'vue';
import { useRouter } from 'vue-router';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import lodash from 'lodash';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useClientStore } from '@/modules/clients/stores';
import { useI18n } from 'vue-i18n';
import AttachBenefitInit from '@/modules/plans/components/shared/AttachBenefit/AttachBenefitInit.vue';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';
import PlanDetails from '@/modules/plans/components/plans/associated/PlanDetails.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import AuditTable from '@/components/common/AuditTable.vue';
import PlanDates from '@/modules/plans/components/plans/associated/PlanDates.vue';
import SectionPlanDetails from '@/modules/plans/components/plans/associated/partials/SectionPlanDetails.vue';
import PlanRecentGraduate from '@/modules/plans/components/plans/associated/PlanRecentGraduate.vue';
import useEventsBus from '@/composables/event-bus';
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

const { bus } = useEventsBus();
const router = useRouter();
const { t } = useI18n();

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
const associatedPlanStore = useAssociatedPlanStore();
const planStore = usePlanStore();
const clientStore = useClientStore();
const item = ref({});
const menu = ref();
const planDetails = ref({});
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);

const showExitEditDialog = ref(false);
const pendingAction = ref(null);
const menuTriggeredExitDialog = ref(false);
const pendingTabIndex = ref(null);
const activeTabIndex = ref(0);

const openSyncPricesDialog = ref(false);
const nonInsuranceProductActionType = ref('');
const syncDialogProcessed = ref(false);

const menuItems = computed(() => {
    return [
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

onBeforeMount(async () => {
    await getItem();
    checkPendingSyncs();
});

watch(
    () => bus.value.get('reloadPlan'),
    async () => {
        await getItem();
    }
);

watch(
    () => bus.value.get('reloadAssociatedPlanDetails'),
    async () => {
        await setPlan();
    }
);

const isItemActive = computed(() => {
    return item.value.status === 'active';
});

const getItem = async () => {
    loading.value = true;

    const res = await associatedPlanStore.getPlan(props.plan, props.id, {
        include:
            'authorized,gapPeriods.planPeriod,earlyArrivalPeriods.planPeriod,plan,nonInsuranceProducts,dependantsSetting.dependantsSettingsPricingDiscounts',
        'aggregates[0][relation]': 'benefits',
        'aggregates[0][type]': 'count',
        'aggregates[1][relation]': 'benefitGroupBenefits',
        'aggregates[1][type]': 'count'
    });

    associatedPlanStore.setCurrentPlan(lodash.cloneDeep(res.data));
    item.value = associatedPlanStore.transferObject(res.data);

    await getPlan();

    loading.value = false;
};

const setPlan = async () => {
    const res = await associatedPlanStore.getPlan(props.plan, props.id, {
        include:
            'authorized,gapPeriods.planPeriod,earlyArrivalPeriods.planPeriod,plan,nonInsuranceProducts,dependantsSetting.dependantsSettingsPricingDiscounts',
        'aggregates[0][relation]': 'benefits',
        'aggregates[0][type]': 'count',
        'aggregates[1][relation]': 'benefitGroupBenefits',
        'aggregates[1][type]': 'count'
    });
    associatedPlanStore.setCurrentPlan(lodash.cloneDeep(res.data));
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

    associatedPlanStore.setParentPlan({
        ...planDetails.value,
        business_unit: res.data
    });

    planDetails.value.business_unit.client_id = res.data.client_id;
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
                    await syncPricesDirectly('nonInsuranceProduct');
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
                await syncPricesDirectly('nonInsuranceProduct');
            }
        } catch (error) {
            console.error('Error checking prices:', error);
        }
    }
};

const handleNonInsuranceProductSync = async (action) => {
    let prices = await associatedPlanStore.searchPlanPrices(props.id, {}, {});
    if (prices.data.length > 0) {
        openSyncPricesDialog.value = true;
    } else {
        await syncPricesDirectly('nonInsuranceProduct');
    }
};

const syncPricesDirectly = async (context = 'benefit') => {
    try {
        await associatedPlanStore.syncPrices(props.id);
        await getItem();
    } catch (error) {
        console.error('Error syncing prices:', error);
    }
};

const handleSyncDialogClose = () => {
    openSyncPricesDialog.value = false;
    nonInsuranceProductActionType.value = '';
    getItem();
};

const showMenu = (event) => {
    if (activeEditComponent.value) {
        menuTriggeredExitDialog.value = true;
        showExitEditDialog.value = true;
    } else {
        menu.value.toggle(event);
    }
};

const showStatusUpdateDialog = () => {
    if (activeEditComponent.value) {
        pendingAction.value = 'status';
        showExitEditDialog.value = true;
    } else {
        statusUpdateDialog.value = true;
    }
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: 'associated plan'
          })
        : t('common.are_you_sure_active', {
              item: 'associated plan'
          });
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('plans.associated.make_associated_plan_inactive')
        : t('plans.associated.make_associated_plan_active');
});

const deleteDialogContent = computed(() => {
    return t('plans.delete_plan_content', {
        item: 'the associated plan'
    });
});

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            status: item.value.status === 'active' ? 'inactive' : 'active'
        };
        await associatedPlanStore.updatePlanStatus(item.value.id, payload);
        await getItem();
        clearActiveComponent();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        busy.value = true;
        await associatedPlanStore.deletePlan(props.plan, item.value.id);
        router.go(-1);
    } finally {
        busy.value = false;
    }
};

const setShowExitEditDialog = (value) => {
    showExitEditDialog.value = value;
};

const setPendingTabIndex = (value) => {
    pendingTabIndex.value = value;
};

const setMenuTriggeredExitDialog = (value) => {
    menuTriggeredExitDialog.value = value;
};

onMounted(async () => {
    await getItem();
    setTimeout(() => {
        setupTabPrevention(
            setShowExitEditDialog,
            setPendingTabIndex,
            setMenuTriggeredExitDialog
        );
    }, 100);
});

onUnmounted(() => {
    clearTabListeners();
});

const handleTabChange = (event) => {
    if (!activeEditComponent.value) {
        activeTabIndex.value = event.index;
    }
};

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
    <div v-else>
        <Header @goBack="router.go(-1)">
            <template #title>
                <div>
                    <div class="flex align-items-center">
                        <div class="p-break-word">
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
                </div>
            </template>
            <template #actions>
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
            </template>
        </Header>
        <TabView
            v-model:activeIndex="activeTabIndex"
            @tab-change="handleTabChange"
        >
            <TabPanel :header="$t('common.overview')">
                <div class="grid my-2" v-if="!loading">
                    <div class="grid mt-2">
                        <div class="col-7">
                            <Card class="mb-4">
                                <template #content>
                                    <PlanDetails
                                        :data="item"
                                        :plan="plan"
                                        component-id="plan-details"
                                    />
                                </template>
                            </Card>
                            <Card
                                v-if="
                                    ['gap', 'early_arrivals'].includes(
                                        item.category?.code
                                    )
                                "
                            >
                                <template #content>
                                    <PlanDates
                                        :data="item"
                                        :plan="plan"
                                        :periods="planDetails.periods"
                                        component-id="plan-dates"
                                    />
                                </template>
                            </Card>
                            <Card
                                v-if="
                                    ['recent_graduate'].includes(
                                        item.category?.code
                                    )
                                "
                            >
                                <template #content>
                                    <PlanRecentGraduate
                                        :data="item"
                                        :plan="plan"
                                        component-id="plan-recent-graduate"
                                    />
                                </template>
                            </Card>
                            <Card class="mt-3">
                                <template #content>
                                    <Bundles
                                        :data="item"
                                        variant="associatedPlan"
                                        @nonInsuranceProductChanged="
                                            handleNonInsuranceProductChanged
                                        "
                                        component-id="bundles"
                                    />
                                </template>
                            </Card>
                        </div>
                        <div class="col-5">
                            <Loader v-if="loading" />
                            <SectionPlanDetails v-else :plan="planDetails" />
                        </div>
                    </div>
                    <div v-if="['dependants'].includes(item.category?.code)">
                        <div class="grid mt-2">
                            <div class="col-12">
                                <Card>
                                    <template #content>
                                        <DependantSettings
                                            :data="item"
                                            :plan="plan"
                                            :planDetails="planDetails"
                                            component-id="dependant-settings"
                                        />
                                    </template>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </TabPanel>
            <TabPanel :header="$t('common.benefits')">
                <Card class="mt-5">
                    <template #content>
                        <AttachBenefitInit
                            is-copy
                            :id="props.id"
                            :title="$t('common.benefits')"
                            :store="associatedPlanStore"
                            component-id="attach-benefit-init"
                        />
                    </template>
                </Card>
            </TabPanel>
            <TabPanel :header="$t('common.pricing')">
                <Card class="mt-5">
                    <template #content>
                        <AttachPricingInit
                            is-disabled-net-price
                            is-copy
                            :id="props.id"
                            :store="associatedPlanStore"
                            :title="$t('plans.pricing')"
                            has-price-breakdown
                            can-recalculate-pricings
                            :parent="associatedPlanStore.parentPlan.id ?? ''"
                            component-id="attach-pricing-init"
                            is-associated-plan
                        />
                    </template>
                </Card>
            </TabPanel>
            <TabPanel header="Documents">
                <Card class="mt-5">
                    <template #content>
                        <DocumentsTable
                            :isNew="false"
                            type="associated-plans"
                            :id="props.id"
                            component-id="documents-table"
                        />
                    </template>
                </Card>
            </TabPanel>
            <TabPanel :header="$t('common.audit_logs')">
                <Card class="mt-5">
                    <template #content>
                        <AuditTable
                            entity="associated-plan"
                            :entity_id="props.id"
                            component-id="audit-table"
                        />
                    </template>
                </Card>
            </TabPanel>
        </TabView>

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
            :header="$t('plans.associated.delete_associated_plan_header')"
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
