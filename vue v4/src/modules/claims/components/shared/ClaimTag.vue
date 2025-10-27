<script setup>
import { computed } from 'vue';

const props = defineProps({
    value: {
        type: [String, Number],
        required: true
    },
    severity: {
        type: String
    }
});

const color = computed(() => {
    switch (props.value.toLowerCase()) {
        case 'draft':
            return 'secondary';

        case 'active':
            return 'success';

        case 'inactive':
            return 'danger';

        default:
            return 'primary';
    }
});
</script>

<template>
    <Tag :value="value" :class="`claims-tag p-tag-${severity || color}`" />
</template>
