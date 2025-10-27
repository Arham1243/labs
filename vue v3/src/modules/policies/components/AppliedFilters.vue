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
            <div
                class="p-chips p-component p-inputwrapper p-inputwrapper-filled filters-chips"
            >
                <ul class="p-inputtext p-chips-multiple-container">
                    <li class="p-chips-token">
                        <div>
                            <span>
                                {{ $t('policies.smart_filter.smart_filter') }}:
                                <span
                                    v-tooltip.top="
                                        smartFilterStore.selectedSavedFilter
                                            .name
                                    "
                                >
                                    {{
                                        lodash.truncate(
                                            smartFilterStore.selectedSavedFilter
                                                .name,
                                            { length: truncateLength }
                                        )
                                    }}
                                </span>
                            </span>
                        </div>
                        <span
                            class="p-chips-token-icon pi pi-times-circle"
                            @click="clearFilters"
                        ></span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.applied-filters {
    .filters-chips :deep(ul.p-inputtext.p-chips-multiple-container) {
        background: none !important;
        border: none !important;
        padding: 0 !important;
        box-shadow: none !important;
        width: fit-content !important;
    }

    .filters-chips
        :deep(.p-chips.p-component.p-inputwrapper.p-inputwrapper-filled) {
        width: fit-content !important;
        display: inline-flex;
    }

    .filters-chips :deep(li.p-chips-input-token) {
        display: none !important;
    }

    .p-chips-token {
        display: inline-flex;
        align-items: center;
    }

    .p-chips-token-icon {
        margin-left: 0.5rem;
        cursor: pointer;
    }

    .saved-filter-display {
        .filters-chips {
            width: fit-content !important;
        }
    }
}
</style>
