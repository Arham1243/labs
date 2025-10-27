<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String,
        required: true
    },
    icon: {
        type: String
    }
});

const color = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'review':
        case 'draft':
        case 'not started':
            return 'secondary';

        case 'open':
        case 'approved':
        case 'active':
        case 'completed':
        case 'audited-completed':
            return 'success';

        case 'expired':
        case 'declined':
        case 'canceled':
        case 'high priority':
        case 'inactive':
        case 'audited-declined':
        case 'auto adjudication audit':
            return 'danger';

        case 'resubmitted':
        case 'audited-pending':
            return 'warning';

        default:
            return 'primary';
    }
});

const iconDefault = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'review':
            return 'pi pi-search';

        case 'not started':
            return 'pi pi-clock';

        case 'open':
        case 'approved':
        case 'active':
        case 'completed':
            return 'pi pi-check';

        case 'expired':
        case 'canceled':
        case 'high priority':
            return 'pi pi-exclamation-triangle';

        case 'declined':
            return 'pi pi-times';

        case 'resubmitted':
            return 'warning';

        default:
            return 'pi pi-eye';
    }
});
</script>

<template>
    <Tag
        :value="status?.toUpperCase()"
        :icon="icon ?? iconDefault"
        :class="`claims-status-tag p-tag-${color}`"
    />
</template>
