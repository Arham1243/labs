<script setup>
import lodash from 'lodash';
import { ref, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useCodeSetStore } from '../../../stores/CodeSet';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';
import { PaginationOptions, SortFilterOptions } from '@/config';
import Label from '@/components/common/Label.vue';

const { formatValue, initialize } = useDateFormatter();
const i18n = useI18n();
const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const codeSetStore = useCodeSetStore();

const menu = ref();
const items = ref([]);
const searchText = ref('');
const loading = ref(false);
const totalRecords = ref(0);
const selectedItem = ref(null);
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);
const status = ref('');
const confirmationButtonClass = ref('');
const menuItems = ref([]);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onBeforeMount(async () => {
    await initialize();
    await getItems();
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return t(`services.make_code_group_${status.value}`);
});

const statusDialogContent = computed(() => {
    return t(`common.are_you_sure_${status.value}`, {
        item: helpers.getLocaleValue(selectedItem.value?.name)
    });
});

const statusDialogButtonClass = (newStatus) => {
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

const statusDialogButtonText = computed(() => {
    return t(`common.make_${status.value}`);
});

const showActions = (event, item) => {
    selectedItem.value = item;

    const allItems = [
        {
            label: 'View',
            icon: 'pi pi-eye',
            command: () => goToView(),
            permission: 'view service code groups'
        },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () =>
                showStatusUpdateDialog(
                    selectedItem.value.status === 'active'
                        ? 'inactive'
                        : 'active'
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

    menuItems.value = helpers.filterByPermission(allItems);

    menu.value.toggle(event);
};

const goToView = () => {
    router.push({
        name: 'Code Group Details',
        params: { id: selectedItem.value.id }
    });
};

const rowClicked = ({ data }) => {
    router.push({
        name: 'Code Group Details',
        params: { id: data.id }
    });
};

const showStatusUpdateDialog = (newStatus) => {
    status.value = newStatus;
    statusDialogButtonClass(newStatus);
    statusUpdateDialog.value = true;
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
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

const getItems = async () => {
    try {
        loading.value = true;
        const params = pagination.getPageParams();
        const payload = sortFilters.getSortFilters();
        const res = await codeSetStore.searchCodeGroups(payload, params);
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};

const updateStatus = async () => {
    try {
        loading.value = true;
        const payload = {
            ...selectedItem.value,
            status: status.value
        };
        await codeSetStore.updateCodeGroup(selectedItem.value.id, payload);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await codeSetStore.deleteCodeGroup(selectedItem.value.id);
        await getItems();
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <div>
        <BaseTable
            :value="items"
            :loading="loading"
            :page="pagination.page"
            :rows="pagination.limit"
            :total-records="totalRecords"
            @row-click="rowClicked"
            @page="onPageChange"
            @sort="onSortChange"
            data-testid="code-groups-table"
        >
            <template #header>
                <Search
                    v-model="searchText"
                    data-testid="input-search"
                    @search="search"
                />
            </template>
            <template #empty>
                <Label test-id="empty-state-message">
                    No services found.
                </Label>
            </template>
            <template #loading> Loading services. Please wait. </template>
            <Column
                sortable
                :field="`name->${i18n.locale.value}`"
                header="Name"
                class="p-break-word"
            >
                <template #body="{ data, index }">
                    <span
                        :data-testid="'name-data-table-' + index"
                        v-tooltip.top="helpers.getLocaleValue(data.name)"
                        class="cursor-pointer"
                    >
                        {{
                            lodash.truncate(helpers.getLocaleValue(data.name), {
                                length: 45
                            })
                        }}
                    </span>
                </template>
            </Column>
            <Column sortable field="effective_date" header="Effective Date">
                <template #body="{ data, index }">
                    <span :data-testid="'effective-date-data-table-' + index">
                        {{
                            formatValue(data.effective_date, {
                                type: 'date',
                                format: 'short'
                            })
                        }}
                    </span>
                </template>
            </Column>
            <Column sortable field="updated_at" header="Last Updated">
                <template #body="{ data, index }">
                    <span :data-testid="'last-update-data-table-' + index">
                        {{
                            formatValue(data.updated_at, {
                                type: 'date',
                                format: 'short'
                            })
                        }}
                    </span>
                </template>
            </Column>
            <Column sortable field="status" header="Status">
                <template #body="{ data, index }">
                    <StatusTag
                        :status="data.status"
                        :data-testid="'status-tag-' + index"
                    />
                </template>
            </Column>
            <Column>
                <template #body="{ data, index }">
                    <Button
                        label="Actions"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        size="small"
                        class="p-button-outlined"
                        @click="showActions($event, data)"
                        :data-testid="'actions-button-' + index"
                    />
                    <Menu
                        ref="menu"
                        id="overlay_menu"
                        :model="menuItems"
                        :popup="true"
                        data-testid="actions-menu"
                    />
                </template>
            </Column>
        </BaseTable>
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
            :header="`Delete Code Group`"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                selectedItem?.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
            data-testid="delete-dialog"
        />
    </div>
</template>
