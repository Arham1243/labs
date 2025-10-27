<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import lodash from 'lodash';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';
import { useSmartFilterStore } from '@/modules/policies/stores/SmartFilter';
import { useHelpers } from '@/composables';
import { PaginationOptions, SortFilterOptions } from '@/config';
import SmartFilterDialog from '@/modules/policies/components/dialogs/SmartFilterDialog.vue';
import EnrollmentMessage from '@/modules/policies/components/order/EnrollmentMessage.vue';
import AppliedFilters from '@/modules/policies/components/AppliedFilters.vue';
import { useToast } from 'primevue/usetoast';
import { useCartsStore } from '@/modules/policies/stores';
import { useClientStore } from '@/modules/clients/stores/index.js';
import { useSmartTemplate } from '@/modules/policies/composables/smartTemplate.js';

const { t } = useI18n();
const helpers = useHelpers();
const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();
const policiesStore = usePoliciesStore();
const smartFilterStore = useSmartFilterStore();
const cartsStore = useCartsStore();
const clientStore = useClientStore();
const toast = useToast();
const router = useRouter();
const route = useRoute();
const { checkoutTime } = useSmartTemplate();

const searchText = ref('');
const loading = ref(false);
const carts = ref([]);
const cartsAggregation = ref({});
const totalRecords = ref();
const showFilterDialog = ref(false);
const businessUnitId = ref(route.query.business_unit_id);

const filterableBySmartFilter = [
    'items.amount',
    'id',
    'items.business_unit_id'
];
const smartFilterExtraFields = {
    ['items.amount']: {
        id: 'items.amount',
        name: t('carts.total_amount'),
        dataType: smartFilterStore.fieldDataTypeEnum.NUMBER,
        operatorTypes: [
            smartFilterStore.operatorTypes.LESS_THAN,
            smartFilterStore.operatorTypes.LESS_THAN_EQUAL_TO,
            smartFilterStore.operatorTypes.GREATER_THAN,
            smartFilterStore.operatorTypes.GREATER_THAN_EQUAL_TO,
            smartFilterStore.operatorTypes.EQUAL_TO
        ]
    },
    ['items.business_unit_id']: {
        id: 'items.business_unit_id',
        name: t('policies.smart_filter.business_units'),
        operatorTypes: [
            smartFilterStore.operatorTypes.ANY_OF,
            smartFilterStore.operatorTypes.NONE_OF
        ],
        getData: async (search) => {
            try {
                const res = await clientStore.searchBusinessUnits(
                    {
                        search: {
                            value: search
                        }
                    },
                    { limit: 100 }
                );
                return res.data;
            } catch (e) {
                return [];
            }
        }
    },
    id: {
        id: 'id',
        name: t('carts.table.cart_num'),
        dataType: smartFilterStore.fieldDataTypeEnum.MULTI_SELECT,
        operatorTypes: [
            smartFilterStore.operatorTypes.ANY_OF,
            smartFilterStore.operatorTypes.NONE_OF
        ],
        getData: async (search) => {
            const payload = {
                search: {
                    value: search
                },
                filters: []
            };
            const res = await cartsStore.searchCarts(payload, {
                include: 'items',
                limit: 1000
            });
            return (res.data || []).map((cart) => {
                return { id: cart.id, name: cart.id };
            });
        }
    }
};

const openFilterDialog = () => {
    showFilterDialog.value = true;
};

const onFiltersCleared = () => {
    getItems();
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

const search = () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getItems();
};

totalRecords.value = carts.value.length;

const getItems = async () => {
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams(), include: 'items' };
        const payload = sortFilters.getSortFilters(searchText.value);

        if (!payload?.sort?.length) {
            payload.sort = [{ field: 'created_at', direction: 'desc' }];
        }

        payload.filters = [];

        if (smartFilterStore.selectedFilters?.length > 0) {
            payload.filters.push({
                nested: smartFilterStore.selectedFilters.map((filter) => {
                    return { ...filter };
                })
            });
        }

        if (businessUnitId.value) {
            payload.filters.push({
                field: 'items.business_unit_id',
                operator: '=',
                value: businessUnitId.value
            });
        }

        if (!searchText.value) {
            delete payload.search;
        }
        const res = await cartsStore.searchCarts(payload, params);
        carts.value = res.data;
        totalRecords.value = res.meta?.total;
    } catch (e) {
        toast.add({
            severity: 'error',
            summary: t('policies.review.error'),
            detail: t('policies.policies_table.loading_error'),
            life: 5000
        });
    } finally {
        aggregates().then();
        loading.value = false;
    }
};

