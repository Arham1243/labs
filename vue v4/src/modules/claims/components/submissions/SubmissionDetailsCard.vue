<script setup>
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHelpers } from '@/composables';
import { useRoute, useRouter } from 'vue-router';
import { useExpenseStore } from '@/modules/claims/stores/Expense.js';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { formatSubmissionSource } from '../../utils/helper';
import {
    createExpenseCols,
    createExpenseTotalsCols
} from '@/modules/claims/config/expenses.js';
import { auditStatus } from '@/config';
import { expenseComponents } from '@/modules/claims/config/filter.js';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import ActivityViewer from '@/components/ActivityViewer.vue';
import AdjudicationConfirmDialog from '@/modules/claims/components/adjudication/AdjudicationConfirmDialog.vue';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const helpers = useHelpers();

const { currentSubmission } = useSubmissionStore();
const { currentExpenses, searchExpenses } = useExpenseStore();

const showTable = ref(true);
const showConfirmDialog = ref(false);
const activeTabIndex = ref(0);
const auditStatusMode = ref();
const expenseColumns = createExpenseCols(t);
const expenseColumnsTotal = createExpenseTotalsCols(t);

const handleTabClick = (tabIndex) => {
    const event = { index: tabIndex };
    activeTabIndex.value = event.index;
};

const getColumns = (type) => {
    return expenseColumns[type]?.() || [];
};

const getColumnsTotal = () => {
    const valueMap = {
        amount_claimed: currentSubmission?.value?.amount_claimed,
        amount_approved: currentSubmission?.value?.amount_approved,
        diagnosis: t('expenses.total_expense_column_label', {
            total_expense: currentExpenses?.value?.length
        })
    };

    return expenseColumnsTotal.map((col) => ({
        ...col,
        ...(valueMap[col.label] !== undefined && { field: valueMap[col.label] })
    }));
};

const handleRowSelect = (event) => {
    if (
        !event.originalEvent.target?.classList?.contains('p-checkbox-box') &&
        !event.originalEvent.target?.parentElement?.classList?.contains(
            'p-checkbox-icon'
        ) &&
        !event.originalEvent.target?.classList?.contains('p-checkbox-icon')
    ) {
        router.push(
            `/claims/submissions/` +
                route.params.submissionId +
                `/expenses/${event.data.id}/client/` +
                route.params.clientId
        );
    }
};

// Watch for tab change
watch(activeTabIndex, (newVal) => {
    if (newVal === 1) {
        // Only set query when activity tab is selected
        router.replace({
            query: {
                ...route.query,
                module: 'submission',
                moduleId: currentSubmission.value.id
            }
        });
    } else {
        // Optional: clean up module/moduleId from query when leaving Activity tab
        const { module, moduleId, tab, ...rest } = route.query;
        router.replace({
            query: rest
        });
    }
});

onMounted(() => {
    const { module, moduleId } = route.query;

    if (module && moduleId) {
        activeTabIndex.value = 1; // Activities tab
    }
});
</script>

