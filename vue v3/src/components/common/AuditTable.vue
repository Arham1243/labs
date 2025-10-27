<script setup>
import { useHelpers } from '@/composables';
import { ref, onBeforeMount } from 'vue';
import { useCommonStore } from '@/stores';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { PaginationOptions, SortFilterOptions } from '@/config';

const props = defineProps({
    entity: {
        type: String,
        required: true
    },
    entity_id: {
        type: String,
        required: true
    },
    client_id: {
        type: String,
        required: false
    }
});

const helpers = useHelpers();
const commonStore = useCommonStore();
const { formatValue, initialize, isReady } = useDateFormatter();

const items = ref([]);
const searchText = ref('');
const loading = ref(false);
const totalRecords = ref(0);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onBeforeMount(() => {
    initialize();
    getItems();
});

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
        if (props.client_id) {
            params.client_id = props.client_id;
        }
        const payload = {
            ...sortFilters.getSortFilters()
        };
        const res = await commonStore.searchActivityLogs(
            payload,
            params,
            props.entity,
            props.entity_id
        );
        items.value = res.data;
        totalRecords.value = res.meta.total;
    } catch (error) {
        console.log(error);
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
            @page="onPageChange"
            @sort="onSortChange"
        >
            <template #header>
                <Search
                    v-model="searchText"
                    @search="search"
                    data-testid="search-input"
                />
            </template>
            <template #empty>
                <span data-testid="empty-data-table">No logs found. </span>
            </template>
            <template #loading>
                <span data-testid="empty-data-table"
                    >Loading logs. Please wait.</span
                >
            </template>
            <Column sortable field="created_at">
                <template #header>
                    <span data-testid="table-header-created-at">Date</span>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'created-at-data-table-' + index">
                        {{
                            formatValue(data.created_at, {
                                type: 'date',
                                format: 'long'
                            }) +
                            ' ' +
                            formatValue(data.created_at, {
                                type: 'time',
                                format: 'long'
                            })
                        }}
                    </span>
                </template>
            </Column>
            <Column sortable field="properties->causer_email">
                <template #header>
                    <span data-testid="table-header-causer.email">User</span>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'causer-email-data-table-' + index">
                        {{ data.causer_email }}
                    </span>
                </template>
            </Column>
            <Column sortable field="event">
                <template #header>
                    <span data-testid="table-header-event">Event</span>
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'event-data-table-' + index">
                        {{ helpers.capitalizeWords(data.event) }}
                    </span>
                </template>
            </Column>
            <Column field="description">
                <template #header>
                    <span data-testid="table-header-description"
                        >Description</span
                    >
                </template>
                <template #body="{ data, index }">
                    <span :data-testid="'description-data-table-' + index">
                        {{ data.description }}
                    </span>
                </template>
            </Column>
        </BaseTable>
    </div>
</template>
