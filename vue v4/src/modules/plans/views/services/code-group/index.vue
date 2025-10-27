<script setup>
import lodash from 'lodash';
import { ref, computed, onBeforeMount, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useCodeSetStore } from '../../../stores/CodeSet';
import { useHelpers } from '@/composables';

import AuditTable from '@/components/common/AuditTable.vue';
import CodeGroupDetails from '../../../components/services/CodeGroupDetails.vue';
import CodeGroupsServiceCodes from '../../../components/services/CodeGroupsServiceCodes.vue';
import { provideEditState } from '@/modules/plans/composables/useEditState';
import CodeSetsServiceCodes from '@/modules/plans/components/services/CodeSetsServiceCodes.vue';
import CodeSetDetails from '@/modules/plans/components/services/CodeSetDetails.vue';
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
const itemToUpdate = ref({});
const busy = ref(false);
const loading = ref(false);
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);
const status = ref('');
const menuItems = ref([]);
const confirmationButtonClass = ref('');

const showExitEditDialog = ref(false);
const menuTriggeredExitDialog = ref(false);
const pendingTabIndex = ref(null);
const activeTabIndex = ref(0);

onBeforeMount(async () => {
    await getItem();
});

const isItemActive = computed(() => {
    return item.value && item.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return t(`services.make_code_group_${status.value}`);
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
    try {
        loading.value = true;
        const res = await codeSetStore.getCodeGroup(props.id);
        item.value = res.data;
        codeSetStore.setCurrentCodeGroup(res.data);
        itemToUpdate.value = res.data;
    } finally {
        loading.value = false;
    }
};

const setMenuItems = () => {
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
            permission: 'update service code groups'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete service code groups'
        }
    ];

    menuItems.value = helpers.filterByPermission(items);

    return menuItems;
};

const showMenu = (event) => {
    if (activeEditComponent.value) {
        menuTriggeredExitDialog.value = true;
        showExitEditDialog.value = true;
    } else {
        menu.value.toggle(event);
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

const goBack = () => {
    router.push({ name: 'Code Groups' });
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
        const res = await codeSetStore.updateCodeGroup(item.value.id, payload);
        item.value = res.data;
        clearActiveComponent();
    } finally {
        busy.value = false;
    }
};

const deleteItem = async () => {
    try {
        busy.value = true;
        await codeSetStore.deleteCodeGroup(props.id);
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
                <div class="p-break-all" data-testid="code-group-name-label">
                    {{
                        lodash.truncate(
                            helpers.getLocaleValue(
                                codeSetStore.currentCodeGroup?.name
                            ),
                            {
                                length: 80
                            }
                        )
                    }}
                </div>
                <StatusTag class="ml-2" :status="item.status" />
            </template>
            <template #actions>
                <Button
                    :label="$t('common.actions')"
                    icon="pi pi-chevron-down"
                    iconPos="right"
                    @click="showMenu"
                    v-if="setMenuItems().value.length > 0"
                    data-testid="actions-button"
                />
                <Menu
                    ref="menu"
                    id="overlay_menu"
                    :model="menuItems"
                    :popup="true"
                />
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
                                    <CodeGroupDetails
                                        :data="item"
                                        @reloadItem="getItem"
                                        component-id="code-group-details"
                                    />
                                </template>
                            </Card>
                        </div>
                    </div>

                    <Card class="mt-7">
                        <template #content>
                            <CodeGroupsServiceCodes
                                :id="id"
                                :code-set-id="item.service_code_set?.id"
                                component-id="code-groups-service-codes"
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
                                        entity="service-code-group"
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
            v-model="statusUpdateDialog"
            :header="statusDialogHeader"
            :content="statusDialogContent"
            :confirm-button-class="confirmationButtonClass"
            :confirm-button-text="statusDialogButtonText"
            @confirm="updateStatus"
            data-testid="status-update-dialog"
        />

        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            :header="$t('services.delete_code_group_header')"
            :content="
                $t('services.delete_code_group_content', {
                    item: lodash.truncate(
                        helpers.getLocaleValue(
                            codeSetStore.currentCodeGroup?.name
                        ),
                        {
                            length: 50
                        }
                    )
                })
            "
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
            data-testid="delete-code-group-dialog"
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
