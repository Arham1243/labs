<script setup>
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import lodash from 'lodash';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { useSmartFilterStore } from '@/modules/policies/stores/SmartFilter';
import { useHelpers } from '@/composables';
import useEventsBus from '@/composables/event-bus';
import { PaginationOptions, SortFilterOptions } from '@/config';
import SmartFilterDialog from '@/modules/policies/components/dialogs/SmartFilterDialog.vue';
import AppliedFilters from '@/modules/policies/components/AppliedFilters.vue';
import { useToast } from 'primevue/usetoast';
import { maskPolicyNumber } from '@/modules/policies/utils/policyUtils';

const { t } = useI18n();
const helpers = useHelpers();
const { bus } = useEventsBus();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const policiesStore = usePoliciesStore();
const smartFilterStore = useSmartFilterStore();
const toast = useToast();
const router = useRouter();

const actionMenu = ref();
const bulkActionMenu = ref();
const searchText = ref('');
const selectedItem = ref(null);
const loading = ref(false);
const selectedItems = ref([]);
const policies = ref([]);
const totalRecords = ref();
let selectedFilters = smartFilterStore.selectedFilters;
const showFilterDialog = ref(false);
const columnsMenuItems = [
    { name: t('policies.policies_table.first_name'), field: 'first_name' },
    { name: t('policies.policies_table.last_name'), field: 'last_name' },
    { name: t('policies.policies_table.dob'), field: 'date_of_birth' },
    { name: t('policies.policies_table.booking_date'), field: 'booking_date' },
    { name: t('policies.policies_table.entry_date'), field: 'created_at' },
    { name: t('policies.policies_table.start_date'), field: 'start_date' },
    { name: t('policies.policies_table.end_date'), field: 'end_date' }
];
const visibleColumns = ref([]);
const menuMultipleAction = ref();
const columnSelectionsRef = ref(null);
const showPolicyNumber = ref(false);

watch(
    () => bus.value.get('reloadList'),
    async () => {
        selectedFilters = smartFilterStore.selectedFilters;
        await getItems();
    }
);

const actionMenuItems = computed(() => {
    if (!selectedItem.value) return [];

    return [
        {
            label: t('buttons.edit'),
            icon: 'pi pi-pencil',
            command: () => ''
        }
    ];
});

const bulkActionMenuItems = computed(() => {
    return [{ label: t('buttons.delete'), command: () => '' }];
});

const openFilterDialog = () => {
    showFilterDialog.value = true;
};

const onFiltersCleared = () => {
    selectedFilters = [];
    getItems();
};

const showActions = (event, item) => {
    selectedItem.value = item;
    actionMenu.value.toggle(event);
};

