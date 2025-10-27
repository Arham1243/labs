<script setup>
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { onMounted } from 'vue';

defineProps({
    plan: {
        type: Object,
        required: true
    }
});

const { formatValue, formatEndDateDisplay, initialize } = useDateFormatter();
const helpers = useHelpers();

onMounted(() => {
    initialize();
});
</script>
<template>
    <h5 class="mb-8">Plan Associated to:</h5>
    <div
        class="mt-2 border-solid border-2 border-gray-300 p-6"
        style="border-radius: 10px"
        data-testid="plan-details-container"
    >
        <Tag
            value="DEFAULT PLAN"
            class="mb-4 custom-tag"
        />

        <h5 data-testid="business-unit-name">
            {{ helpers.getLocaleValue(plan?.business_unit?.name) }}
        </h5>
        <h4 class="mb-2 mt-2 pt-0 p-break-all" data-testid="plan-name">
            {{ helpers.getLocaleValue(plan?.name) }}
        </h4>
        <div class="text-base text-gray-600 mb-2" data-testid="plan-details">
            {{ $t('plans.' + plan.bound) }} •
            {{ $t('plans.' + plan.type) }}
            {{
                plan.is_cancellations ? ' • ' + $t('common.cancellations') : ''
            }}
            {{ plan.is_extensions ? ' • ' + $t('common.extensions') : '' }}
            {{
                plan.is_early_returns ? ' • ' + $t('common.early_returns') : ''
            }}
            {{ plan.is_opt_out ? ' • ' + $t('common.opt_out') : '' }}
            {{ plan.is_refundable ? ' • ' + $t('common.refundable') : '' }}
            {{ plan.is_overlap ? ' • ' + $t('common.overlap') : '' }}
        </div>
        <div class="text-base text-gray-600 pb-0" data-testid="plan-dates">
            {{ $t('common.effective_date') }}:
            {{
                formatValue(plan.effective_date, {
                    type: 'date',
                    format: 'long'
                })
            }}
            <template v-if="plan.end_date"
                >• {{ $t('common.end_date') }}:
                {{ formatEndDateDisplay(plan.end_date) }}
            </template>
        </div>
    </div>
</template>
