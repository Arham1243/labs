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
import Tab from 'primevue/tab';
import TabPanel from 'primevue/tabpanel';
import TabPanels from 'primevue/tabpanels';
import Tabs from 'primevue/tabs';
import TabList from 'primevue/tablist';

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

// TAB CLICK HANDLER PRIMEVUE 4
const handleTabClick = (tabIndex) => {
  activeTab.value = tabIndex;
};


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
    <div class="pt-6 flex justify-between items-center gap-4 custom-button-header-action edit-cancel-button">
      <div class="flex gap-6">
        <Button
            @click="router.push('/claims/adjudication')"
            class="px-12"
            icon="pi pi-chevron-left"
            outlined
            data-testid="btn-back"
        />
        <div class="flex gap-4 items-center">
          <h3 v-text="queue.name" data-testid="text-detail-name" />
          <ClaimTag
              :value="queue.status"
              class="uppercase"
              data-testid="text-details-status"
          />
        </div>
      </div>
      <div class="flex gap-4 items-center">
                <span class="p-input-icon-right">
                    <!--<i class="pi pi-calendar" />-->
                    <AdjudicationTimeFrameFilter @fetch-data="fetchData" />
                </span>
        <AdjudicationActionsButton :data="queue" />
      </div>
    </div>

    <AdjudicationCard :queueId="route.params.queueId" />

    <Tabs
        :lazy="true"
        :value="activeTab"
        data-testid="tabs-details"
    >
      <TabList class="custom-tab">
        <Tab :value="0" @click="handleTabClick(0)">
          <div
              data-testid="tab-overview"
              v-text="t('adjudication.overview')"
          />
        </Tab>
        <Tab :value="1" @click="handleTabClick(1)">
          <div
              v-text="t('adjudication.submissions')"
              data-testid="tab-submissions"
          />
        </Tab>
        <Tab :value="2" @click="handleTabClick(2)">
          <div
              v-text="t('adjudication.audit_log')"
              data-testid="tab-audit-log"
          />
        </Tab>
      </TabList>
      <TabPanels class="!p-0 pt-4">
        <TabPanel :value="0">
          <AdjudicationOverview />
        </TabPanel>
        <TabPanel :value="1">
          <AdjudicationSubmissionTable :queueId="route.params.queueId" />
        </TabPanel>
        <TabPanel :value="2">
          <AuditTable entity="queue" :entity_id="route.params.queueId" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>