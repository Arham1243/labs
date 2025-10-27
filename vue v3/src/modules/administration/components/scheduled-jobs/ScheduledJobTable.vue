<script setup>
import { computed, onBeforeMount, ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useScheduledJobStore } from '@/modules/administration/stores';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import ScheduledJobDetailsTable from '@/modules/administration/components/scheduled-jobs/ScheduledJobDetailsTable.vue';
import cronstrue from 'cronstrue';

const { t } = useI18n();
const helpers = useHelpers();
const globalStore = useGlobalStore();
const scheduledJobStore = useScheduledJobStore();

const menu = ref();
const selectedItem = ref(null);
const loading = ref(false);
const cron = ref('* * * * *');
const busy = ref(false);
const jobs = ref([]);
const search = ref('');
const sortField = ref(null);
const sortOrder = ref(null);
const jobDetailsDialogVisible = ref(false);
const jobFrequencyDialogVisible = ref(false);

onBeforeMount(async () => {
    await getJobs();
});

watch(jobFrequencyDialogVisible, (val) => {
    if (val) {
        nextTick(() => {
            const mask = document.querySelector('.p-dialog-mask');
            if (mask) mask.classList.add('job-frequency-dialog-overlay');
        });
    }
});

const filteredJobs = computed(() => {
    if (!search.value) return jobs.value;
    return jobs.value.filter((job) =>
        job.name.toLowerCase().includes(search.value.toLowerCase())
    );
});

const sortedJobs = computed(() => {
    if (!sortField.value || !sortOrder.value) return filteredJobs.value;

    return [...filteredJobs.value].sort((a, b) => {
        const aVal = a[sortField.value];
        const bVal = b[sortField.value];

        const dateFields = [
            'started_at',
            'finished_at',
            'failed_at',
            'next_run'
        ];

        if (dateFields.includes(sortField.value)) {
            if (
                (aVal == null || aVal === '') &&
                (bVal == null || bVal === '')
            ) {
                return 0;
            }

            if (aVal == null || aVal === '') {
                return sortOrder.value;
            }
            if (bVal == null || bVal === '') {
                return -sortOrder.value;
            }

            return sortOrder.value * (new Date(aVal) - new Date(bVal));
        }

        if (aVal == null) return 1;
        if (bVal == null) return -1;

        return sortOrder.value * aVal.toString().localeCompare(bVal.toString());
    });
});

const menuItems = computed(() => {
    if (!selectedItem.value) return [];

    const allMenuItems = [
        {
            label: t('app_center.manage'),
            icon: 'pi pi-pencil',
            command: () => showJobFrequencyDialog(),
            permission: 'update scheduled jobs'
        },
        {
            label: t('common.view'),
            icon: 'pi pi-eye',
            command: () => showJobDetailsDialog(),
            permission: 'view scheduled jobs'
        }
    ];
    return helpers.filterByPermission(allMenuItems);
});

const showActions = (event, item) => {
    selectedItem.value = item;
    menu.value.toggle(event);
};

const showJobDetailsDialog = () => {
    jobDetailsDialogVisible.value = true;
};

const showJobFrequencyDialog = () => {
    cron.value = selectedItem.value?.cron_expression || '* * * * *';
    jobFrequencyDialogVisible.value = true;
};

const closeJobFrequencyDialog = () => {
    jobFrequencyDialogVisible.value = false;
    resetForm();
};

const resetForm = () => {
    cron.value = '* * * * *';
    selectedItem.value = {};
    globalStore.clearErrors();
};

const onShow = () => {
    resetForm();
};

const onSortChange = async (e) => {
    loading.value = true;
    sortField.value = e.sortField;
    sortOrder.value = e.sortOrder;
    await new Promise((r) => setTimeout(r, 300));
    loading.value = false;
};

const getJobs = async () => {
    try {
        loading.value = true;
        const res = await scheduledJobStore.getJobs();
        jobs.value = res.data;
    } finally {
        loading.value = false;
    }
};

