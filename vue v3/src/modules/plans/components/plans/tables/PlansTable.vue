<script setup>
import lodash from 'lodash';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { PaginationOptions, SortFilterOptions } from '@/config';

const { formatValue, formatEndDateDisplayTables, initialize } =
    useDateFormatter();
const i18n = useI18n();
const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const planStore = usePlanStore();

const menu = ref();
const items = ref([]);
const searchText = ref('');
const loading = ref(false);
const totalRecords = ref(0);
const selectedItem = ref(null);
const deleteDialog = ref(false);
const statusUpdateDialog = ref(false);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

const menuItems = ref([
    { label: t('common.view'), icon: 'pi pi-eye', command: () => goToView() },
    { label: '', icon: '', command: null },
    {
        label: t('buttons.delete'),
        icon: 'pi pi-trash',
        command: () => showDeleteDialog()
    }
]);

onBeforeMount(() => {
    initialize();
    getItems();
});

const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status == 'active';
});

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('common.make_item_inactive', { item: t('plans.title_singular') })
        : t('common.make_item_active', { item: t('plans.title_singular') });
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

const showStatusUpdateDialog = () => {
    statusUpdateDialog.value = true;
};

const showActions = (event, item) => {
    selectedItem.value = item;
    menuItems.value.splice(1, 1, {
        label: isItemActive.value
            ? t('common.make_inactive')
            : t('common.make_active'),
        icon: isItemActive.value ? 'pi pi-times' : 'pi pi-check',
        command: () => showStatusUpdateDialog()
    });
    menu.value.toggle(event);
};

const rowClicked = ({ data }) => {
    router.push({
        name: 'Plan Details',
        params: { id: data.id }
    });
};

const goToView = () => {
    router.push({
        name: 'Plan Details',
        params: { id: selectedItem.value.id }
    });
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
        const res = await planStore.searchPlans(payload, params);
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
        await planStore.updatePlanStatus(selectedItem.value.id, payload);
        await getItems();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await planStore.deletePlan(selectedItem.value.id);
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
        >
            <template #header>
                <div class="flex justify-content-between">
                    <Search
                        v-model="searchText"
                        @search="search"
                        data-testid="input-search"
                    />
                </div>
            </template>
            <template #empty>{{
                $t('common.datatable_no_found', {
                    item: $t('plans.title').toLowerCase()
                })
            }}</template>
            <template #loading>{{
                $t('common.datatable_loading', {
                    item: $t('plans.title').toLowerCase()
                })
            }}</template>
            <Column
                sortable
                :field="`name->${i18n.locale.value}`"
                :header="$t('common.name')"
                class="p-break-word"
            >
                <template #body="{ data, index }">
                    <span
                        v-tooltip.top="helpers.getLocaleValue(data.name)"
                        :data-testid="'name-data-table-' + index"
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
                field="effective_date"
                :header="$t('common.effective_date')"
            >
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
            <Column sortable field="end_date" :header="$t('common.end_date')">
                <template #body="{ data, index }">
                    <span :data-testid="'end-date-data-table-' + index">
                        {{ formatEndDateDisplayTables(data.end_date) }}
                    </span>
                </template>
            </Column>
            <Column sortable field="status" :header="$t('common.status')">
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
        />
        <Confirmation
            v-model="deleteDialog"
            show-alert-icon
            :header="$t('plans.delete_header')"
            :content="
                $t('plans.delete_content', {
                    item: helpers.getLocaleValue(selectedItem?.name)
                })
            "
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
        />
    </div>
</template>
