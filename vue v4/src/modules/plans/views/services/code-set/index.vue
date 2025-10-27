<script setup>
import lodash from 'lodash';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCodeSetStore } from '../../../stores/CodeSet';
import { useHelpers } from '@/composables';

import AuditTable from '@/components/common/AuditTable.vue';
import CodeSetDetails from '../../../components/services/CodeSetDetails.vue';
import CodeSetsServiceCodes from '../../../components/services/CodeSetsServiceCodes.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';
import TabList from 'primevue/tablist';

const props = defineProps({
    id: {
        type: String,
        required: true
    }
});

const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const codeSetStore = useCodeSetStore();

const {
    showUnsavedDialog,
    activeEditComponent,
    confirmDiscard,
    cancelDiscard,
    clearActiveComponent,
    triggerCancelEdit,
    setForceSkipConfirmation,
    setupTabPrevention,
    clearTabListeners
} = provideEditState();

const menu = ref();
const item = ref({});
const busy = ref(false);
const loading = ref(false);
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);
const status = ref('');
const confirmationButtonClass = ref('');

const showExitEditDialog = ref(false);
const menuTriggeredExitDialog = ref(false);
const pendingTabIndex = ref(null);
const activeTabIndex = ref(0);

onMounted(async () => {
    await getItem();
});

const isItemActive = computed(() => {
    return item.value && item.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return t(`services.make_code_set_${status.value}`);
});

const statusDialogContent = computed(() => {
    return t(`common.are_you_sure_${status.value}`, {
        item: helpers.getLocaleValue(item.value?.name)
    });
});

const statusDialogButtonText = computed(() => {
    return t(`common.make_${status.value}`);
});

const getItem = async () => {
    loading.value = true;
    const res = await codeSetStore.getCodeSet(props.id);
    item.value = res.data;
    codeSetStore.setCurrentCodeSet(res.data);
    loading.value = false;
};

const menuItems = computed(() => {
    const items = [
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () =>
                showStatusUpdateDialog(
                    item.value.status == 'active' ? 'inactive' : 'active'
                ),
            permission: 'update service code sets'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete service code sets'
        }
    ];

    return helpers.filterByPermission(items);
});

const showMenu = (event) => {
    if (activeEditComponent.value) {
        menuTriggeredExitDialog.value = true;
        showExitEditDialog.value = true;
    } else {
        menu.value.toggle(event);
    }
};

const goBack = () => {
    router.push({ name: 'Code Sets' });
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

const showStatusUpdateDialog = (newStatus) => {
    if (activeEditComponent.value) {
        status.value = newStatus;
        showExitEditDialog.value = true;
        statusColor(newStatus);
    } else {
        status.value = newStatus;
        statusUpdateDialog.value = true;
        statusColor(newStatus);
    }
};

const statusColor = (newStatus) => {
    switch (newStatus) {
        case 'active':
            confirmationButtonClass.value = 'p-button-success';
            return;
        case 'inactive':
            confirmationButtonClass.value = 'p-button-danger';
            return;
        case 'draft':
            confirmationButtonClass.value = 'p-button-secondary';
            return;
    }
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const updateStatus = async () => {
    try {
        busy.value = true;
        const payload = {
            ...item.value,
            status: status.value
        };
        const res = await codeSetStore.updateCodeSet(item.value.id, payload);
        getItem();
        clearActiveComponent();
    } finally {
        busy.value = false;
    }
};

const deleteItem = async () => {
    try {
        busy.value = true;
        await codeSetStore.deleteCodeSet(props.id);
        goBack();
    } finally {
        busy.value = false;
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
            wasMenuTriggered && pendingTab !== null
                ? (activeTabIndex.value = pendingTab)
                : !wasMenuTriggered && (statusUpdateDialog.value = true);
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
                <div class="p-break-all" data-testid="code-set-name-label">
                    {{ lodash.truncate( helpers.getLocaleValue( codeSetStore.currentCodeSet?.name), { length: 80 }) }}
                </div>
                <StatusTag class="ml-4" :status="item.status" />
            </template>
            <template #actions>
                <div class="custom-button-header-action">
                    <Button
                        label="Actions"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        :loading="busy"
                        @click="showMenu"
                        v-if="menuItems.length > 0"
                        data-testid="actions-button"
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

        <Tabs :value="activeTabIndex">
            <TabList class="custom-tab">
                <Tab :value="0" @click="handleTabClick(0)">Overview</Tab>
                <Tab :value="1" @click="handleTabClick(1)">Audit Log</Tab>
            </TabList>
            <TabPanels>
                <TabPanel :value="0">
                    <div class="grid grid-cols-12 mt-4">
                        <div class="col-span-8">
                            <Card>
                                <template #content>
                                    <CodeSetDetails
                                        :data="item"
                                        @reloadItem="getItem"
                                        component-id="code-set-details"
                                    />
                                </template>
                            </Card>
                        </div>
                    </div>

                    <Card class="mt-7">
                        <template #content>
                            <CodeSetsServiceCodes
                                :id="id"
                                component-id="code-sets-service-codes"
                            />
                        </template>
                    </Card>
                </TabPanel>
                <TabPanel :value="1">
                    <div class="grid grid-cols-12 mt-4">
                        <div class="col-span-12">
                            <Card>
                                <template #content>
                                    <AuditTable
                                        entity="service-code-set"
                                        :entity_id="props.id"
                                        component-id="audit-table"
                                    />
                                </template>
                            </Card>
                        </div>
                    </div>
                </TabPanel>
            </TabPanels>
        </Tabs>

        <Confirmation
            v-if="$ability.can('update service code sets')"
            v-model="statusUpdateDialog"
            :header="statusDialogHeader"
            :content="statusDialogContent"
            :confirm-button-class="confirmationButtonClass"
            :confirm-button-text="statusDialogButtonText"
            @confirm="updateStatus"
            data-testid="update-status-dialog"
        />
        <Confirmation
            v-if="$ability.can('delete service code sets')"
            v-model="deleteDialog"
            show-alert-icon
            header="Delete Code Set"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                item.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
            data-testid="delete-item-dialog"
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
