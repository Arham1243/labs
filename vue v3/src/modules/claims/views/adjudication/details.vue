<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useAdjudicationQueueStore } from '@/modules/claims/stores/AdjudicationQueue';
import { endOfDay, startOfDay } from '@/modules/claims/utils/helper';
import { useHelpers } from '@/composables';
import ClaimTag from '@/modules/claims/components/shared/ClaimTag.vue';
import AdjudicationOverview from '@/modules/claims/components/adjudication/AdjudicationOverview.vue';
import AdjudicationSubmissionTable from '@/modules/claims/components/adjudication/AdjudicationSubmissionTable.vue';
import AdjudicationCard from '@/modules/claims/components/adjudication/AdjudicationCard.vue';
import AdjudicationActionsButton from '@/modules/claims/components/adjudication/AdjudicationActionsButton.vue';
import AuditTable from '@/components/common/AuditTable.vue';
import AdjudicationTimeFrameFilter from '@/modules/claims/components/adjudication/AdjudicationTimeFrameFilter.vue';

const route = useRoute();
const router = useRouter();
const helpers = useHelpers();
const { t } = useI18n();

const startDate = ref(null);
const endDate = ref(null);

const {
    getAdjudicationQueue,
    getQueueDashboard,
    getAdjudicationQueueSubmissions,
    currentAdjudicationQueue: queue
} = useAdjudicationQueueStore();

// Fetch the current adjudication queue
getAdjudicationQueue(route.params.queueId);

// Fetch the queue dashboard data
getQueueDashboard({
    filters: [
        {
            field: 'queue_id',
            value: route.params.queueId
        }
    ]
});

// Tabs
let tabs = ['overview', 'submissions', 'audit'];
let activeTab = ref(
    route.query.tab ? tabs.findIndex((tab) => tab === route.query.tab) : 0
);

watch(
    () => activeTab.value,
    () => {
        router.push(`?tab=${tabs[activeTab.value]}`);
    }
);

// Fetch dashboard data and queue submissions data with current dates
const fetchData = ({ startDate: customStart, endDate: customEnd }) => {
    startDate.value = customStart ? startOfDay(new Date(customStart)) : null;
    endDate.value = customEnd ? endOfDay(new Date(customEnd)) : null;

    if (!startDate.value || !endDate.value) {
        // Fetch the queue submissions data
        getAdjudicationQueueSubmissions(
            {
                filters: [
                    {
                        field: 'queue_id',
                        value: route.params.queueId
                    }
                ]
            },
            true
        );

        // If no dates are selected, fetch the default dashboard
        return getQueueDashboard(
            {
                filters: [
                    {
                        field: 'queue_id',
                        value: route.params.queueId
                    }
                ]
            },
            true
        );
    }

    // If dates are selected, fetch the dashboard with date filters
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
                },
                {
                    field: 'queue_id',
                    value: route.params.queueId
                }
            ]
        },
        true
    );

    getAdjudicationQueueSubmissions(
        {
            filters: [
                {
                    field: 'queue_id',
                    value: route.params.queueId
                },
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
</script>
<template>
    <div v-if="queue">
        <div class="pt-3 flex justify-content-between">
            <div class="flex gap-3">
                <Button
                    @click="router.push('/claims/adjudication')"
                    class="px-4"
                    icon="pi pi-chevron-left"
                    outlined
                    data-testid="btn-back"
                />
                <div class="flex gap-3 align-items-center">
                    <h3 v-text="queue.name" data-testid="text-detail-name" />
                    <ClaimTag
                        :value="queue.status"
                        class="uppercase"
                        data-testid="text-details-status"
                    />
                </div>
            </div>
            <div class="flex gap-3 align-items-center">
                <span class="p-input-icon-right">
                    <i class="pi pi-calendar" />
                    <AdjudicationTimeFrameFilter @fetch-data="fetchData" />
                </span>
                <AdjudicationActionsButton :data="queue" />
            </div>
        </div>

        <AdjudicationCard :queueId="route.params.queueId" />

        <TabView
            :lazy="true"
            v-model:activeIndex="activeTab"
            data-testid="tabs-details"
        >
            <TabPanel>
                <template #header>
                    <div
                        data-testid="tab-overview"
                        v-text="t('adjudication.overview')"
                    />
                </template>
                <AdjudicationOverview />
            </TabPanel>

            <TabPanel>
                <template #header>
                    <div
                        v-text="t('adjudication.submissions')"
                        data-testid="tab-submissions"
                    />
                </template>
                <AdjudicationSubmissionTable :queueId="route.params.queueId" />
            </TabPanel>

            <TabPanel>
                <template #header>
                    <div
                        v-text="t('adjudication.audit_log')"
                        data-testid="tab-audit-log"
                    />
                </template>
                <AuditTable entity="queue" :entity_id="route.params.queueId" />
            </TabPanel>
        </TabView>
    </div>
</template>
