<script setup>
import lodash from 'lodash';
import AuditTable from '@/components/common/AuditTable.vue';
import { useRouter } from 'vue-router';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import { useHelpers } from '@/composables';
import { computed, onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import NonInsuranceProductDetails from '@/modules/plans/components/non-insurance-product/NonInsuranceProductDetails.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';
import TabList from 'primevue/tablist';

const props = defineProps({
    id: {
        type: [Object, String],
        required: true
    }
});

const router = useRouter();
const { t } = useI18n();
const nonInsuranceProductStore = useNonInsuranceProductStore();
const helpers = useHelpers();

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

const item = ref({});
const menu = ref();
const busy = ref(false);
const loading = ref(false);
const statusUpdateDialog = ref(false);
const deleteDialog = ref(false);
const pendingAction = ref(null);

const showExitEditDialog = ref(false);
const menuTriggeredExitDialog = ref(false);
const pendingTabIndex = ref(null);
const activeTabIndex = ref(0);

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
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog()
        }
    ];
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('non_insurance_products.make_non_insurance_product_inactive')
        : t('non_insurance_products.make_non_insurance_product_active');
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

const statusDialogButtonClass = computed(() => {
    return isItemActive.value ? 'p-button-danger' : 'p-button-success';
});

const statusDialogButtonText = computed(() => {
    return isItemActive.value
        ? t('common.make_inactive')
        : t('common.make_active');
});

onBeforeMount(() => {
    getItem();
});

const getItem = async () => {
    try {
        loading.value = true;
        const res = await nonInsuranceProductStore.getNonInsuranceProduct(
            props.id
        );
        item.value = res.data;
        nonInsuranceProductStore.setCurrentNonInsuranceProduct(res.data);
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await nonInsuranceProductStore.deleteNonInsuranceProduct(item.value.id);
    } finally {
        loading.value = false;
        goBack();
    }
};

const isItemActive = computed(() => {
    return item.value && item.value.status === 'active';
});

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...item.value,
            status: isItemActive.value ? 'inactive' : 'active'
        };
        await nonInsuranceProductStore.updateNonInsuranceProductStatus(
            item.value.id,
            payload
        );
        await getItem();
        clearActiveComponent();
    } finally {
        loading.value = false;
    }
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const showStatusUpdateDialog = () => {
    if (activeEditComponent.value) {
        showExitEditDialog.value = true;
    } else {
        statusUpdateDialog.value = true;
    }
};

const showMenu = (event) => {
    if (activeEditComponent.value) {
        menuTriggeredExitDialog.value = true;
        showExitEditDialog.value = true;
    } else {
        menu.value.toggle(event);
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

const handleTabClick = (tabIndex) => {
    const event = { index: tabIndex };
    handleTabChange(event);
};

const goBack = () => {
    router.push({ name: 'Non-Insurance Products' });
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
    <div v-else class="grid grid-cols-12">
        <div class="col-span-12">
            <Header @goBack="goBack">
                <template #title>
                    <div
                        class="p-break-word"
                        v-tooltip.bottom="helpers.getLocaleValue(item.name)"
                    >
                        {{
                            lodash.truncate(helpers.getLocaleValue(item.name), {
                                length: 30
                            })
                        }}
                    </div>
                    <StatusTag class="ml-2" :status="item.status" />
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
                    <Tab :value="0" @click="handleTabClick(0)">Overview</Tab>
                    <Tab :value="1" @click="handleTabClick(1)">Pricing</Tab>
                    <Tab :value="2" @click="handleTabClick(2)">Documents</Tab>
                    <Tab :value="3" @click="handleTabClick(3)">Audit Log</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel :value="0">
                        <div class="grid gap-4 grid-cols-12 mt-4">
                            <Card class="col-span-7">
                                <template #content>
                                    <NonInsuranceProductDetails
                                        :data="item"
                                        component-id="non-nsurance-product-details"
                                    />
                                </template>
                            </Card>
                        </div>
                    </TabPanel>
                    <TabPanel :value="1">
                        <div class="mt-4">
                            <Card>
                                <template #content>
                                    <AttachPricingInit
                                        :is-new="false"
                                        :id="props.id"
                                        :store="nonInsuranceProductStore"
                                        :title="
                                $t('common.non_insurance_product_pricing')
                            "
                                        :isNonInsuranceProduct="true"
                                        component-id="non-insurance-product-prices"
                                    />
                                </template>
                            </Card>
                        </div>
                    </TabPanel>
                    <TabPanel :value="2">
                        <div class="mt-4">
                            <Card>
                                <template #content>
                                    <DocumentsTable
                                        :isNew="false"
                                        type="non-insurance-products"
                                        :id="props.id"
                                        component-id="non-insurance-product-documents"
                                    />
                                </template>
                            </Card>
                        </div>
                    </TabPanel>
                    <TabPanel :value="3">
                        <div class="mt-4">
                            <Card>
                                <template #content>
                                    <AuditTable
                                        entity="non-insurance-product"
                                        :entity_id="props.id"
                                    />
                                </template>
                            </Card>
                        </div>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </div>
        <Confirmation
            v-model="statusUpdateDialog"
            :header="statusDialogHeader"
            :content="statusDialogContent"
            :confirm-button-class="statusDialogButtonClass"
            :confirm-button-text="statusDialogButtonText"
            @confirm="updateStatus"
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            :header="`Delete Non-Insurance Product`"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                item?.name
            )}?`"
            confirm-button-class="p-button-danger"
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
