<script setup>
defineProps({
    show: {
        type: Boolean,
        default: false
    },
    tooltipText: {
        type: String,
        default: 'common.max_amount_warning'
    }
});
</script>

<template>
    <div v-if="show">
        <i
            class="pi pi-info-circle text-orange-400 cursor-pointer"
            v-tooltip.right="$t(tooltipText)"
        >
        </i>
    </div>
</template>
