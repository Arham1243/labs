<script setup>
import { computed } from 'vue';

import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';

const helpers = useHelpers();
const { t } = useI18n();

const props = defineProps({
    plan: {
        type: Object,
        required: true
    },
    associated: {
        type: Boolean,
        default: false
    },
    index: {
        type: Number,
        required: false
    },
    testIdPrefix: {
        type: String,
        required: false
    }
});

const additionalDetails = computed(() => {
    const details = [];
    if (props.plan.is_cancellations) details.push(t('common.cancellations'));
    if (props.plan.is_extensions) details.push(t('common.extensions'));
    if (props.plan.is_early_returns) details.push(t('common.early_returns'));
    if (props.plan.is_opt_out) details.push(t('common.opt_out'));
    if (props.plan.is_refundable) details.push(t('common.refundable'));
    if (props.plan.is_overlap) details.push(t('common.overlap'));
    return details.length > 0 ? ' • ' + details.join(' • ') : '';
});
</script>

<template>
    <div v-if="!associated">
        <span :data-testid="testIdPrefix + '-plan-bound-' + props.index">
            {{ $t('plans.' + plan.bound) }}
        </span>
        •
        <span :data-testid="testIdPrefix + '-plan-type-' + props.index">
            {{ $t('plans.' + plan.type) }}
        </span>
        <span
            :data-testid="
                testIdPrefix + '-plan-additional-details-' + props.index
            "
        >
            {{ additionalDetails }}
        </span>
    </div>
    <div>
        <span
            :data-testid="
                testIdPrefix + '-plan-effective-date-label-' + props.index
            "
        >
            {{ $t('common.effective_date') }} </span
        >:
        <span
            :data-testid="
                testIdPrefix + '-plan-effective-date-value-' + props.index
            "
        >
            {{ helpers.formatDate(plan.effective_date) }}
        </span>
        <template v-if="plan.end_date">
            •
            <span
                :data-testid="
                    testIdPrefix + '-plan-end-date-label-' + props.index
                "
            >
                {{ $t('common.end_date') }} </span
            >:
            <span
                :data-testid="
                    testIdPrefix + '-plan-end-date-value-' + props.index
                "
            >
                {{ helpers.formatDate(plan.end_date) }}
            </span>
        </template>
    </div>
</template>