const showBulkActions = (event) => {
    menuMultipleAction.value.toggle(event);
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

        payload.filters = selectedFilters.map((filter) => {
            return { ...filter };
        });

        if (!searchText.value) {
            delete payload.search;
        }
        const res = await policiesStore.searchPolicies(payload, params);
        policies.value = res.data;
        totalRecords.value = res.meta?.total;
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('policies.review.error'),
            detail: t('policies.policies_table.loading_error'),
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

const goToPolicyDetailsPage = (record) => {
    router.push({
        name: 'Policy Details',
        params: { policyId: record.id, clientId: record.client_id }
    });
};

const goToOrderDetailsPage = (record) => {
    router.push({
        name: 'Order Details',
        params: {
            orderId: record.order_number.replace('ORD-', ''),
            clientId: record.client_id
        }
    });
};

const toggleColumnSelections = () => {
    columnSelectionsRef.value.show();
};

const getStatus = (status) => {
    return status ? status.split('_').join(' ') : null;
};
</script>

<template>
    <BaseTable
        id="policy-list-table"
        :value="policies"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        :loading="loading"
        v-model:selection="selectedItems"
        @sort="onSortChange"
        @page="onPageChange"
        scrollable
    >
        <template #header>
            <div class="flex justify-between edit-cancel-button">
                <div>
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
                        class="p-button-outlined mr-2"
                        @click="showBulkActions($event)"
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
                            smartFilterStore.rawFilters &&
                            smartFilterStore.rawFilters.length > 0
                                ? smartFilterStore.rawFilters.length.toString()
                                : null
                        "
                        @click="openFilterDialog()"
                        data-testid="filter-button"
                    />
                </div>

                <div class="flex gap-4">
                    <div>
                        <Search
                            data-testid="search-input"
                            v-model="searchText"
                            @search="search"
                        />
                    </div>
                    <div>
                        <Button
                            class="p-button-outlined"
                            @click="toggleColumnSelections()"
                            data-testid="column-button"
                        >
                            <i class="pi pi-cog mr-2" />
                            {{ $t('policies.policies_table.columns_button_label') }}
                            <i class="pi pi-chevron-down ml-2" />
                        </Button>
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
            </div>
            <div
                class="flex items-center justify-between mt-4 mb-2"
            >
                <AppliedFilters @cleared="onFiltersCleared" />
                <div
                    class="flex"
                    v-if="$ability.can('view policy administrations')"
                >
                    <InputField
                        variant="switch"
                        v-model="showPolicyNumber"
                        :falseValue="false"
                        :trueValue="true"
                        data-testid="show-policy-number"
                    />
                    <span class="ml-2 mt-1">
                        {{ $t('policies.policies_table.show_policy_number') }}
                    </span>
                </div>
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{ $t('policies.policies_table.empty_table_content') }}
            </span>
        </template>
        <template #loading>
            {{ $t('policies.policies_table.table_loading') }}
        </template>

        <Column selectionMode="multiple" />
        <Column
            field="order_number"
            :header="t('policies.policies_table.order')"
        >
            <template #body="{ data, index }">
                <span
                    class="underline text-primary font-bold cursor-pointer whitespace-nowrap"
                    :data-testid="'order-data-table-' + index"
                    @click="goToOrderDetailsPage(data)"
                >
                    {{ data.order_number }}
                </span>
            </template>
        </Column>

        <Column
            field="policy_number"
            :header="t('policies.policies_table.policy')"
        >
            <template #body="{ data, index }">
                <span
                    :data-testid="'policy-data-table-' + index"
                    class="underline text-primary font-bold cursor-pointer whitespace-nowrap"
                    @click="goToPolicyDetailsPage(data)"
                >
                    {{
                        showPolicyNumber ||
                        !$ability.can('view policy administrations')
                            ? data.policy_number
                            : maskPolicyNumber(data.policy_number)
                    }}
                </span>
            </template>
        </Column>
        <Column
            field="student_number"
            :header="t('policies.policies_table.student')"
        >
            <template #body="{ data, index }">
                <span :data-testid="'student-data-table-' + index">
                    {{ data.student_number ?? '-' }}
                </span>
            </template>
        </Column>

        <Column
            field="client.name"
            :header="t('policies.policies_table.client')"
        >
            <template #body="{ data, index }">
                <span
                    v-tooltip.top="helpers.getLocaleValue(data.client?.name)"
                    :data-testid="'client-name-table-' + index"
                >
                    {{
                        data.client?.name
                            ? lodash.truncate(
                                helpers.getLocaleValue(data.client?.name),
                                {
                                    length: 30
                                }
                            )
                            : '-'
                    }}
                </span>
            </template>
        </Column>

        <Column
            field="business_unit.name"
            :header="t('policies.policies_table.business_unit')"
        >
            <template #body="{ data, index }">
                <span
                    v-tooltip.top="
                        helpers.getLocaleValue(data.business_unit?.name)
                    "
                    :data-testid="'business_unit-name-table-' + index"
                >
                    {{
                        data.business_unit?.name
                            ? lodash.truncate(
                                helpers.getLocaleValue(
                                    data.business_unit?.name
                                ),
                                {
                                    length: 30
                                }
                            )
                            : '-'
                    }}
                </span>
            </template>
        </Column>

        <Column field="status" :header="t('policies.policies_table.status')">
            <template #body="{ data, index }">
                <StatusTag
                    class="whitespace-nowrap"
                    :status="getStatus(data.status)"
                    :data-testid="'status-tag-' + index"
                />
            </template>
        </Column>

        <Column
            field="first_name"
            :header="t('policies.policies_table.first_name')"
            v-if="visibleColumns.includes('first_name')"
        >
            <template #body="{ data, index }">
                <span :data-testid="'first-name-data-table-' + index">
                    {{ data.first_name }}
                </span>
            </template>
        </Column>

        <Column
            field="last_name"
            :header="t('policies.policies_table.last_name')"
            v-if="visibleColumns.includes('last_name')"
        >
            <template #body="{ data, index }">
                <span :data-testid="'last-name-data-table-' + index">
                    {{ data.last_name }}
                </span>
            </template>
        </Column>

        <Column
            field="date_of_birth"
            :header="t('policies.policies_table.dob')"
            v-if="visibleColumns.includes('date_of_birth')"
        >
            <template #body="{ data, index }">
                <span
                    :data-testid="'dob-data-table-' + index"
                    class="whitespace-nowrap"
                >
                    {{ helpers.formatDate(data.date_of_birth) }}
                </span>
            </template>
        </Column>

        <Column
            field="booking_date"
            :header="t('policies.policies_table.booking_date')"
            v-if="visibleColumns.includes('booking_date')"
        >
            <template #body="{ data, index }">
                <span
                    :data-testid="'booking-date-data-table-' + index"
                    class="whitespace-nowrap"
                >
                    {{ helpers.formatDate(data.booking_date) }}
                </span>
            </template>
        </Column>
        <Column
            field="created_at"
            :header="t('policies.policies_table.entry_date')"
            v-if="visibleColumns.includes('created_at')"
        >
            <template #body="{ data, index }">
                <span
                    :data-testid="'entry-date-data-table-' + index"
                    class="whitespace-nowrap"
                >
                    {{ helpers.formatDate(data.created_at) }}
                </span>
            </template>
        </Column>
        <Column
            field="start_date"
            :header="t('policies.policies_table.start_date')"
            v-if="visibleColumns.includes('start_date')"
        >
            <template #body="{ data, index }">
                <span
                    :data-testid="'start-date-data-table-' + index"
                    class="whitespace-nowrap"
                >
                    {{ helpers.formatDate(data.start_date) }}
                </span>
            </template>
        </Column>
        <Column
            field="end_date"
            :header="t('policies.policies_table.end_date')"
            v-if="visibleColumns.includes('end_date')"
        >
            <template #body="{ data, index }">
                <span
                    :data-testid="'end-date-data-table-' + index"
                    class="whitespace-nowrap"
                >
                    {{ helpers.formatDate(data.end_date) }}
                </span>
            </template>
        </Column>

        <Column v-if="policies.length > 0" :header="t('common.actions')">
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

    <SmartFilterDialog
        v-if="showFilterDialog"
        v-model="showFilterDialog"
        :title="t('policies.smart_filter.filter_policies')"
    />
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
