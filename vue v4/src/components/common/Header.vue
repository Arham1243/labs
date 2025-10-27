<script setup>
defineProps({
    hideBack: {
        type: Boolean,
        required: false
    }
});

const emit = defineEmits(['goBack']);

const goBack = () => {
    emit('goBack');
};
</script>

<template>
    <div class="flex justify-between items-center mb-2  py-2">
        <h3 class="mb-0 flex items-start gap-5">
            <Button
                data-testid="header-back-button"
                v-if="!hideBack"
                size="large"
                @click="goBack"
                icon="pi pi-chevron-left"
                variant="outlined"
            />
            <slot name="title" />
        </h3>
        <div class="d-flex">
            <slot name="actions" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.header {
    border-top: 1px solid #e2e8f0;
    border-bottom: 1px solid #e2e8f0;
}
</style>
