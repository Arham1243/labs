<script setup>
defineProps({
    testId: {
        type: String,
        required: true
    }
});
</script>

<template>
    <span :data-testid="testId">
        <slot></slot>
    </span>
</template>
