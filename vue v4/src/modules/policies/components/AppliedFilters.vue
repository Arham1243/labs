<script setup>
import { computed, onUnmounted } from 'vue';
import lodash from 'lodash';
import { useSmartFilterStore } from '@/modules/policies/stores/SmartFilter';

const props = defineProps({
    truncateLength: {
        type: Number,
        default: 30
    }
});

const emits = defineEmits(['cleared']);

const smartFilterStore = useSmartFilterStore();

const hasFilters = computed(() => {
    return (
        (smartFilterStore.selectedFilters &&
            smartFilterStore.selectedFilters.length > 0) ||
        smartFilterStore.selectedSavedFilter
    );
});

const clearFilters = () => {
    smartFilterStore.clearFilters();
    emits('cleared');
};

onUnmounted(() => {
    clearFilters();
});
</script>

<template>
    <div v-if="hasFilters" class="applied-filters">
        <div
            v-if="smartFilterStore.selectedSavedFilter"
            class="saved-filter-display"
        >
            <Chip :label="`${$t('policies.smart_filter.smart_filter')} : ${lodash.truncate(smartFilterStore.selectedSavedFilter.name,{ length: truncateLength })}`"
                  v-tooltip.top="smartFilterStore.selectedSavedFilter.name"
                  icon="pi pi-filter"
                  removable
                  @remove="clearFilters"
            />
        </div>
    </div>
</template>