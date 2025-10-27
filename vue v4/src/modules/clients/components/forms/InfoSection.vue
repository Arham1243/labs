<script setup>
import { defineProps } from 'vue';
const props = defineProps({
    info: {
        type: Array
    },
    group: {
        type: String
    }
});
</script>
<template>
    <div class="info-box" :data-testid="`info-section-${props.group}`">
        <div
            class="text-lg font-bold mb-12 pb-1"
            :data-testid="`info-section-${props.group}-name`"
        >
            {{ props.group }}
        </div>
        <div
            class="flex gap-12 mt-2"
            v-for="(info, index) in props.info"
            :key="index"
            :data-testid="`info-item-${index}`"
        >
            <div
                style="font-size: 0.9rem"
                class="col-span-4 px-0 font-bold py-0"
                v-if="info.field_name"
                :data-testid="`info-field-name-${index}`"
            >
                {{ info.field_name }}
            </div>
            <div
                style="font-size: 0.9rem"
                :class="[
                    'col-span-8 px-0 w-full py-0 p-break-word ',
                    info.field_type === 'date'
                        ? `font-bold ${index > 1 ? 'mt-3' : ''}`
                        : 'font-semibold text-gray-600'
                ]"
                :data-testid="`info-field-value-${index}`"
            >
                {{ info.field_value }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.info-box {
    background: #fff;
    border: 1px solid #cccccc6b;
    padding: 1.25rem;
    box-shadow: 0px 5px 15px 1px #00000012;
    margin-bottom: 1.25rem;
    border-radius: 0.65rem;
    overflow: hidden;
}

.heading {
    font-weight: bold;
    margin-bottom: 10px;
}

.info {
    font-size: 16px;
    color: #666;
}
</style>
