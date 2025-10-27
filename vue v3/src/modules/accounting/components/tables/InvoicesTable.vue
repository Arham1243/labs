<script setup>
import { computed, ref, onMounted, onBeforeMount, toRaw } from 'vue';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useI18n } from 'vue-i18n';
import InvoiceStatusTag from '@/modules/accounting/components/invoices/InvoiceStatusTag.vue';
import RecordPaymentDialog from '../dialogs/RecordPaymentDialog.vue';
import VoidInvoiceDialog from '@/modules/accounting/components/dialogs/VoidInvoiceDialog.vue';
import { useInvoicesStore } from '@/modules/accounting/stores/Invoices';
import { useInvoiceFilterStore } from '@/modules/accounting/stores/InvoiceFilter';
import { useFilterStore } from '@/stores/Filter';
import { useSessionStore } from '@/stores';
import { useHelpers } from '@/composables';
import { useToast } from 'primevue/usetoast';
import { invoiceStatuses } from '@/config';
import FilterDialog from '../../../../components/common/FilterDialog.vue';
import { accountingComponents } from '../../config/filter';
import lodash from 'lodash';
import { useRouter } from 'vue-router';

import {
    DATE_CLAUSE_OPTIONS,
    MODULE_TYPES,
    NUMBER_CLAUSE_OPTIONS,
    SELECTION_CLAUSE_OPTIONS,
    getFormattedFilter,
    STRING_CLAUSE_OPTIONS
} from '../../../../config/filter';

const { t } = useI18n();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const helpers = useHelpers();
const invoicesStore = useInvoicesStore();
const invoiceFilterStore = useInvoiceFilterStore();
const filterStore = useFilterStore();
const sessionStore = useSessionStore();
const toast = useToast();
const router = useRouter();

const invoices = ref([]);
const totalRecords = ref();
const searchText = ref('');
const selectedItem = ref(null);
const selectedItems = ref([]);
const loading = ref(false);
const actionMenu = ref();
const activeTabIndex = ref(0);
const scopes = ref([]);
const selectedFilters = ref({});
const showFilterDialog = ref(false);
const showRecordPaymentDialog = ref(false);
const showVoidInvoiceDialog = ref(false);
const shouldClearFiltersOnTabChange = ref(false);
const bulkActionMenu = ref();
const columnSelectionsRef = ref();
const metaInfo = ref({
    onCurrentPage: 0,
    totalCount: 0
});
const filters = ref([]);
const invoiceStatusCounts = ref({
    unpaid: null,
    draft: null,
    all: null
});
const selectedTabStorageKey = ref('');
const actionMenuItems = ref([]);
const bulkActionsMenuItems = ref([]);
const columnSelectionMenuItems = ref([]);
const visibleColumns = ref([]);
const columnsMenuItems = ref([
    {
        name: t('invoice.invoice_table.columns_options.paid_amount'),
        field: 'paid_amount'
    },
    {
        name: t('invoice.invoice_table.columns_options.due_date'),
        field: 'due_date'
    },
    {
        name: t('invoice.invoice_table.columns_options.last_payment_date'),
        field: 'last_payment_date'
    },
    {
        name: t('invoice.invoice_table.columns_options.account_manager'),
        field: 'account_manager'
    },
    {
        name: t('invoice.invoice_table.columns_options.po_number'),
        field: 'po_number'
    },
    {
        name: t('invoice.invoice_table.columns_options.group_name'),
        field: 'group_name'
    },
    {
        name: t(
            'invoice.invoice_table.columns_options.total_number_of_policies'
        ),
        field: 'total_number_of_policies'
    }
]);

// TODO: Implement tab feature to load draft/all invoices and modify the filter params based on the tab selection
const invoiceTabs = ref([
    {
        label: 'Unpaid',
        count: null,
        command: () => {}
    },
    {
        label: 'Draft',
        count: null,
        command: () => {
            scopes.value = [{ name: 'draft' }];
        }
    },
    {
        label: 'All',
        count: null,
        command: () => {
            scopes.value = [];
        }
    }
]);

