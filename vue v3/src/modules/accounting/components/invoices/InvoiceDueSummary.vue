<script setup>
import { useHelpers } from '@/composables';

const helpers = useHelpers();

const props = defineProps({
    summary: Object
});
</script>

<template>
    <div class="flex" v-if="summary" data-testid="invoice-due-summary">
        <div
            v-for="(data, index) in summary"
            :key="index"
            class="flex-1 font-bold border-round"
            :class="[
                index !== 0 ? 'pl-2' : '',
                index !== summary.length - 1 ? 'pr-2' : ''
            ]"
        >
            <div class="card p-3">
                <span
                    class="font-bold text-lg text-gray-600"
                    :data-testid="`amount-due-range-label-${index}`"
                    >{{ data.title }}</span
                >
                <div
                    class="flex justify-content-between align-items-start mt-3"
                >
                    <div class="w-12">
                        <span
                            class="text-4xl font-bold text-900"
                            :data-testid="`amount-due-value-${index}`"
                        >
                            {{ helpers.moneyFormat(data.amount) }}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