const aggregates = async () => {
    try {
        loading.value = true;

        let filters = [];
        if (smartFilterStore.selectedFilters?.length > 0) {
            filters.push({
                nested: smartFilterStore.selectedFilters.map((filter) => {
                    return { ...filter };
                })
            });
        }

        if (businessUnitId.value) {
            filters.push({
                field: 'items.business_unit_id',
                operator: '=',
                value: businessUnitId.value
            });
        }

        const params = { include: 'items', limit: 1000 };
        const payload = {
            aggregates: [
                { type: 'sum', relation: 'items', field: 'amount' },
                { type: 'sum', relation: 'items', field: 'qty' }
            ],
            search: { value: searchText.value },
            filters
        };

        cartsAggregation.value = await cartsStore.searchCarts(payload, params);
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

const goToOrderSummaryPage = async (cart) => {
    const cartItem = cart.items[0];

    if (!cartItem) {
        toast.add({
            severity: 'warn',
            summary: t('carts.table.empty_cart_warn_title'),
            detail: t('carts.table.empty_cart_warn_message'),
            life: 5000
        });
        return;
    }

    const businessUnit = {
        ...cartItem.business_unit,
        billing_detail: {
            payment_type: cartItem.business_unit.payment_type
        }
    };

    policiesStore.setCart(cart);
    policiesStore.setOrderDetails(
        cartItem.client,
        businessUnit,
        { id: cartItem.contact_source, name: cartItem.contact_source },
        cartItem.contact_source === 'message_center'
            ? { id: cartItem.message_id }
            : null
    );

    router.push({ name: 'Summary' });
};

watch(
    () => route.query,
    (newQuery, oldQuery) => {
        businessUnitId.value = newQuery.business_unit_id;
        getItems();
    },
    { deep: true }
);

onMounted(() => {
    getItems();
});

defineExpose({ cartsAggregation });
</script>

<template>
    <EnrollmentMessage
        type="warning"
        icon="pi-clock"
        :data-testid="'checkout-warning-message'"
    >
        {{
            $t('policies.order.checkout_time', {
                time: checkoutTime
            })
        }}
    </EnrollmentMessage>
    <BaseTable
        id="policy-list-table"
        :value="carts"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        :loading="loading"
        @sort="onSortChange"
        @page="onPageChange"
        scrollable
    >
        <template #header>
            <div class="flex align-items-center justify-content-between mb-2">
                <div
                    class="flex justify-content-between align-items-center gap-3"
                >
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

            <AppliedFilters @cleared="onFiltersCleared" />
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{ $t('carts.table.empty_table_content') }}
            </span>
        </template>
        <template #loading>
            {{ $t('carts.table.table_loading') }}
        </template>

        <Column field="cart_number" :header="t('carts.table.cart_num')">
            <template #body="{ data, index }">
                <span
                    class="underline text-primary font-bold cursor-pointer white-space-nowrap"
                    :data-testid="'cart-table-' + index"
                    @click="goToOrderSummaryPage(data)"
                >
                    {{ data.id }}
                </span>
            </template>
        </Column>

        <Column
            field="client.name"
            :header="t('policies.policies_table.client')"
        >
            <template #body="{ data, index }">
                <span
                    v-tooltip.top="
                        helpers.getLocaleValue(data.items[0]?.client?.name)
                    "
                    :data-testid="'client-name-table-' + index"
                >
                    {{
                        lodash.truncate(
                            helpers.getLocaleValue(data.items[0]?.client?.name),
                            {
                                length: 30
                            }
                        )
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
                        helpers.getLocaleValue(
                            data.items[0]?.business_unit?.name
                        )
                    "
                    :data-testid="'business_unit-name-table-' + index"
                >
                    {{
                        lodash.truncate(
                            helpers.getLocaleValue(
                                data.items[0]?.business_unit?.name
                            ),
                            {
                                length: 30
                            }
                        )
                    }}
                </span>
            </template>
        </Column>

        <Column field="total_amount" :header="t('carts.total_amount')">
            <template #body="{ data, index }">
                <span
                    :data-testid="'amount-data-table-' + index"
                    class="white-space-nowrap"
                >
                    ${{
                        data.items?.reduce(
                            (sum, item) => sum + (item.amount || 0),
                            0
                        )
                    }}
                </span>
            </template>
        </Column>

        <Column v-if="carts.length > 0" :header="t('common.actions')">
            <template #body="{ data, index }">
                <Button
                    :label="$t('carts.table.resume')"
                    icon="pi pi-arrow-right"
                    iconPos="right"
                    size="small"
                    class="p-button-outlined flex"
                    @click="goToOrderSummaryPage(data)"
                    :data-testid="'actions-button-' + index"
                />
            </template>
        </Column>
    </BaseTable>

    <SmartFilterDialog
        v-if="showFilterDialog"
        v-model="showFilterDialog"
        :title="t('policies.smart_filter.filter_carts')"
        :filterable-by="filterableBySmartFilter"
        :extra-fields="smartFilterExtraFields"
        @reloadList="getItems"
        module="cart"
    />
</template>
<style lang="scss">
// Component-specific styles can be added here if needed
</style>
