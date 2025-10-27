<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import lodash from 'lodash';
import { useOrdersStore } from '@/modules/policies/stores/Orders';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { useHelpers } from '@/composables';
import useEventsBus from '@/composables/event-bus';
import { PaginationOptions, SortFilterOptions } from '@/config';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';

const { t } = useI18n();
const helpers = useHelpers();
const { bus } = useEventsBus();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const ordersStore = useOrdersStore();
const policiesStore = usePoliciesStore();
const router = useRouter();
const toast = useToast();

const actionMenu = ref();
const bulkActionMenu = ref();
const searchText = ref('');
const selectedItem = ref(null);
const loading = ref(false);
const selectedItems = ref([]);
const policies = ref([]);
const totalRecords = ref();
const selectedFilters = [];
const showFilterDialog = ref(false);
const deleteDialog = ref(false);
const bookingDateDialog = ref(false);

onBeforeMount(async () => {
    await getItems();
});

watch(
    () => bus.value.get('reloadList'),
    async () => {
        await getItems();
    }
);

const actionMenuItems = computed(() => {
    if (!selectedItem.value) return [];

    return [
        {
            label: t('buttons.download'),
            icon: 'pi pi-cloud-download',
            command: () => ''
        },
        {
            label: t('buttons.set_booking_date'),
            icon: 'pi pi-trash',
            command: () => showBookingDateDialog(),
            visible: false
        }
    ];
});

const bulkActionMenuItems = computed(() => {
    return [{ label: t('buttons.delete'), command: () => '' }];
});

const deleteConfirmContent = computed(() => {
    return selectedItem.value
        ? t('common.are_you_sure_delete', {
              name: selectedItem.value?.policy_id
          })
        : '';
});

const showDeleteDialog = () => {
    deleteDialog.value = true;
};

const openFilterDialog = () => {
    showFilterDialog.value = true;
};

const showBookingDateDialog = () => {
    bookingDateDialog.value = true;
};

const clearFilters = () => {
    selectedFilters.value = [];
    getItems();
};

const formatColumn = (column) => {
    if (!column || typeof column !== 'string') {
        return '';
    }
    if (!column.includes('_')) {
        return column.charAt(0).toUpperCase() + column.slice(1);
    }
    return column
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const showActions = (event, item) => {
    selectedItem.value = item;
    actionMenu.value.toggle(event);
};

const showBulkMenu = (event) => {
    bulkActionMenu.value.toggle(event);
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getItems();
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
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
        const payload = sortFilters.getSortFilters(searchText.value);

        if (!payload?.sort?.length) {
            payload.sort = [{ field: 'created_at', direction: 'desc' }];
        }

        const res = await ordersStore.searchOrders(payload, params);
        policies.value = res.data;
        totalRecords.value = res.meta.total;
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('policies.orders.error'),
            detail: t('policies.orders_table.loading_error'),
            life: 5000
        });
    } finally {
        loading.value = false;
    }
};

watch(
    selectedFilters,
    () => {
        getItems();
    },
    { immediate: true }
);

const deleteItem = async () => {
    try {
        loading.value = true;
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await getItems();
    } finally {
        loading.value = false;
    }
};

const updateBookingDate = async () => {
    try {
        loading.value = true;

        let item = selectedItem.value;
        item.confirmed_at = helpers.parseDate(item.confirmed_at);
        await ordersStore.updateOrder(item, {});
        await getItems();
    } finally {
        bookingDateDialog.value = false;
        loading.value = false;
    }
};

const goToSummary = (record) => {
    router.push({
        name: 'Order Details',
        params: { clientId: record.client_id, orderId: record.id }
    });
};
</script>

