<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
    status: {
        type: String
    }
});
</script>

<template>
    <Tag
        v-if="props.status"
        v-bind="$attrs"
        style="width: max-content"
        :value="$t(`invoice.beautiful_status.${props.status}`).toUpperCase()"
        data-testid="invoice-status-tag"
        :class="`p-tag ${props.status}`"
    />
</template>

<style lang="css" scoped>
::v-deep(.p-tag-value) {
    font-weight: bold !important;
}

/**
    * Invoice Status Colors
    * These colors are used to represent different invoice statuses.
    * Draft: The invoice has been created but has no due date
    * Unpaid: The invoice is active and has a due date and is awaiting payment
    * Overdue: The invoice is past its due date
    * Void: The invoice has been cancelled
    * Partially Paid: The invoice has been partially paid
    * Paid: The invoice has been fully paid
    * Over Paid: The invoice has been overpaid
    * Pending: The invoice is pending payment approval
    * Each status has a unique background and text color for easy identification.
    */

.draft {
    background: #dadee3;
    color: #37404c;
}

.unpaid {
    background: #abc9fb;
    color: #183462;
}

.overdue {
    background: #ffd0ce;
    color: #8c221c;
}

.void {
    background: #feddc7;
    color: #642e09;
}

.partial_pymt {
    background: #f6de95;
    color: #5e4803;
}

.paid {
    background: #caf1d8;
    color: #0e4f26;
}

.over_paid {
    background: #ead6fd;
    color: #432263;
}

.pending {
    background: #faecc3;
    color: #826306;
}
</style>
