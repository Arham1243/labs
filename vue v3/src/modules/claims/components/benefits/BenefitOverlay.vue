<script setup>
const props = defineProps({
    benefit: Object
});
</script>

<template>
    <div>
        <h5 data-testid="label-benefit-details">
            {{ $t('expenses.benefit_details') }}
        </h5>
        <p class="p-break-word mt-2" data-testid="text-benefit-details">
            Autem esse earum. Blanditiis, quas fugit hendrerit aliquid sed
            expedita nec metus hic voluptatum libero nascetur pharetra incidunt
            inceptos sequi vehicula cumque ea quis.
        </p>
    </div>
</template>

<style scoped lang="scss"></style>
