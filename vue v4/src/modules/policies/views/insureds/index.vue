<script setup>
import Label from '@/components/common/Label.vue';
import { useHelpers } from '@/composables';
import { ref, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import { useCommonStore } from '@/stores';
import { useInsuredsStore } from '@/modules/policies/stores/Insureds';

import { PaginationOptions, SortFilterOptions } from '@/config';

import OrderPoliciesDialog from '@/modules/policies/components/dialogs/OrderPoliciesDialog.vue';

const router = useRouter();
const commonStore = useCommonStore();
const insuredsStore = useInsuredsStore();
const helpers = useHelpers();

const countries = ref([]);
const insureds = ref([]);
const searchText = ref('');
const isLoading = ref(false);
const totalRecords = ref(0);
const showOrderPoliciesDialog = ref(false);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onBeforeMount(async () => {
    isLoading.value = true;

    await getCountries('');
    await getInsureds();

    isLoading.value = false;
});

const rowClicked = ({ data }) => {
    router.push({
        name: 'Details',
        params: { insuredId: data.id }
    });
};

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getInsureds();
};

const onSortChange = (event) => {
    pagination.resetPageParams();
    sortFilters.updateSortFilters(event);
    getInsureds();
};

const orderNewPolicy = (event) => {
    showOrderPoliciesDialog.value = true;
};

const search = async () => {
    pagination.resetPageParams();
    sortFilters.updateSearch(searchText.value);
    getInsureds();
};

const countryNameById = (id) => {
    const country = countries.value.find((c) => c.id === id);
    return country?.name || '-';
};

const getCountries = async (search) => {
    try {
        const res = await commonStore.searchCountries({
            search: {
                value: search
            }
        });
        countries.value = res.data;
    } catch (error) {
    } finally {
    }
};

const getTableHeaderPtForTestId = (testId) => {
    return {
        headerCell: {
            'data-testid': testId
        }
    };
};

const getInsureds = async () => {
    try {
        isLoading.value = true;

        const params = pagination.getPageParams();
        const payload = sortFilters.getSortFilters();

        if (!payload?.sort?.length) {
            payload.sort = [{ field: 'created_at', direction: 'desc' }];
        }

        const res = await insuredsStore.searchInsureds(payload, params);
        insureds.value = res.data;
        totalRecords.value = res.meta.total;
    } catch (error) {
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div>
        <Header hide-back>
            <template #title>
                <Label test-id="page-title">{{
                    $t('insureds.overview')
                }}</Label>
            </template>
            <template #actions>
                <Button
                    data-testid="new-policy-button"
                    type="button"
                    :label="$t('insureds.order_policies')"
                    icon="pi pi-plus"
                    @click="orderNewPolicy"
                />
            </template>
        </Header>
         <Card class="mt-6">
            <template #content>
                <div>
                    <BaseTable
                        :value="insureds"
                        :loading="isLoading"
                        :page="pagination.page"
                        :rows="pagination.limit"
                        :total-records="totalRecords"
                        @row-click="rowClicked"
                        @page="onPageChange"
                        @sort="onSortChange"
                    >
                        <template #header>
                            <div class="flex items-center justify-between">
                                <Button
                                    :label="$t('insureds.filter')"
                                    icon="pi pi-filter"
                                    iconPos="left"
                                    class="p-button-outlined mr-2"
                                    disabled
                                    data-testid="filter-button"
                                />
                                <div class="w-80">
                                    <Search
                                        v-model="searchText"
                                        @search="search"
                                        data-testid="input-search"
                                    />
                                </div>
                            </div>
                        </template>
                        <template #empty>{{
                            $t('insureds.no_insureds_found')
                        }}</template>
                        <template #loading>
                            {{ $t('insureds.loading_insureds') }}
                        </template>
                        <Column
                            field="id"
                            :header="$t('insureds.id')"
                            class="p-break-word"
                            :pt="getTableHeaderPtForTestId('id-header')"
                        >
                            <template #body="{ data, index }">
                                <span :data-testid="'id-data-table-' + index">
                                    {{ data.id }}
                                </span>
                            </template>
                        </Column>
                        <Column
                            field="first_name"
                            :header="$t('insureds.first_name')"
                            class="p-break-word"
                            :pt="getTableHeaderPtForTestId('first-name-header')"
                        >
                            <template #body="{ data, index }">
                                <span
                                    :data-testid="
                                        'first-name-data-table-' + index
                                    "
                                >
                                    {{ data.first_name ?? '-' }}
                                </span>
                            </template>
                        </Column>
                        <Column
                            field="last_name"
                            :header="$t('insureds.last_name')"
                            class="p-break-word"
                            :pt="getTableHeaderPtForTestId('last-name-header')"
                        >
                            <template #body="{ data, index }">
                                <span
                                    :data-testid="
                                        'last-name-data-table-' + index
                                    "
                                >
                                    {{ data.last_name ?? '-' }}
                                </span>
                            </template>
                        </Column>
                        <Column
                            :header="$t('insureds.date_of_birth')"
                            field="date_of_birth"
                            class="p-break-word"
                            :pt="
                                getTableHeaderPtForTestId(
                                    'date-of-birth-header'
                                )
                            "
                        >
                            <template #body="{ data, index }">
                                <span
                                    :data-testid="
                                        'date-of-birth-data-table-' + index
                                    "
                                >
                                    {{ helpers.formatDate(data.date_of_birth) }}
                                </span>
                            </template>
                        </Column>
                        <Column
                            :header="$t('insureds.email')"
                            field="email"
                            class="p-break-word"
                            :pt="getTableHeaderPtForTestId('email-header')"
                        >
                            <template #body="{ data, index }">
                                <span
                                    :data-testid="'email-data-table-' + index"
                                >
                                    {{ data.email ?? '-' }}
                                </span>
                            </template>
                        </Column>
                        <Column
                            :header="$t('insureds.country_of_origin')"
                            field="country_id"
                            class="p-break-word"
                            :pt="
                                getTableHeaderPtForTestId(
                                    'country-of-origin-header'
                                )
                            "
                        >
                            <template #body="{ data, index }">
                                <span
                                    :data-testid="'country-data-table-' + index"
                                >
                                    {{ countryNameById(data.country_id) }}
                                </span>
                            </template>
                        </Column>
                        <Column
                            sortable
                            :header="$t('insureds.created_date')"
                            field="created_at"
                            class="p-break-word"
                            :pt="
                                getTableHeaderPtForTestId('created-date-header')
                            "
                        >
                            <template #body="{ data, index }">
                                <span
                                    :data-testid="
                                        'added-date-data-table-' + index
                                    "
                                >
                                    {{ helpers.formatDate(data.created_at) }}
                                </span>
                            </template>
                        </Column>
                    </BaseTable>
                </div>
            </template>
        </Card>
    </div>

    <OrderPoliciesDialog v-model="showOrderPoliciesDialog" />
</template>
