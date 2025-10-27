<script setup>
import lodash from 'lodash';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useHelpers } from '@/composables';

import BenefitGroupsDetails from '@/modules/plans/components/benefit-groups/BenefitGroupsDetails.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import BenefitGroupsBenefits from '@/modules/plans/components/benefit-groups/BenefitGroupsBenefits.vue';
import AuditTable from '@/components/common/AuditTable.vue';
import Label from '@/components/common/Label.vue';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const benefitStore = useBenefitStore();
const helpers = useHelpers();
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
const item = ref({});
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);
const menu = ref();

const showExitEditDialog = ref(false);
const pendingAction = ref(null);
const menuTriggeredExitDialog = ref(false);
const pendingTabIndex = ref(null);
const activeTabIndex = ref(0);

onMounted(async () => {
    await getItem();
});

const menuItems = computed(() => {
    let allItems = [
        {
            label: t('buttons.duplicate'),
            icon: 'pi pi-copy',
            command: () => duplicateItem(),
            permission: 'update benefit groups'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update benefit groups'
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete benefit groups'
        }
    ];

    return helpers.filterByPermission(allItems);
});

const isItemActive = computed(() => {
    return item.value.status === 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('benefit_groups.make_benefit_group_inactive')
        : t('benefit_groups.make_benefit_group_active');
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
              item: helpers.getLocaleValue(item.value.name)
          })
        : t('common.are_you_sure_active', {
              item: helpers.getLocaleValue(item.value.name)
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
    return t('benefit_groups.delete_benefit_group_content', {
        item: helpers.getLocaleValue(item.value.name)
    });
});

const getItem = async () => {
    loading.value = true;
    const res = await benefitStore.getBenefitGroup(props.id);
    item.value = benefitStore.processResponse(res.data);
    loading.value = false;
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...item.value,
            status: item.value.status === 'active' ? 'inactive' : 'active'
        };
        await benefitStore.updateBenefitGroupStatus(item.value.id, payload);
        getItem();
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
        await benefitStore.deleteBenefitGroup(item.value.id);
        goBack();
    } finally {
        busy.value = false;
    }
};

const goBack = () => {
    router.push({ name: 'Benefit Groups' });
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
            wasMenuTriggered && pendingTab !== null
                ? (activeTabIndex.value = pendingTab)
                : !wasMenuTriggered && pendingAction.value === 'status'
                  ? (statusUpdateDialog.value = true)
                  : !wasMenuTriggered &&
                    pendingAction.value === 'delete' &&
                    (deleteDialog.value = true);

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
        <Header @goBack="goBack">
            <template #title>
                <div class="p-break-word">
                    <Label test-id="page-title">
                        {{
                            lodash.truncate(helpers.getLocaleValue(item.name), {
                                length: 80
                            })
                        }}</Label
                    >
                </div>
                <StatusTag
                    data-testid="status-tag"
                    class="mx-2"
                    :status="item.status"
                />
            </template>
            <template #actions>
                <Button
                    data-testid="actions-button"
                    v-if="menuItems.length > 0"
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
            <TabPanel>
                <template #header>
                    <Label test-id="overview-header-tab">{{
                        $t('common.overview')
                    }}</Label>
                </template>
                <div class="grid my-2">
                    <div class="col-8">
                        <Card>
                            <template #content>
                                <BenefitGroupsDetails
                                    :data="item"
                                    @reload="getItem"
                                    component-id="benefit-groups-details"
                                />
                            </template>
                        </Card>
                    </div>
                </div>
                <Card class="mt-3">
                    <template #content>
                        <BenefitGroupsBenefits
                            :id="props.id"
                            component-id="benefit-groups-benefits"
                        />
                    </template>
                </Card>
            </TabPanel>
            <TabPanel>
                <template #header>
                    <Label test-id="pricing-header-tab">{{
                        $t('common.pricing')
                    }}</Label>
                </template>
                <Card class="mt-5">
                    <template #content>
                        <AttachPricingInit
                            :is-new="false"
                            :isCopy="false"
                            :id="props.id"
                            :store="benefitStore"
                            :title="$t('common.benefit_group_pricing')"
                            :isBenefitGroup="true"
                            can-recalculate-pricings
                            has-price-breakdown
                            component-id="benefit-groups-prices"
                        />
                    </template>
                </Card>
            </TabPanel>
            <TabPanel>
                <template #header>
                    <Label test-id="documents-header-tab">Documents</Label>
                </template>
                <Card class="mt-5">
                    <template #content>
                        <DocumentsTable
                            type="benefit-groups"
                            :id="props.id"
                            :is-new="false"
                            permission="update benefit groups"
                            component-id="benefit-groups-documents"
                        />
                    </template>
                </Card>
            </TabPanel>
            <TabPanel>
                <template #header>
                    <Label test-id="audit-logs-header-tab">{{
                        $t('common.audit_logs')
                    }}</Label>
                </template>
                <Card class="mt-5">
                    <template #content>
                        <AuditTable
                            entity="benefit-group"
                            :entity_id="props.id"
                        />
                    </template>
                </Card>
            </TabPanel>
        </TabView>

        <Confirmation
            v-model="statusUpdateDialog"
            :header="statusDialogHeader"
            :content="statusDialogContent"
            :confirm-button-class="statusDialogButtonClass"
            :confirm-button-text="statusDialogButtonText"
            @confirm="updateStatus"
        />
        <Confirmation
            show-alert-icon
            confirm-button-class="p-button-danger"
            v-model="deleteDialog"
            :header="$t('benefit_groups.delete_benefit_group_header')"
            :content="deleteDialogContent"
            @confirm="deleteItem"
        />
        <Confirmation
            v-model="showUnsavedDialog"
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