const getBulkActionsText = computed(() => {
    if (selectedItems.value.length <= 1) {
        return t(
            'invoice.invoice_table.bulk_actions.bulk_actions_button_label'
        );
    }

    return t(
        'invoice.invoice_table.bulk_actions.bulk_actions_button_with_count_label',
        { count: selectedItems.value.length + '/' + metaInfo.value.totalCount }
    );
});

const clearSelection = () => {
    selectedItems.value = [];
};

const selectAllOnCurrentPage = () => {
    clearSelection();
    selectedItems.value = toRaw(invoices.value);
};

const isBulkActionDisabled = computed(() => {
    return selectedItems.value.length === 0;
});

const isBulkRecordPaymentDisabled = computed(() => {
    if (isBulkActionDisabled.value) {
        return true;
    }
    return selectedItems.value.some(
        (invoice) => invoice.invoice_status == invoiceStatuses.PAID.value
    );
});

const showActions = (event, item) => {
    selectedItem.value = item;
    let items = [
        {
            label: t('common.view'),
            icon: 'pi pi-eye',
            command: () => goToView(),
            permission: 'view invoices'
        },
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => '',
            permission: 'update invoices'
        },
        {
            label: t('buttons.resend'),
            icon: 'pi pi-reply',
            command: () => {},
            permission: 'update invoices'
        },
        {
            label: t('buttons.record_payment'),
            icon: 'pi pi-money-bill',
            command: () => {
                openRecordPaymentDialog();
            },
            permission: 'update invoices'
        },
        {
            label: t('invoice.invoice_details.action_buttons.void_invoice'),
            icon: 'pi pi-times',
            command: () => {
                showVoidInvoiceDialog.value = true;
            },
            permission: 'update invoices'
        },
        {
            separator: true
        },
        {
            label: t('buttons.export_as_pdf'),
            icon: 'pi pi-download',
            command: () => {},
            permission: 'view invoices'
        },
        {
            label: t('buttons.print'),
            icon: 'pi pi-print',
            command: () => {},
            permission: 'view invoices'
        }
    ];

    if (['unpaid', 'overdue'].indexOf(item.invoice_status) < 0) {
        items = items.filter(
            (item) =>
                item.label !==
                t('invoice.invoice_details.action_buttons.void_invoice')
        );
    }

    if (
        [
            invoiceStatuses.UNPAID.value,
            invoiceStatuses.PARTIAL_PYMT.value,
            invoiceStatuses.OVERDUE.value,
            invoiceStatuses.PENDING.value
        ].indexOf(item.invoice_status) < 0
    ) {
        items = items.filter(
            (item) => item.label !== t('buttons.record_payment')
        );
    }

    if (item.invoice_status === 'void') {
        items = items.filter((item) => item.permission === 'view invoices');
    }

    actionMenuItems.value = helpers.filterByPermission(items);
    actionMenu.value.toggle(event);
};

const onSortChange = (event) => {
    clearSelection();
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    loadInvoices();
};

const goToView = () => {
    router.push({
        name: 'Invoice Details',
        params: { id: selectedItem.value.id }
    });
};

const onPageChange = (event) => {
    clearSelection();
    pagination.updatePageParams(event);
    loadInvoices();
};

const openRecordPaymentDialog = () => {
    showRecordPaymentDialog.value = true;
};

const search = async () => {
    clearSelection();
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    loadInvoices();
};

