<script setup>
import { useHelpers } from '@/composables';
import { ref, computed, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useClientStore } from '@/modules/clients/stores';
import { useI18n } from 'vue-i18n';
import { PaginationOptions, SortFilterOptions } from '@/config';
import lodash from 'lodash';

const i18n = useI18n();
const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const clientStore = useClientStore();

const menu = ref();
const items = ref([]);
const searchText = ref('');
const loading = ref(false);
const totalRecords = ref(0);
const selectedItem = ref(null);
const statusUpdateDialog = ref(false);
const deleteDialog = ref(false);
const duplicateDialog = ref(false);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onBeforeMount(() => {
    getItems();
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('clients.make_holding_inactive')
        : t('clients.make_holding_active');
});

const statusDialogContent = computed(() => {
    return isItemActive.value
        ? t('common.are_you_sure_inactive', {
              item: helpers.getLocaleValue(selectedItem.value?.name)
          })
        : t('common.are_you_sure_active', {
              item: helpers.getLocaleValue(selectedItem.value?.name)
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

const menuItems = ref([]);

const showActions = (event, item) => {
    selectedItem.value = item;

    const allItems = [
        {
            label: 'View',
            icon: 'pi pi-eye',
            command: () => goToView(),
            permission: 'view holdings'
        },
        {
            label: 'Edit',
            icon: 'pi pi-pencil',
            command: () => editItem(),
            permission: 'update holdings'
        },
        // { label: 'Duplicate', icon: 'pi pi-copy', command: () => null },
        {
            label: isItemActive.value
                ? t('common.make_inactive')
                : t('common.make_active'),
            icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
            command: () => showStatusUpdateDialog(),
            permission: 'update holdings'
        },
        {
            label: 'Delete',
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete holdings'
        }
    ];

    menuItems.value = helpers.filterByPermission(allItems);

    menu.value.toggle(event);
};

const goToView = () => {
    router.push({
        name: 'Holding Details',
        params: { id: selectedItem.value.id }
    });
};

const editItem = () => {
    router.push({
        name: 'Holding Edit',
        params: { id: selectedItem.value.id }
    });
};

const rowClicked = ({ data }) => {
    router.push({
        name: 'Holding Details',
        params: { id: data.id }
    });
};

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

// const showDuplicateDialog = () => {
//     duplicateDialog.value = true;
// };

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
        const params = { ...pagination.getPageParams() };
        const payload = sortFilters.getSortFilters();
        const res = await clientStore.searchHoldings(payload, params);
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
            status:
                selectedItem.value.status == 'active' ? 'inactive' : 'active'
        };
        await clientStore.updateHolding(selectedItem.value.id, payload);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await clientStore.deleteHolding(selectedItem.value.id);
        await getItems();
    } finally {
        loading.value = false;
    }
};

// const duplicateItem = async () => {
//     try {
//         loading.value = true;
//         await benefitStore.duplicateBenefit(selectedItem.value.id);
//         await getItems();
//     } finally {
//         loading.value = false;
//     }
// };
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
        >
            <template #header>
                <div class="custom-search-small">
                    <Search
                        v-model="searchText"
                        @search="search"
                        data-testid="input-search"
                    />
                </div>
            </template>
            <template #empty> No holdings found. </template>
            <template #loading> Loading holdings. Please wait. </template>
            <!-- <Column sortable field="id" header="Org ID">
                <template #body="{ data }"> {{ data.id }} </template>
            </Column> -->
            <Column
                sortable
                :field="`name->${i18n.locale.value}`"
                header="Holding Name"
                class="p-break-word"
            >
                <template #body="{ data, index }">
                    <span
                        :data-testid="'holding-name-data-table-' + index"
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
            <Column
                sortable
                :field="`short_name->${i18n.locale.value}`"
                header="Short Name"
                class="p-break-word"
            >
                <template #body="{ data, index }">
                    <span :data-testid="'short-name-data-table-' + index">
                        {{
                            lodash.truncate(
                                helpers.getLocaleValue(data.short_name)
                                    ? helpers.getLocaleValue(data.short_name)
                                    : '-',
                                { length: 30 }
                            )
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
            v-if="$ability.can('update holdings')"
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            :header="`Delete Holding`"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                selectedItem?.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
            v-if="$ability.can('delete holdings')"
        />
        <Confirmation
            v-model="duplicateDialog"
            :header="`Duplicate Holding`"
            :content="`Are you sure you want to duplicate ${helpers.getLocaleValue(
                selectedItem?.name
            )}?`"
            v-if="$ability.can('create holdings')"
        />
    </div>
</template>

<style lang="scss" scoped></style>