<template>
    <Card>
        <template #content>
            <div>
                <div class="flex items-start gap-2">
                  <Button
                      text
                      :icon="
                                'pi ' +
                                (showTable
                                    ? 'pi-chevron-down'
                                    : 'pi-chevron-right')
                            "
                      @click="showTable = !showTable"
                      data-testid="btn-toggle-expenses-table"
                  />
                  <div>
                    <h5 class="mb-2">
                                <span data-testid="text-submission-number">
                                    {{ $t('submissions.submission_id') }}
                                    {{ currentSubmission.ref_number }}
                                </span>

                      <span
                          v-if="currentSubmission.claim_id === ''"
                          class="font-normal"
                      >
                                    ({{ $t('submissions.not_attached') }})
                                </span>

                      <span
                          v-else
                          class="font-normal ml-1 cursor-pointer"
                          @click="
                                        router.push({
                                            name: 'Claim Details',
                                            params: {
                                                claimId:
                                                    currentSubmission.claim_id,
                                                clientId: route.params.clientId
                                            }
                                        })
                                    "
                      >
                                    (<span class="underline"
                      >Claim:
                                        {{
                          currentSubmission.claim.ref_number
                        }}</span
                      >)
                                </span>

                      <span class="ml-2">
                                    <ClaimStatusTag
                                        :status="currentSubmission.status"
                                        icon="pi pi-search"
                                        data-testid="tag-submission-status"
                                    />
                                </span>

                      <span
                          class="ml-2"
                          v-if="currentSubmission.queue"
                      >
                                    <ClaimStatusTag
                                        status="auto adjudication audit"
                                        icon="pi pi-flag-fill"
                                        data-testid="tag-submission-high-priority-status"
                                    />
                                </span>
                    </h5>
                    <div
                        class="flex justify-between gap-2"
                        data-testid="text-submission-receiveDate-source"
                    >
                      {{ $t('submissions.received_on') }}
                      {{
                        helpers.formatDate(
                            currentSubmission.created_at,
                            'MMM DD, YYYY'
                        )
                      }}
                      via
                      {{
                        formatSubmissionSource(
                            currentSubmission.source
                        )
                      }}
                    </div>
                    <div
                        class="flex justify-between gap-2 mt-2 underline cursor-pointer"
                        data-testid="text-submission-receiveDate-source"
                    >
                      {{ $t('submissions.beneficiary_name') }}
                    </div>
                  </div>
                </div>

                <div
                    class="flex justify-between items-center bg-gray-100 rounded m-4 p-3"
                    v-if="
                        currentSubmission.queue?.audit_status ===
                        auditStatus.audited_pending
                    "
                >
                    <h5 class="flex items-center gap-2">
                        <svg
                            width="20"
                            height="21"
                            viewBox="0 0 20 21"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            data-testid="icon-claim-recommendation"
                        >
                            <path
                                d="M15.834 8.00065L16.8757 5.70898L19.1673 4.66732L16.8757 3.62565L15.834 1.33398L14.7923 3.62565L12.5007 4.66732L14.7923 5.70898L15.834 8.00065ZM9.58398 8.41732L7.50065 3.83398L5.41732 8.41732L0.833984 10.5007L5.41732 12.584L7.50065 17.1673L9.58398 12.584L14.1673 10.5007L9.58398 8.41732ZM15.834 13.0007L14.7923 15.2923L12.5007 16.334L14.7923 17.3757L15.834 19.6673L16.8757 17.3757L19.1673 16.334L16.8757 15.2923L15.834 13.0007Z"
                                fill="#212121"
                            />
                        </svg>
                        {{
                            $t('adjudication.queue_assessed', {
                                queueName: currentSubmission.queue.name
                            })
                        }}
                    </h5>

                    <div
                        class="flex justify-between gap-2 mt-2 cursor-pointer"
                    >
                        <Button
                            class="cursor-pointer border-surface-0 dark:border-surface-900 pl-20 pr-20 bg-green-500"
                            :label="$t('adjudication.agree_with_assessment')"
                            icon="pi pi-check"
                            iconPos="left"
                            data-testid="btn-agree-assess-queue-submission"
                            @click="
                                () => {
                                    showConfirmDialog = true;
                                    auditStatusMode = 'audited_completed';
                                }
                            "
                        />
                        <Button
                            class="cursor-pointer border-surface-0 dark:border-surface-900 pl-20 pr-20 bg-red-500"
                            :label="$t('adjudication.disagree_with_assessment')"
                            icon="pi pi-times"
                            iconPos="left"
                            data-testid="btn-disagree-assess-queue-submission"
                            @click="
                                () => {
                                    showConfirmDialog = true;
                                    auditStatusMode = 'audited_declined';
                                }
                            "
                        />
                    </div>

                    <AdjudicationConfirmDialog
                        v-model:visible="showConfirmDialog"
                        :mode="auditStatusMode"
                        :clientId="route.params.clientId"
                    />
                </div>

                <Tabs
                    v-if="showTable"
                    :lazy="true"
                    :value="activeTabIndex"
                    class="mt-5"
                    data-testid="tabview-expenses-documents"
                >
                    <TabList>
                        <Tab :value="0" @click="handleTabClick(0)">
                            <i class="pi pi-list" />
                            {{ $t('expenses.title') }}
                        </Tab>
                        <Tab :value="1" @click="handleTabClick(1)">
                            <i class="pi pi-folder-open" />
                            {{ $t('activities.title') }}
                        </Tab>
                        <Tab :value="2" @click="handleTabClick(2)">
                            <i class="pi pi-history" />
                            {{ $t('logs.title') }}
                        </Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel :value="0">
                            <ClaimBaseTable
                                :payload="[
                                {
                                    field: 'submission_id',
                                    value: currentSubmission.id
                                }
                            ]"
                                :storeAction="searchExpenses"
                                :columns="getColumns('regularExpense')"
                                :columnsTotal="getColumnsTotal()"
                                :onRowSelectAction="handleRowSelect"
                                :module="t('expenses.title')"
                                :filterComponents="expenseComponents"
                            />
                        </TabPanel>
                        <TabPanel :value="1">
                            <ActivityViewer :clientId="route.params.clientId" />
                        </TabPanel>
                        <TabPanel :value="2">
                            <!-- Logs content placeholder -->
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </div>
        </template>
    </Card>
</template>