const updateJobFrequency = async () => {
    if (!selectedItem.value?.key) return;
    try {
        busy.value = true;
        const payload = { cron_expression: cron.value };
        await scheduledJobStore.updateJobFrequency(
            selectedItem.value.key,
            payload
        );
        closeJobFrequencyDialog();
        getJobs();
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <BaseTable
        :value="sortedJobs"
        :loading="loading"
        :sort-field="sortField"
        :sort-order="sortOrder"
        @sort="onSortChange"
        class="scheduled-jobs-table"
    >
        <template #header>
            <div class="flex justify-content-between align-items-center mb-2">
                <Search
                    v-model="search"
                    :style="{ width: '30vw' }"
                    data-testId="search-input"
                />
            </div>
        </template>
        <template #empty>
            <span :data-testid="'empty-data-table'">
                {{
                    $t('common.datatable_not_found', {
                        item: $t('scheduled_jobs.title').toLowerCase()
                    })
                }}
            </span>
        </template>

        <template #loading>{{
            $t('common.datatable_loading', {
                item: $t('scheduled_jobs.title').toLowerCase()
            })
        }}</template>

        <Column :sortable="false" field="name" class="w-2">
            <template #header>
                <span data-testid="table-header-job-name" class="ellipsis-text">
                    {{ $t('scheduled_jobs.job_name') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'job-name-data-table-' + index">
                    {{ data.name }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="started_at">
            <template #header>
                <span
                    data-testid="table-header-last-start-time"
                    class="ellipsis-text"
                >
                    {{ $t('scheduled_jobs.last_start_time') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'last-start-time-data-table-' + index">
                    {{
                        helpers.formatDate(
                            data.started_at,
                            'DD-MMM-YYYY HH:mm:ss'
                        )
                    }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="finished_at">
            <template #header>
                <span
                    data-testid="table-header-last-finish-time"
                    class="ellipsis-text"
                >
                    {{ $t('scheduled_jobs.last_finish_time') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'last-finish-time-data-table-' + index">
                    {{
                        helpers.formatDate(
                            data.finished_at,
                            'DD-MMM-YYYY HH:mm:ss'
                        )
                    }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="failed_at">
            <template #header>
                <span
                    data-testid="table-header-last-fail-time"
                    class="ellipsis-text"
                >
                    {{ $t('scheduled_jobs.last_fail_time') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'last-fail-time-data-table-' + index">
                    {{
                        helpers.formatDate(
                            data.failed_at,
                            'DD-MMM-YYYY HH:mm:ss'
                        )
                    }}
                </span>
            </template>
        </Column>

        <Column :sortable="true" field="next_run">
            <template #header>
                <span
                    data-testid="table-header-upcoming-run-time"
                    class="ellipsis-text"
                >
                    {{ $t('scheduled_jobs.upcoming_run_time') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'upcoming-run-time-data-table-' + index">
                    {{
                        helpers.formatDate(
                            data.next_run,
                            'DD-MMM-YYYY HH:mm:ss'
                        )
                    }}
                </span>
            </template>
        </Column>

        <Column :sortable="false" field="cron" class="w-2">
            <template #header>
                <span
                    data-testid="table-header-frequency"
                    class="ellipsis-text"
                >
                    {{ $t('scheduled_jobs.frequency') }}
                </span>
            </template>
            <template #body="{ data, index }">
                <span :data-testid="'frequency-data-table-' + index">
                    {{ cronstrue.toString(data.cron_expression) }}
                </span>
            </template>
        </Column>

        <Column>
            <template #body="{ data, index }">
                <Button
                    :label="t('common.actions')"
                    icon="pi pi-chevron-down"
                    iconPos="right"
                    size="small"
                    class="p-button-outlined ml-auto flex"
                    @click="showActions($event, data)"
                    :data-testid="'actions-button-' + index"
                />
                <Menu
                    ref="menu"
                    id="overlay_menu"
                    :model="menuItems"
                    :popup="true"
                    :data-testid="'actions-menu-' + index"
                />
            </template>
        </Column>
    </BaseTable>

    <Dialog
        data-testid="job-details-dialog"
        :closable="false"
        v-model:visible="jobDetailsDialogVisible"
        :style="{ width: '60vw' }"
        modal
    >
        <template #header>
            <div
                class="flex align-items-center justify-content-between w-full pb-2"
            >
                <div
                    class="p-dialog-title"
                    data-testid="job-details-dialog-title"
                >
                    {{ $t('scheduled_jobs.execution_logs') }}
                </div>
                <Button
                    icon="pi pi-times"
                    class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                    data-testid="job-details-dialog-close-button"
                    @click="jobDetailsDialogVisible = false"
                    aria-label="Close"
                />
            </div>
        </template>

        <ScheduledJobDetailsTable :job="selectedItem" />
    </Dialog>

    <Dialog
        class="job-frequency-dialog"
        @update:visible="onShow"
        data-testid="job-frequency-dialog"
        :closable="false"
        v-model:visible="jobFrequencyDialogVisible"
        :style="{ width: '60vw' }"
        modal
        v-if="$ability.can('update scheduled jobs')"
    >
        <template #header>
            <div
                class="flex align-items-center justify-content-between w-full pb-2"
            >
                <div
                    class="p-dialog-title"
                    data-testid="job-frequency-dialog-title"
                >
                    {{ $t('scheduled_jobs.system_adjudication_frequency') }}
                </div>
                <Button
                    icon="pi pi-times"
                    class="p-dialog-header-close border-none p-button-outlined p-2 border-circle"
                    data-testid="job-frequency-dialog-close-button"
                    @click="closeJobFrequencyDialog"
                    aria-label="Close"
                />
            </div>
        </template>
        <div class="pb-3"><CronLight v-model="cron" /></div>
        <template #footer>
            <Button
                text
                :label="$t('buttons.cancel')"
                @click="closeJobFrequencyDialog"
                data-testid="cancel-button"
            />
            <Button
                :label="$t('buttons.update')"
                @click="updateJobFrequency"
                icon="pi pi-check"
                :loading="busy"
                data-testid="save-button"
            />
        </template>
    </Dialog>
</template>
<style>
.scheduled-jobs-table .ellipsis-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: inline-block;
    max-width: 100%;
}
.job-frequency-dialog-overlay {
    overflow-y: auto;
}
.job-frequency-dialog .p-dialog-content {
    overflow-y: initial !important;
}
</style>
