<script setup>
import lodash from 'lodash';
import { computed, onBeforeMount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useBenefitStore } from '@/modules/plans/stores/Benefit';
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { PaginationOptions, SortFilterOptions } from '@/config';
import Label from '@/components/common/Label.vue';

const { formatValue, formatEndDateDisplayTables, initialize } =
    useDateFormatter();
const i18n = useI18n();
const { t } = useI18n();
const router = useRouter();
const helpers = useHelpers();
const benefitStore = useBenefitStore();

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
const isItemActive = computed(() => {
    return selectedItem.value && selectedItem.value.status === 'active';
});
const showActions = (event, item) => {
    selectedItem.value = item;

    const allItems = [
        {
            label: t('common.view'),
            icon: 'pi pi-eye',
            command: () => goToView(),
            permission: 'view benefit groups'
        },
        {
            label: t('buttons.duplicate'),
            icon: 'pi pi-copy',
            command: () => goToDuplicate(),
            permission: 'update benefit groups'
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
            permission: 'update benefit groups'
        },
        {
            label: t('buttons.delete'),
            icon: 'pi pi-trash',
            command: () => showDeleteDialog(),
            permission: 'delete benefit groups'
        }
    ];

    menuItems.value = helpers.filterByPermission(allItems);

    menu.value.toggle(event);
};

const menuItems = ref([
    { label: t('common.view'), icon: 'pi pi-eye', command: () => goToView() },
    {
        label: t('buttons.duplicate'),
        icon: 'pi pi-copy',
        command: () => goToDuplicate()
    },
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

const statusDialogHeader = computed(() => {
    return isItemActive.value
        ? t('benefit_groups.make_benefit_group_inactive')
        : t('benefit_groups.make_benefit_group_active');
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
const rowClicked = ({ data }) => {
    router.push({
        name: 'Benefit Group Details',
        params: { id: data.id }
    });
};

const goToView = () => {
    router.push({
        name: 'Benefit Group Details',
        params: { id: selectedItem.value.id }
    });
};

const goToDuplicate = () => {
    //
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
        const res = await benefitStore.searchBenefitGroups(payload, params);
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
        await benefitStore.updateBenefitGroupStatus(
            selectedItem.value.id,
            payload
        );
        await getItems();
    } finally {
        loading.value = false;
    }
};

const deleteItem = async () => {
    try {
        loading.value = true;
        await benefitStore.deleteBenefitGroup(selectedItem.value.id);
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
            <template #empty
                >{{
                    $t('common.datatable_not_found', {
                        item: $t('benefit_groups.title').toLowerCase()
                    })
                }}
            </template>
            <template #loading
                >{{
                    $t('common.datatable_loading', {
                        item: $t('benefit_groups.title').toLowerCase()
                    })
                }}
            </template>
            <Column
                sortable
                :field="`name->${i18n.locale.value}`"
                class="p-break-word"
            >
                <template #header>
                    <Label test-id="table-header-name">{{
                        $t('common.name')
                    }}</Label>
                </template>
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
            <Column sortable field="coverage">
                <template #header>
                    <Label test-id="table-header-coverage">{{
                        $t('common.coverage')
                    }}</Label>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'coverage-data-table-' + index">
                        {{ data.coverage ? data.coverage + ' %' : '-' }}
                    </span>
                </template>
            </Column>
            <Column sortable field="max_amount">
                <template #header>
                    <Label test-id="table-header-max-amount">{{
                        $t('common.to_a_maximum_of')
                    }}</Label>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'max-amount-data-table-' + index">
                        {{
                            data.max_amount
                                ? helpers.moneyFormat(data.max_amount)
                                : '-'
                        }}
                    </span>
                </template>
            </Column>
            <Column sortable field="effective_date">
                <template #header>
                    <Label test-id="table-header-effective-date">{{
                        $t('common.effective_date')
                    }}</Label>
                </template>
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
            <Column sortable field="end_date">
                <template #header>
                    <Label test-id="table-header-end-date">{{
                        $t('common.end_date')
                    }}</Label>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'end-date-data-table-' + index">
                        {{ formatEndDateDisplayTables(data.end_date) }}
                    </span>
                </template>
            </Column>
            <Column sortable field="status">
                <template #header>
                    <Label test-id="table-header-status">{{
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
            :header="$t('benefit_groups.delete_benefit_group_header')"
            :content="`Are you sure you want to delete ${helpers.getLocaleValue(
                selectedItem?.name
            )}?`"
            confirm-button-class="p-button-danger"
            @confirm="deleteItem"
        />
    </div>
</template>