<template>
    <BaseTable
        :value="policies"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        :loading="loading"
        v-model:selection="selectedItems"
        @sort="onSortChange"
        @page="onPageChange"
    >
        <template #header>
            <div class="flex align-items-center justify-content-between mb-2">
                <div
                    class="flex justify-content-between align-items-center gap-3"
                >
                    <Button
                        v-if="policies.length > 0"
                        :disabled="selectedItems.length == 0"
                        :label="
                            $t(
                                'policies.policies_table.bulk_actions_button_label'
                            )
                        "
                        icon="pi pi-chevron-down"
                        iconPos="right"
                        class="p-button-outlined mr-2 hidden"
                        @click="showBulkMenu"
                        data-testid="bulk-actions-button"
                    />
                    <Menu
                        ref="bulkActionMenu"
                        id="bulk_menu"
                        :model="bulkActionMenuItems"
                        :popup="true"
                        data-testid="bulk-actions-menu"
                    />
                    <Button
                        :label="
                            $t('policies.policies_table.filter_button_label')
                        "
                        icon="pi pi-filter"
                        iconPos="left"
                        class="p-button-outlined mr-2"
                        :badge="
                            selectedFilters.value && selectedFilters.length > 0
                                ? selectedFilters.length.toString()
                                : null
                        "
                        @click="openFilterDialog()"
                        data-testid="filter-button"
                    />
                </div>
                <div
                    class="flex justify-content-between align-items-center gap-3"
                >
                    <Search
                        data-testid="search-input"
                        v-model="searchText"
                        @search="search"
                        :style="{
                            width: '22vw',
                            padding: '0.8rem 1rem 0.8rem 2.45rem'
                        }"
                    />
                </div>
            </div>
            <div
                class="mt-4 mb-2"
                v-if="selectedFilters.value && selectedFilters.value.length > 0"
            >
                <Chips
                    class="filters-chips"
                    variant="chips"
                    v-model="selectedFilters.value"
                >
                    <template #chip="slotProps">
                        <div>
                            <span class="capitalize"
                                >{{
                                    formatColumn(slotProps.value.column_name)
                                }}:
                                <span
                                    v-tooltip.top="
                                        helpers.getLocaleValue(
                                            slotProps.value.column_value.name
                                        )
                                    "
                                >
                                    {{
                                        lodash.truncate(
                                            helpers.getLocaleValue(
                                                slotProps.value.column_value
                                                    .name
                                            ),
                                            {
                                                length: 30
                                            }
                                        )
                                    }}
                                </span>
                            </span>
                        </div>
                    </template>
                </Chips>
                <Button
                    class="p-0 mb-1 ml-2 no-underline shadow-none"
                    data-testid="clear-filters-button"
                    link
                    :label="$t('policies.smart_filter.clear_filters')"
                    @click="clearFilters"
                />
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{ $t('policies.orders_table.empty_table_content') }}
            </span>
        </template>
        <template #loading>
            {{ $t('policies.policies_table.table_loading') }}
        </template>

        <Column
            v-if="policies.length > 0"
            selectionMode="multiple"
            headerStyle="width: 2rem"
        />

        <Column
            v-if="policies.length > 0"
            :sortable="true"
            field="created_at"
            :header="$t('policies.orders_table.order_date')"
        >
            <template #body="{ data, index }">
                <span
                    :data-testid="'order-date-data-table-' + index"
                    class="white-space-nowrap"
                >
                    {{ helpers.formatDate(data.created_at) }}
                </span>
            </template>
        </Column>

        <Column
            v-if="policies.length > 0"
            field="order_number"
            :header="$t('policies.policies_table.order')"
        >
            <template #body="{ data, index }">
                <span
                    class="underline text-primary font-bold cursor-pointer"
                    :data-testid="'order-data-table-' + index"
                    @click="goToSummary(data)"
                >
                    {{ data.order_number }}
                </span>
            </template>
        </Column>

        <Column
            v-if="policies.lengt > 0"
            field="invoice"
            :header="$t('policies.orders_table.invoice')"
        >
            <template #body="{ data, index }">
                <span :data-testid="'invoice-data-table-' + index">
                    {{ data.invoice }}
                </span>
            </template>
        </Column>
        <Column
            v-if="policies.length > 0"
            field="client.id"
            :header="$t('policies.orders_table.client_name')"
        >
            <template #body="{ data, index }">
                <span
                    v-tooltip.top="helpers.getLocaleValue(data.client?.name)"
                    :data-testid="'client-data-table-' + index"
                >
                    {{
                        lodash.truncate(
                            helpers.getLocaleValue(data.client?.name),
                            {
                                length: 30
                            }
                        )
                    }}
                </span>
            </template>
        </Column>
        <Column
            v-if="policies.length > 0"
            field="business_unit.id"
            :header="$t('policies.orders_table.business_unit')"
        >
            <template #body="{ data, index }">
                <span
                    v-tooltip.top="
                        helpers.getLocaleValue(data.business_unit?.name)
                    "
                    :data-testid="'business-unit-data-table-' + index"
                >
                    {{
                        lodash.truncate(
                            helpers.getLocaleValue(data.business_unit?.name),
                            {
                                length: 30
                            }
                        )
                    }}
                </span>
            </template>
        </Column>
        <Column
            v-if="policies.length > 0"
            :sortable="true"
            field="amount"
            :header="$t('policies.orders_table.amount')"
        >
            <template #body="{ data, index }">
                <span :data-testid="'total_amount-data-table-' + index">
                    {{ data.amount ? helpers.moneyFormat(data.amount) : '-' }}
                </span>
            </template>
        </Column>

        <Column
            :sortable="true"
            field="status"
            :header="$t('common.status')"
            v-if="false"
        >
            <template #body="{ data, index }">
                <StatusTag
                    :status="data.status"
                    :data-testid="'status-tag-' + index"
                />
            </template>
        </Column>

        <Column
            v-if="policies.length > 0"
            field="payment_type"
            :header="$t('policies.orders_table.payment_type')"
        >
            <template #body="{ data, index }">
                <span :data-testid="'paymentType-data-table-' + index">
                    {{ data.payment_type }}
                </span>
            </template>
        </Column>

        <Column
            v-if="policies.length > 0"
            field="transaction"
            :header="$t('policies.orders_table.transaction')"
        >
            <template #body="{ data, index }">
                <span :data-testid="'transaction-data-table-' + index">
                    {{ data.transaction }}
                </span>
            </template>
        </Column>

        <Column
            v-if="policies.length > 0"
            field="creator.id"
            :header="$t('policies.orders_table.ordered_by')"
        >
            <template #body="{ data, index }">
                <span :data-testid="'ordered-by-data-table-' + index">
                    {{ data.creator?.name }}
                </span>
            </template>
        </Column>

        <Column
            v-if="policies.length > 0"
            :sortable="true"
            field="created_at"
            :header="$t('policies.policies_table.booking_date')"
        >
            <template #body="{ data, index }">
                <span :data-testid="'booking-date-data-table-' + index">
                    {{ helpers.formatDate(data.created_at) }}
                </span>
            </template>
        </Column>

        <Column
            class="hidden"
            v-if="policies.length > 0"
            :header="t('common.actions')"
        >
            <template #body="{ data, index }">
                <Button
                    :disabled="selectedItems.length > 0"
                    :label="$t('policies.policies_table.actions_button_label')"
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

    <Confirmation
        v-model="deleteDialog"
        show-alert-icon
        :header="
            t('common.delete_item_header', { item: t('policies.order.order') })
        "
        :content="deleteConfirmContent"
        confirm-button-class="p-button-danger"
        @confirm="deleteItem"
        dialog-testid="delete-dialog"
        close-button-testid="delete-close-button"
        cancel-button-testid="delete-cancel-button"
        confirm-button-testid="delete-confirm-button"
        header-testid="delete-title"
        content-testid="delete-content"
    />

    <Dialog
        v-model:visible="bookingDateDialog"
        modal
        :header="
            t('common.set_booking_date', { item: selectedItem?.order_number })
        "
    >
        <span class="p-text-secondary block mb-5"
            >{{ $t('policies.orders_table.update_booking_date') }}.</span
        >
        <div class="flex align-items-center gap-3 mb-3">
            <label for="booking-date" class="font-semibold w-8rem">{{
                $t('policies.orders_table.booking_date')
            }}</label>
            <Calendar v-model="selectedItem.confirmed_at" />
        </div>
        <div class="flex justify-content-end gap-2">
            <Button
                type="button"
                label="Cancel"
                severity="secondary"
                @click="bookingDateDialog = false"
            ></Button>
            <Button
                type="button"
                label="Save"
                @click="updateBookingDate"
            ></Button>
        </div>
    </Dialog>
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
</style>
