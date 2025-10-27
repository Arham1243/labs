<script setup>
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import { ref, watch } from 'vue';
import { useAdjudicationQueueStore } from '@/modules/claims/stores/AdjudicationQueue';
import { useHelpers } from '@/composables';
import { useRouter } from 'vue-router';
import { formatLabel } from '@/modules/claims/utils/helper';

const props = defineProps({
    queueId: {
        type: String,
        required: true
    }
});

const helpers = useHelpers();
const router = useRouter();

const {
    searchAdjudicationQueueSubmissions,
    currentAdjudicationQueueSubmissions,
    pagination
} = useAdjudicationQueueStore();

// Submissions
let submissions = ref([]);

let table_cols = [
    {
        label: 'Submission ID',
        field: 'submission_ref_number',
        sortable: true
    },
    { label: 'Source', field: 'submission_source', sortable: true },
    { label: 'Status', field: 'audit_status', sortable: true },
    { label: 'Processing Date', field: 'created_at', sortable: true }
];

// On Row Select
const onRowSelect = (event) =>
    router.push(
        `/claims/submissions/${event.data.submission_id}/client/${event.data.client_id}`
    );

// Search
let searchText = ref('');

const { loading, meta, mutate: search } = searchAdjudicationQueueSubmissions();
search();

const onSortChange = (event) =>
    search({ event, type: 'sort', search: searchText.value });
const onPageChange = (event) => search({ event });

watch(
    () => currentAdjudicationQueueSubmissions,
    () => {
        if (currentAdjudicationQueueSubmissions?.value?.length) {
            submissions.value = currentAdjudicationQueueSubmissions.value.map(
                (s) => ({
                    ...s,
                    created_at: helpers.formatDate(s.created_at)
                })
            );
        } else {
            submissions.value = [];
        }
    },
    { deep: true }
);
</script>

<template>
    <BaseTable
        class="card mt-4"
        selectionMode="single"
        :value="submissions"
        @rowSelect="onRowSelect"
        paginator
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="meta?.total"
        @page="onPageChange"
        @sort="onSortChange"
        :loading="loading"
        :rowsPerPageOptions="[5, 10, 20]"
        paginatorTemplate=" CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
    >
        <template #header>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <Search
                        v-model="searchText"
                        @search="search({ search: searchText })"
                        data-testid="search-input"
                    />
                    <Button
                        outlined
                        icon="pi pi-filter"
                        :label="$t('claims.filter')"
                        data-testid="btn-submission-table-filter"
                    />
                </div>
            </div>
        </template>

        <Column
            v-for="{ label, field, sortable } in table_cols"
            :key="label"
            :header="label"
            :sortable="sortable"
            :sortField="field"
        >
            <template #body="{ data, index }">
                <ClaimStatusTag
                    v-if="field === 'audit_status'"
                    :status="data.audit_status.replace(/_/g, '-')"
                    :data-testid="'data-table-status-' + index"
                    icon=""
                />
                <span
                    v-else
                    :data-testid="`data-table-${field}-${index}`"
                    v-text="
                        field === 'submission_source'
                            ? formatLabel(data[field])
                            : data[field]
                    "
                    :class="
                        field === 'submission_ref_number'
                            ? 'underline text-muted-color'
                            : ''
                    "
                />
            </template>
        </Column>
    </BaseTable>
</template>

<style scoped lang="scss"></style>
