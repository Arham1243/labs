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
    <div
        :class="`p-tag ${props.status}`"
        data-testid="status-large-badge"
        class="ml-4 pa-0 flex badge-label"
    >
        <span>
            {{ $t(`invoice.beautiful_status.${props.status}`).toUpperCase() }}
        </span>
    </div>
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
    background: transparent !important;
    color: #757575 !important;
}

.unpaid {
    color: #326fd1 !important;
    background: transparent !important;
}

.overdue {
    background: transparent !important;
    color: #d9342b !important;
}

.void {
    background: transparent !important;
    color: #d9342b !important;
}

.partial_pymt {
    background: transparent !important;
    color: #d46213 !important;
}

.paid {
    background: transparent !important;
    color: #1da750 !important;
}

.over_paid {
    background: transparent !important;
    color: #432263 !important;
}

.pending {
    background: transparent !important;
    color: #c79807 !important;
}

.badge-label {
    font-size: 30px;
    font-weight: bold;
    text-align: center;
    text-transform: uppercase;
    height: fit-content;
    border: 5px solid;
}
</style>
