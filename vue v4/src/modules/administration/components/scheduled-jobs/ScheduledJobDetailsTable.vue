<script setup>
import { ref, computed, onBeforeMount } from 'vue';
import { useScheduledJobStore } from '@/modules/administration/stores';
import { PaginationOptions } from '@/config';
import { useHelpers } from '@/composables';

const props = defineProps({
    job: {
        type: Object,
        required: true
    }
});

const scheduledJobStore = useScheduledJobStore();
const helpers = useHelpers();
const jobLogs = ref([]);
const job = ref(props.job);
const loading = ref(false);
const sortField = ref(null);
const sortOrder = ref(null);
const totalRecords = ref();
const pagination = new PaginationOptions();

onBeforeMount(async () => {
    await getJobLogs();
});

const sortedLogs = computed(() => {
    if (!sortField.value || !sortOrder.value) return jobLogs.value;

    return [...jobLogs.value].sort((a, b) => {
        const aVal = a[sortField.value];
        const bVal = b[sortField.value];

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        if (sortField.value === 'created_at') {
            return sortOrder.value * (new Date(aVal) - new Date(bVal));
        }

        return sortOrder.value * aVal.toString().localeCompare(bVal.toString());
    });
});

const onPageChange = (event) => {
    pagination.updatePageParams(event);
    getJobLogs();
};

const onSortChange = async (e) => {
    loading.value = true;
    sortField.value = e.sortField;
    sortOrder.value = e.sortOrder;
    await new Promise((r) => setTimeout(r, 300));
    loading.value = false;
};

const getJobLogs = async () => {
    if (!job.value?.key) return;
    try {
        loading.value = true;
        const params = { ...pagination.getPageParams() };
        const res = await scheduledJobStore.getJobLogs(job.value.key, params);
        jobLogs.value = res.data;
        totalRecords.value = res.meta.total;
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <BaseTable
        :value="sortedLogs"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="totalRecords"
        :loading="loading"
        @sort="onSortChange"
        @page="onPageChange"
        :sort-field="sortField"
        :sort-order="sortOrder"
    >
        <template #empty>
            <span data-testid="empty-data-table">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('scheduled_jobs.execution_logs').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading>
            {{
                $t('common.datatable_loading', {
                    item: $t('scheduled_jobs.execution_logs').toLowerCase()
                })
            }}
        </template>

        <Column :sortable="true" field="type" class="w-2/12">
            <template #header>
                <span data-testid="table-header-type">
                    {{ $t('common.type') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span
                    :data-testid="'type-data-table-' + index"
                    class="capitalize"
                >
                    {{ data.type }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="created_at" class="w-3/12">
            <template #header>
                <span data-testid="table-header-created_at">
                    {{ $t('scheduled_jobs.date') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'date-data-table-' + index">
                    {{
                        helpers.formatDate(
                            data.created_at,
                            'DD-MMM-YYYY HH:mm:ss'
                        )
                    }}
                </span>
            </template>
        </Column>

        <Column :sortable="false" field="error_message">
            <template #header>
                <span data-testid="table-header-error-message">
                    {{ $t('scheduled_jobs.error_message') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'error-data-table-' + index">
                    {{ data.error_message }}
                </span>
            </template>
        </Column>
    </BaseTable>
</template>
