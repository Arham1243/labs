<script setup>
import { useAdjudicationQueueStore } from '@/modules/claims/stores/AdjudicationQueue';
import { useHelpers } from '@/composables';

const props = defineProps({
    queueId: { type: Number }
});

const helpers = useHelpers();
const { queueDashboardData } = useAdjudicationQueueStore();

let report = [
    { label: 'Total Submissions Processed', key: 'total_processed' },
    {
        label: 'Average Submission Amount',
        key: 'average_amount_claimed',
        type: 'amount'
    },
    {
        label: 'Submissions Audited',
        key: 'total_audited'
    },
    { label: 'Audits Remaining', key: 'audited_and_pending' },
    {
        label: 'Accuracy',
        percent: 30,
        key: 'accuracy_percentage',
        type: 'percent'
    }
];
</script>

<template>
    <div v-if="queueDashboardData" class="flex gap-3 mt-5 mb-3">
        <div
            v-for="{ label, key, percent, type } in report"
            :key="label"
            class="card flex-1 mb-0"
        >
            <b
                v-text="label"
                :data-testid="`card-${label
                    .split(' ')
                    .join('-')
                    .toLowerCase()}-label`"
            />
            <div class="flex justify-between items-baseline">
                <h2
                    class="mt-3"
                    :data-testid="`card-${label
                        .split(' ')
                        .join('-')
                        .toLowerCase()}-value`"
                >
                    {{
                        type === 'amount'
                            ? helpers.moneyFormat(queueDashboardData[key])
                            : type === 'percent'
                              ? queueDashboardData[key] + '%'
                              : queueDashboardData[key]
                    }}
                </h2>
                <!--                <span-->
                <!--                    v-if="percent"-->
                <!--                    class="text-green-600"-->
                <!--                    :data-testid="`card-${label-->
                <!--                        .split(' ')-->
                <!--                        .join('-')-->
                <!--                        .toLowerCase()}-percent`"-->
                <!--                >+{{ percent }}% <i class="pi pi-arrow-up text-sm"-->
                <!--                /></span>-->
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
