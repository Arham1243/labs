<script setup>
import { ref, onBeforeMount } from 'vue';
import { useCommonStore } from '@/stores';
import { PaginationOptions, SortFilterOptions } from '@/config';

const props = defineProps({
    entity_id: {
        type: String,
        required: true
    }
});

const commonStore = useCommonStore();

const items = ref([]);
const searchText = ref('');
const loading = ref(false);
const totalRecords = ref(0);

const pagination = new PaginationOptions();
const sortFilters = new SortFilterOptions();

onBeforeMount(() => {
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
        const payload = { ...sortFilters.getSortFilters() };
        const res = await commonStore.searchInsureds(
            payload,
            params,
            props.entity_id
        );
        items.value = res.data;
        totalRecords.value = res.meta.total;
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
                <Search v-model="searchText" @search="search" />
            </template>
            <template #empty>
                <Label data-testid="empty-state-message">
                    No insureds found.
                </Label>
            </template>
            <template #loading> Loading insureds. Please wait.</template>
            <Column sortable field="name" header="Name"> </Column>
            <Column sortable field="email" header="Email"> </Column>
            <Column field="phone" header="Phone"> </Column>
        </BaseTable>
    </div>
</template>

<style lang="scss" scoped></style>
