<script setup>
import { useHelpers } from '@/composables';

const helpers = useHelpers();

const props = defineProps({
    summary: Object
});
</script>

<template>
    <div
        v-if="summary"
        class="grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12"
        data-testid="invoice-due-summary"
    >
        <div
            v-for="(data, index) in summary"
            :key="index"
            class="col-span-12 md:col-span-6 xl:col-span-3 bg-white dark:bg-surface-900 p-4 rounded-lg shadow-sm"
        >
            <span
                class="font-semibold text-lg text-gray-500"
                :data-testid="`amount-due-range-label-${index}`"
            >
                {{ data.title }}
            </span>
            <div class="mt-3">
                <span
                    class="text-[1.85rem] font-bold text-surface-900 dark:text-surface-0 break-words block"
                    :data-testid="`amount-due-value-${index}`"
                >
                    {{ helpers.moneyFormat(data.amount) }}
                </span>
            </div>
        </div>
    </div>
</template>
