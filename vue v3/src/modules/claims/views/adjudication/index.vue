<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import { useAdjudicationQueueStore } from '@/modules/claims/stores/AdjudicationQueue';
import { startOfDay, endOfDay } from '@/modules/claims/utils/helper';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import AdjudicationCard from '@/modules/claims/components/adjudication/AdjudicationCard.vue';
import AdjudicationActionsButton from '@/modules/claims/components/adjudication/AdjudicationActionsButton.vue';
import AdjudicationTimeFrameFilter from '@/modules/claims/components/adjudication/AdjudicationTimeFrameFilter.vue';

const router = useRouter();
const helpers = useHelpers();
const { t } = useI18n();

const startDate = ref(null);
const endDate = ref(null);

const {
    getQueueDashboard,
    adjudicationQueues,
    searchAdjudicationQueue,
    mutateQueuePriority,
    pagination
} = useAdjudicationQueueStore();

getQueueDashboard();
const { loading, meta, mutate: search } = searchAdjudicationQueue();
search({
    event: { page: 0, limit: 10, sortField: 'priority', sortOrder: 1 },
    type: 'sort'
});

const queues = ref([]);

const table_cols = [
    { label: '#', field: 'priority', sortable: true },
    { label: 'Name', field: 'name', sortable: true },
    { label: 'Status', field: 'status', sortable: true },
    { label: 'Effective Date', field: 'start_at', sortable: true },
    {
        label: 'Subs in Last Batch',
        field: 'total_submissions_in_last_batch',
        sortable: true
    },
    { label: 'Audit Frequency', field: 'audit_frequency', sortable: true },
    { label: 'Accuracy', field: 'accuracy', sortable: true }
];

// Fetch dashboard data with current dates
const fetchQueueDashboard = ({
    startDate: customStart,
    endDate: customEnd
}) => {
    startDate.value = customStart ? startOfDay(new Date(customStart)) : null;
    endDate.value = customEnd ? endOfDay(new Date(customEnd)) : null;

    if (!startDate.value || !endDate.value) {
        // If no dates are selected, fetch the default dashboard
        return getQueueDashboard(null, true);
    }

    getQueueDashboard(
        {
            filters: [
                {
                    field: 'created_at',
                    value:
                        helpers.formatDate(
                            startDate.value?.toISOString(),
                            'YYYY-MM-DD'
                        ) + ' 00:00:00',
                    operator: '>='
                },
                {
                    field: 'created_at',
                    value:
                        helpers.formatDate(
                            endDate.value?.toISOString(),
                            'YYYY-MM-DD'
                        ) + ' 00:00:00',
                    operator: '<='
                }
            ]
        },
        true
    );
};

// Update displayed queue data
watch(
    () => adjudicationQueues,
    () => {
        if (adjudicationQueues?.value?.length) {
            queues.value = adjudicationQueues.value.map((q) => ({
                ...q,
                start_at: helpers.formatDate(q.start_at),
                last_batch_subs: q.last_batch_subs?.length ?? 0,
                audit_frequency: 'every ' + q.audit_frequency + ' claims',
                accuracy: q.accuracy ? q.accuracy + '%' : '-'
            }));
        } else {
            queues.value = [];
        }
    },
    { deep: true, immediate: true }
);

const searchText = ref('');
const onRowSelect = (event) =>
    router.push(`/claims/adjudication/${event.data.id}`);
const onSortChange = (event) =>
    search({ event, type: 'sort', search: searchText.value });
const onPageChange = (event) => search({ event });

// Handling Priority Changes

const {
    loading: loadingPriority,
    mutate: changePriority,
    status
} = mutateQueuePriority();
let setPriority = ref(false);

const reOrder = (set = false) => {
    setPriority.value = set;
    let rows = set ? meta.value.total : 10;
    search({
        event: { page: 0, rows, sortField: 'priority', sortOrder: 1 },
        type: 'sort'
    });
};

const onRowReorder = (event) => {
    queues.value = event.value;
};

const saveOrder = () => {
    if (queues.value.length)
        changePriority({ queue_ids: queues.value.map((queue) => queue.id) });
};

watch(
    () => status.value,
    () => {
        if (status.value === 'success') setPriority.value = false;
    }
);
</script>

<template>
    <div class="flex justify-content-between align-items-center mb-4">
        <div>
            <h3 v-text="t('adjudication.title')" />
            <p>
                <span v-text="t('adjudication.system_frequency')" />: Every 20
                Minutes
            </p>
        </div>
        <div class="flex gap-3">
            <span class="p-input-icon-right">
                <i class="pi pi-calendar" />
                <AdjudicationTimeFrameFilter
                    @fetch-data="fetchQueueDashboard"
                />
            </span>
            <Button
                label="New"
                icon="pi pi-plus"
                data-testid="btn-new-queue"
                @click="router.push('/claims/adjudication/new')"
            />
        </div>
    </div>

    <AdjudicationCard />

    <BaseTable
        class="card mt-3 p-3"
        :value="queues"
        :page="pagination.page"
        :rows="pagination.limit"
        :total-records="meta?.total"
        :loading="loading"
        @sort="onSortChange"
        @page="onPageChange"
        @rowSelect="onRowSelect"
        selectionMode="single"
        :reorderableColumns="true"
        @rowReorder="onRowReorder"
    >
        <template #header>
            <div class="flex justify-content-between">
                <Search
                    v-model="searchText"
                    @search="search({ search: searchText })"
                    :style="{ width: '15vw' }"
                    data-testid="search-input"
                />
                <div class="flex gap-2">
                    <template v-if="!setPriority">
                        <Button
                            label="Change Priority"
                            data-testid="btn-priority-set"
                            @click="reOrder(true)"
                            class=""
                            outlined
                        />
                    </template>
                    <template v-else>
                        <Button
                            label="Cancel"
                            @click="reOrder()"
                            text
                            data-testid="btn-priority-cancel"
                        />
                        <Button
                            label="Save"
                            @click="saveOrder"
                            icon="pi pi-check"
                            :loading="loadingPriority"
                            data-testid="btn-priority-save"
                        />
                    </template>
                </div>
            </div>
        </template>

        <Column
            v-if="setPriority"
            rowReorder
            headerStyle="width: 3rem"
            :reorderableColumn="false"
            rowReorderIcon="pi pi-sort"
        />

        <Column
            v-for="{ label, field, sortable } in table_cols"
            :key="label"
            :header="label"
            :field="field"
            :sortable="setPriority ? false : sortable"
            :sortField="field"
        >
            <template #body="{ data, index }">
                <ClaimStatusTag
                    v-if="field === 'status'"
                    :status="data.status"
                    :data-testid="'data-table-status-' + index"
                    icon=""
                />
                <span
                    v-else
                    :data-testid="`data-table-${field}-${index}`"
                    v-text="data[field]"
                />
            </template>
        </Column>

        <Column>
            <template #body="{ data, index }">
                <AdjudicationActionsButton
                    :data="data"
                    :index="index"
                    :buttonOutline="true"
                />
            </template>
        </Column>
    </BaseTable>
</template>
