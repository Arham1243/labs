<script setup>
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRegionStore } from '@/modules/administration/stores';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions } from '@/config';
import Label from '@/components/common/Label.vue';
import AuditTable from '@/components/common/AuditTable.vue';

const regionStore = useRegionStore();
const { t } = useI18n();
const helpers = useHelpers();

const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const items = ref([]);
const statusUpdateDialog = ref(false);
const searchText = ref('');
const totalRecords = ref();
const statusAuditTableDialog = ref(false);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onBeforeMount(async () => {
    await getItems();
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];
    const allMenuItems = [
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update regions'
        },
        {
            label: t('common.audit_log'),
            icon: 'pi pi-history',
            command: () => showAuditTableDialog(),
            permission: 'view regions'
        }
    ];

    return helpers.filterByPermission(allMenuItems);
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('common.make_item_inactive', { item: t('common.region') })
        : t('common.make_item_active', { item: t('common.region') });
});

const statusDialogContent = computed(() =>
    isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: selectedItem.value?.name
          })
        : t('common.are_you_sure_active', {
              item: selectedItem.value?.name
          })
);

const statusDialogButtonClass = computed(() =>
    isItemActive.value ? 'p-button-danger' : 'p-button-success'
);

const statusDialogButtonText = computed(() =>
    isItemActive.value ? t('common.make_inactive') : t('common.make_active')
);

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const payload = sortFilters.getSortFilters(searchText.value);
        const res = await regionStore.searchItems(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getItems();
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getItems();
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

const updateStatus = async () => {
    if (!selectedItem.value) return;

    try {
        loading.value = true;
        const newStatus =
            selectedItem.value.status === 'active' ? 'inactive' : 'active';
        const payload = { ...selectedItem.value, status: newStatus };

        await regionStore.updateStatus(selectedItem.value.id, payload);
        selectedItem.value.status = payload.status;
    } finally {
        loading.value = false;
    }
};

const showAuditTableDialog = () => {
    statusAuditTableDialog.value = true;
};
</script>

<template>
    <BaseTable
        :value="items"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        :loading="loading"
        @sort="onSortChange"
        @page="onPageChange"
    >
        <template #header>
            <div class="flex justify-content-between mb-2">
                <Search
                    v-model="searchText"
                    data-testId="search-input"
                    @search="search"
                    :style="{ width: '25vw' }"
                />
            </div>
        </template>

        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('common.regions').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading>{{
            $t('common.datatable_loading', {
                item: $t('common.regions').toLowerCase()
            })
        }}</template>

        <Column :sortable="true" field="name">
            <template #header>
                <Label testId="table-header-name">{{
                    $t('common.region_name')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'name-data-table-' + index">
                    {{ data.name }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="id">
            <template #header>
                <Label testId="table-header-code">{{
                    $t('common.code')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'code-data-table-' + index">
                    {{ data.id }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="status">
            <template #header>
                <Label testId="table-header-status">{{
                    $t('common.status')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <StatusTag
                    :status="data.status"
                    :data-testid="'status-tag-' + index"
                />
            </template>
        </Column>

        <Column :sortable="true" field="updated_at" class="w-2">
            <template #header>
                <Label testId="table-header-updated-at">{{
                    $t('common.last_updated')
                }}</Label>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'last-updated-data-table-' + index">
                    {{ helpers.formatDate(data.updated_at) }}
                </span>
            </template>
        </Column>

        <Column v-if="$ability.can('update regions')">
            <template #body="{ data, index }">
                <Button
                    :label="t('common.actions')"
                    icon="pi pi-chevron-down"
                    iconPos="right"
                    size="small"
                    class="p-button-outlined ml-auto flex"
                    @click="showActions($event, data)"
                    :data-testid="'actions-button-' + index"
                />
                <Menu
                    ref="menu"
                    id="overlay_menu"
                    :model="menuItems"
                    :popup="true"
                    :data-testid="'actions-menu-' + index"
                />
            </template>
        </Column>
    </BaseTable>

    <Confirmation
        v-model="statusUpdateDialog"
        :header="statusDialogHeader"
        :content="statusDialogContent"
        :confirm-button-class="statusDialogButtonClass"
        :confirm-button-text="statusDialogButtonText"
        @confirm="updateStatus"
        dialog-testid="status-update-dialog"
        close-button-testid="status-update-close-button"
        cancel-button-testid="status-update-cancel-button"
        confirm-button-testid="status-update-confirm-button"
        header-testid="status-update-title"
        content-testid="status-update-content"
        v-if="$ability.can('update regions')"
    />

    <Dialog
        data-testid="audit-log-dialog"
        :closable="false"
        v-model:visible="statusAuditTableDialog"
        :style="{ width: '80vw' }"
        modal
    >
        <template #header>
            <div class="flex align-items-center justify-content-between w-full">
                <div
                    class="p-dialog-title"
                    data-testid="audit-log-dialog-title"
                >
                    {{ $t('common.audit_logs') }}
                </div>
                <Button
                    icon="pi pi-times"
                    class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                    data-testid="audit-log-dialog-close-button"
                    @click="statusAuditTableDialog = false"
                    aria-label="Close"
                />
            </div>
        </template>
        <template #default>
            <AuditTable entity="region" :entity_id="selectedItem?.id" />
        </template>
    </Dialog>
</template>