const formatColumn = (column) => {
    if (!column || typeof column !== 'string') {
        return '';
    }
    return column
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const displayDateFilter = computed(() => {
    const { startDate, endDate } = invoiceFilterStore.getDateFilter;
    return t('invoice.filter.date') + ' : ' + startDate + ' TO ' + endDate;
});

const displayBusinessUnitFilter = computed(() => {
    return (
        t('invoice.filter.business_units') +
        ' : ' +
        invoiceFilterStore.getBusinessUnitFilter.join(' | ')
    );
});

const displayStatusFilter = computed(() => {
    return (
        t('invoice.filter.status') +
        ' : ' +
        invoiceFilterStore.getStatusFilter.join(' | ')
    );
});

const formatFilterValues = (prop) => {
    if (prop.value.field == 'dates') {
        return prop.value.value.start_date + ' TO ' + prop.value.value.end_date;
    }

    if (Array.isArray(prop.value.value)) {
        return prop.value.value.join(',');
    }

    return '';
};

const onTabChange = (event) => {
    selectedItems.value = [];
    if (shouldClearFiltersOnTabChange.value) {
        invoicesStore.saveToLocal(
            selectedTabStorageKey.value,
            activeTabIndex.value
        );
        clearFilters();
    }
    shouldClearFiltersOnTabChange.value = true;
    loadInvoices();
};

const openFilterDialog = () => {
    showFilterDialog.value = true;
};

const clearFilters = () => {
    filters.value = [];
    loadInvoices();
};

const applyFilters = (appliedFilters) => {
    filters.value = appliedFilters;
    filterStore.saveFilterLocal(
        sessionStore?.user?.id,
        MODULE_TYPES.ACCOUNTING.value,
        toRaw(appliedFilters)
    );
    loadInvoices();
};

const getScopes = () => {
    if (activeTabIndex.value === 0) {
        return [{ name: 'unpaid' }];
    } else if (activeTabIndex.value === 1) {
        return [{ name: 'draft' }];
    } else {
        return [];
    }
};

const removeFilter = () => {
    loadInvoices();
};

const getItems = async () => {
    try {
        loading.value = true;
        filterStore.saveFilterLocal(
            sessionStore?.user?.id,
            MODULE_TYPES.ACCOUNTING.value,
            toRaw(filters.value)
        );
        const params = { ...pagination.getPageParams() };
        const sort = sortFilters.getSortFilters(searchText.value);
        const payload = {
            ...sort,
            _filters: getFormattedFilter(filters.value),
            includes: [{ relation: 'clients' }, { relation: 'businessUnits' }],
            scopes: getScopes()
        };

        if (!searchText.value) {
            delete payload.search;
        }

        const res = await invoicesStore.getInvoices(payload, params);
        updateTableData(res);
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('invoice.invoice_table.review.error'),
            detail: t('invoice.invoice_table.review.loading_error'),
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

const loadInvoices = lodash.debounce((value) => {
    getItems();
}, 100);

const updateTableData = (response) => {
    invoices.value = response.data;
    totalRecords.value = response?.meta?.total || 0;
    metaInfo.value.totalCount = response?.meta?.total || 0;

    metaInfo.value.onCurrentPage = invoices.value.length;
};

const loadInvoiceStatusCounts = async () => {
    const res = await invoicesStore.getInvoiceStatusCounts();
    invoiceTabs.value[0].count = res.data.unpaid_invoices_count;
    invoiceTabs.value[1].count = res.data.draft_invoices_count;
};

const formatFilterLabel = (filter) => {
    switch (filter.type) {
        case 'date':
            const clause = DATE_CLAUSE_OPTIONS.find(
                (option) => option.value === filter.operator
            );
            if (clause.value == 'IS_WITHIN') {
                return `${clause.label.toLowerCase()} ${filter.value.name.toLowerCase()}`;
                return filter.value.name;
            }
            if (!clause?.showRange) {
                return `${clause.label.toLowerCase()} ${helpers.formatDate(filter.value)}`;
            }
            return `${clause.label.toLowerCase()} ${helpers.formatDate(filter.value[0])} ${t('filter.to')} ${helpers.formatDate(filter.value[1])}`;

        case 'number':
            {
                const clause = NUMBER_CLAUSE_OPTIONS.find(
                    (option) => option.value === filter.operator
                );
                if (clause.range)
                    return `${clause.label.toLowerCase()} ${formatNumber(filter.value[0])} ${t('filter.to')} ${formatNumber(filter.value[1])}`;
                return `${clause.label.toLowerCase()} ${formatNumber(filter.value)}`;
            }

            return (
                DATE_CLAUSE_OPTIONS.find(
                    (option) => option.value === filter.operator
                ).label +
                ' ' +
                helpers.formatDate(filter.value)
            );

        case 'multi_select':
            let names = filter.value.map((value) =>
                helpers.getLocaleValue(value.name)
            );
            let joinText = names.join(',');
            if (joinText.length > 20) {
                joinText =
                    joinText.slice(0, 20) +
                    '...' +
                    ' (' +
                    (names.length - 1) +
                    ' selected)';
            }
            return filter.operator + ' ' + joinText;

        case 'select':
            let op = SELECTION_CLAUSE_OPTIONS.find(
                (op) => op.value === filter.operator
            );
            let opt = filter.options.find(
                (option) => option.id === filter.value
            );

            if (op && opt) {
                return `(${op.label.toLowerCase()}) ${opt.name}`;
            }

            return filter.id;

        case 'string':
            let strOp = STRING_CLAUSE_OPTIONS.find(
                (op) => op.value === filter.operator
            );

            return `${strOp.label.toLowerCase()} ${filter.value}`;

        default:
            return '';
    }
};

const formatNumber = (value) => {
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const toggleBulkActionsMenu = (event) => {
    let items = [
        {
            label: t(
                'invoice.invoice_table.bulk_actions.select_all_on_this_page',
                {
                    count:
                        invoices.value.length + '/' + metaInfo.value.totalCount
                }
            ),
            command: () => {
                selectAllOnCurrentPage();
            }
        },
        {
            label: t('invoice.invoice_table.bulk_actions.clear_selection'),
            disabled: isBulkActionDisabled.value,
            command: () => {
                clearSelection();
            }
        },
        {
            separator: true
        },
        {
            label: t('buttons.record_payment'),
            icon: 'pi pi-money-bill',
            disabled: isBulkRecordPaymentDisabled.value,
            command: () => {
                openRecordPaymentDialog();
            },
            permission: 'update invoices'
        },
        {
            label: t('buttons.export_as_pdf'),
            disabled: isBulkActionDisabled.value,
            icon: 'pi pi-download',
            command: () => {},
            permission: 'view invoices'
        },
        {
            label: t('buttons.export_as_csv'),
            disabled: isBulkActionDisabled.value,
            icon: 'pi pi-download',
            command: () => {},
            permission: 'view invoices'
        },
        {
            label: t('buttons.print'),
            disabled: isBulkActionDisabled.value,
            icon: 'pi pi-print',
            command: () => {},
            permission: 'view invoices'
        }
    ];

    bulkActionsMenuItems.value = helpers.filterByPermission(items);
    bulkActionMenu.value.toggle(event);
};

const loadFilterFromLocal = () => {
    const localFilter = filterStore.getFilterLocal(
        sessionStore?.user?.id,
        MODULE_TYPES.ACCOUNTING.value
    );
    if (localFilter) {
        filters.value = localFilter;
    }
};

const toggleColumnSelectionMenu = (event) => {
    columnSelectionsRef.value.show();
};

onMounted(() => {
    onTabChange();
    loadInvoiceStatusCounts();
});

onBeforeMount(() => {
    loadFilterFromLocal();
    selectedTabStorageKey.value = invoicesStore.getInvoiceTabFilterKey(
        sessionStore?.user?.id
    );
    activeTabIndex.value = invoicesStore.getFromLocal(
        selectedTabStorageKey.value
    );
});
</script>

<style scoped>
.filters-chips {
    margin-right: 2px;
    margin-bottom: 2px;
}

.inactive-badge {
    background: #e0e0e0;
    color: #495057;
}

:deep(.p-tabview .p-tabview-nav a:focus) {
    outline: none !important;
    box-shadow: none !important;
}

::v-deep(.p-tabview-nav-link) {
    border: none !important;
}
</style>

<template>
    <div>
        <TabView
            @tab-change="onTabChange"
            class="pb-6"
            v-model:activeIndex="activeTabIndex"
        >
            <TabPanel v-for="(tab, index) in invoiceTabs" :disabled="loading">
                <template #header
                    ><span>{{ tab.label }}</span>
                    <Badge
                        v-if="tab.count"
                        :class="{ 'inactive-badge': activeTabIndex !== index }"
                        :value="tab.count"
                        class="ml-2"
                        severity="secondary"
                    ></Badge>
                </template>
            </TabPanel>
        </TabView>

        <BaseTable
            id="invoice-list-table"
            :value="invoices"
            :page="pagination.page"
            :rows="pagination.limit"
            :total-records="totalRecords"
            :loading="loading"
            v-model:selection="selectedItems"
            @sort="onSortChange"
            @page="onPageChange"
            scrollable
            data-testid="base-table"
        >
            <template #header>
                <div
                    class="flex align-items-center justify-content-between mb-2"
                    data-testid="table-header"
                >
                    <div
                        class="flex justify-content-between align-items-center gap-3"
                        data-testid="bulk-actions-container"
                    >
                        <Button
                            :label="getBulkActionsText"
                            icon="pi pi-chevron-down"
                            iconPos="right"
                            class="p-button-outlined mr-2"
                            @click="toggleBulkActionsMenu"
                            data-testid="bulk-actions-button"
                            aria-controls="bulk_actions_menu"
                            aria-haspopup="true"
                        />
                        <Menu
                            ref="bulkActionMenu"
                            id="bulk_actions_menu"
                            style="
                                width: fit-content;
                                padding-top: 10px;
                                padding-bottom: 10px;
                                padding-right: 40px;
                            "
                            :popup="true"
                            :model="bulkActionsMenuItems"
                            data-testid="bulk-actions-menu"
                        />
                        <Button
                            :label="
                                $t('invoice.invoice_table.filter_button_label')
                            "
                            @click="openFilterDialog"
                            icon="pi pi-filter"
                            iconPos="left"
                            class="p-button-outlined mr-2"
                            data-testid="filter-button"
                        />
                    </div>
                    <div
                        class="flex justify-content-between align-items-center gap-3"
                        data-testid="search-container"
                    >
                        <Search
                            data-testid="search-input"
                            v-model="searchText"
                            @search="search"
                            :placeholder="$t('invoice.invoice_table.search')"
                            :style="{
                                width: '22vw',
                                padding: '0.8rem 1rem 0.8rem 2.45rem'
                            }"
                        />
                        <Button
                            :label="$t('invoice.invoice_table.columns')"
                            @click="toggleColumnSelectionMenu"
                            icon="pi pi-cog"
                            iconPos="left"
                            class="p-button-outlined mr-2"
                            data-testid="filter-button"
                        />

                        <MultiSelect
                            filter
                            ref="columnSelectionsRef"
                            class="p-multiselect-label-empty"
                            v-model="visibleColumns"
                            :options="columnsMenuItems"
                            optionLabel="name"
                            optionValue="field"
                            style="width: 1px !important"
                        />
                    </div>
                </div>
                <div class="mt-4 mb-2" data-testid="filters-container">
                    <Chips
                        class="filters-chips"
                        variant="chips"
                        v-model="filters"
                        @remove="removeFilter"
                    >
                        <template #chip="slotProps">
                            <span>
                                <strong
                                    >{{ formatColumn(slotProps.value.field) }}:
                                </strong>
                                <span>
                                    {{ formatFilterLabel(slotProps.value) }}
                                </span>
                            </span>
                        </template>
                    </Chips>
                    <Button
                        v-if="filters && filters.length > 0"
                        class="p-0 mb-2 ml-2 no-underline shadow-none"
                        data-testid="clear-filters-button"
                        link
                        :label="$t('policies.smart_filter.clear_filters')"
                        @click="clearFilters"
                    />

                    <Button
                        class="p-0 mb-1 ml-2 no-underline shadow-none"
                        link
                        :label="$t('invoice.clear_filters')"
                        v-if="invoiceFilterStore.isFilterApplied"
                        @click="invoiceFilterStore.clearAll"
                        data-testid="clear-filters-button"
                    />
                </div>
            </template>

            <template #empty>
                <span data-testid="empty-data-table">
                    {{ $t('invoice.invoice_table.empty_table_content') }}
                </span>
            </template>
            <template #loading>
                <span data-testid="loading-data-table">
                    {{ $t('invoice.invoice_table.table_loading') }}
                </span>
            </template>

            <Column selectionMode="multiple" data-testid="selection-column" />

            <Column
                field="status"
                :header="$t('invoice.invoice_table.status')"
                data-testid="status-column"
            >
                <template #body="{ data }">
                    <InvoiceStatusTag
                        :status="data.invoice_status"
                        data-testid="status-tag"
                    />
                </template>
            </Column>

            <Column
                field="created_at"
                sortable
                :header="$t('invoice.invoice_table.invoice_date')"
                data-testid="invoice-date-column"
            >
                <template #body="{ data }">
                    <span data-testid="invoice-date-value">
                        {{ helpers.formatDate(data.created_at) }}
                    </span>
                </template>
            </Column>

            <Column
                field="invoice_number"
                sortable
                :header="$t('invoice.invoice_table.invoice_number')"
                data-testid="invoice-number-column"
            >
                <template #body="{ data }">
                    <span data-testid="invoice-number-value">
                        {{ data.invoice_number }}
                    </span>
                </template>
            </Column>

            <Column
                field="client"
                :header="$t('invoice.invoice_table.client')"
                data-testid="client-column"
            >
                <template #body="{ data }">
                    <span v-if="data?.client?.name" data-testid="client-name">
                        {{ helpers.getLocaleValue(data?.client?.name) }}
                    </span>
                </template>
            </Column>

            <Column
                field="business_unit"
                :header="$t('invoice.invoice_table.business_unit')"
                data-testid="business-unit-column"
            >
                <template #body="{ data }">
                    <span
                        v-if="data?.business_unit?.name"
                        data-testid="business-unit-name"
                    >
                        {{ helpers.getLocaleValue(data?.business_unit?.name) }}
                    </span>
                </template>
            </Column>

            <Column
                field="amount"
                :header="$t('invoice.invoice_table.total')"
                sortable
                data-testid="amount-column"
            >
                <template #body="{ data }">
                    <span data-testid="amount-value">
                        {{
                            data.amount ? helpers.moneyFormat(data.amount) : '-'
                        }}
                    </span>
                </template>
            </Column>

            <Column
                field="amount_due"
                :header="$t('invoice.invoice_table.amount_due')"
                data-testid="amount-due-column"
            >
                <template #body="{ data }">
                    <span data-testid="amount-due-value">
                        {{
                            data.amount_due
                                ? helpers.moneyFormat(data.amount_due)
                                : '-'
                        }}
                    </span>
                </template>
            </Column>

            <Column
                field="paid_amount"
                :header="
                    $t('invoice.invoice_table.columns_options.paid_amount')
                "
                v-if="visibleColumns.includes('paid_amount')"
                data-testid="paid-amount-column"
            >
                <template #body="{ data }">
                    <span data-testid="amount-due-value">
                        {{
                            data.paid_amount
                                ? helpers.moneyFormat(data.paid_amount)
                                : '-'
                        }}
                    </span>
                </template>
            </Column>

            <Column
                field="due_date"
                :header="$t('invoice.invoice_table.columns_options.due_date')"
                sortable
                v-if="visibleColumns.includes('due_date')"
                data-testid="due-date-column"
            >
                <template #body="{ data }">
                    <span data-testid="amount-due-value">
                        <span data-testid="amount-due-date-value">
                            {{ helpers.formatDate(data.due_date) }}
                        </span>
                    </span>
                </template>
            </Column>

            <Column
                field="last_payment_date"
                :header="
                    $t(
                        'invoice.invoice_table.columns_options.last_payment_date'
                    )
                "
                v-if="visibleColumns.includes('last_payment_date')"
                data-testid="last_payment_date-column"
            >
                <template #body="{ data }">
                    <span data-testid="last_payment_date-value">
                        {{
                            data.last_payment_date
                                ? helpers.formatDate(data.last_payment_date)
                                : '-'
                        }}
                    </span>
                </template>
            </Column>

            <Column
                field="account_manager"
                :header="
                    $t('invoice.invoice_table.columns_options.account_manager')
                "
                v-if="visibleColumns.includes('account_manager')"
                data-testid="account_manager-column"
            >
                <template #body="{ data }">
                    <span data-testid="account_manager-value">
                        {{
                            data.account_manager
                                ? data.account_manager.name
                                : '-'
                        }}
                    </span>
                </template>
            </Column>

            <Column
                field="po_number"
                :header="$t('invoice.invoice_table.columns_options.po_number')"
                v-if="visibleColumns.includes('po_number')"
                data-testid="po_number-column"
            >
                <template #body="{ data }">
                    <span data-testid="po_number-value"> - </span>
                </template>
            </Column>

            <Column
                field="group_name"
                :header="$t('invoice.invoice_table.columns_options.group_name')"
                v-if="visibleColumns.includes('group_name')"
                data-testid="group_name-column"
            >
                <template #body="{ data }">
                    <span data-testid="group_name-value"> - </span>
                </template>
            </Column>

            <Column
                field="total_number_of_policies"
                :header="
                    $t(
                        'invoice.invoice_table.columns_options.total_number_of_policies'
                    )
                "
                v-if="visibleColumns.includes('total_number_of_policies')"
                data-testid="total_number_of_policies-column"
            >
                <template #body="{ data }">
                    <span data-testid="total_number_of_policies-value">
                        -
                    </span>
                </template>
            </Column>

            <Column data-testid="actions-column">
                <template #body="{ data, index }">
                    <Button
                        :disabled="selectedItems.length > 0"
                        :label="$t('invoice.invoice_table.action')"
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        size="small"
                        class="p-button-outlined flex"
                        @click="showActions($event, data)"
                        :data-testid="'actions-button-' + index"
                    />
                    <Menu
                        ref="actionMenu"
                        id="actions_menu"
                        :model="actionMenuItems"
                        :popup="true"
                        :data-testid="'actions-menu-' + index"
                    />
                </template>
            </Column>
        </BaseTable>

        <RecordPaymentDialog
            v-if="selectedItem"
            :invoice="selectedItem"
            v-model="showRecordPaymentDialog"
            @paymentRecorded="loadInvoices"
            data-testid="record-payment-dialog"
        >
        </RecordPaymentDialog>
        <VoidInvoiceDialog
            v-model:visible="showVoidInvoiceDialog"
            :invoice="selectedItem"
            :reload="loadInvoices"
            data-testid="void-invoice-dialog"
        />
        <FilterDialog
            v-model="showFilterDialog"
            :components="accountingComponents"
            @applyFilters="applyFilters"
            :module="MODULE_TYPES.ACCOUNTING.value"
            :title="$t('filter.dialog.title')"
        />
    </div>
</template>

<style lang="scss">
.filters-chips ul.p-inputtext.p-chips-multiple-container {
    background: none !important;
    border: none !important;
    padding: 0 !important;
    box-shadow: none !important;
    width: fit-content !important;
}

.p-chips.p-component.p-inputwrapper.p-inputwrapper-filled.filters-chips {
    width: fit-content !important;
}

.filters-chips li.p-chips-input-token {
    display: none !important;
}

.filters-chips .p-chips-token {
    margin: 2px;
}
</style>
