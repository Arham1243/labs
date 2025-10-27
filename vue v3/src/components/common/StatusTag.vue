<script setup>
import { computed } from 'vue';

const props = defineProps({
    status: {
        type: String
    }
});

const color = computed(() => {
    switch (props.status) {
        case 'draft':
        case 'unconfirmed':
            return 'secondary';
        case 'confirmed':
        case 'active':
        case 'paid':
            return 'success';
        case 'inactive':
        case 'expired':
            return 'danger';
        case 'not started':
        case 'pending':
        case 'pending deletion':
        case 'pending approval':
            return 'not-started';
        default:
            return 'primary';
    }
});
</script>

<template>
    <Tag
        v-bind="$attrs"
        :value="status?.toUpperCase()"
        :class="`p-tag-${color}`"
    />
</template>
