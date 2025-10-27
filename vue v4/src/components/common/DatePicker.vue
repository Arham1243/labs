<script setup>
import { computed, ref, watch } from 'vue';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';
import PrimeDatePicker from 'primevue/datepicker';

const globalStore = useGlobalStore();

const props = defineProps({
    modelValue: {
        type: [String, null],
        required: true
    },
    id: {
        type: String
    },
    disabled: {
        type: Boolean
    },
    showIcon: {
        type: Boolean,
        default: true
    }
});

const emit = defineEmits(['update:modelValue']);

const helpers = useHelpers();
const date = ref(props.modelValue ? helpers.getJsDate(props.modelValue) : null);

watch(date, (val) => {
    emit('update:modelValue', helpers.parseDate(val));
});

const errors = computed(() => {
    if (props.errorMessages && Array.isArray(props.errorMessages))
        return props.errorMessages;
    else if (props.errorMessages && typeof props.errorMessages == 'string')
        return [props.errorMessages];
    else if (globalStore.errors && globalStore.errors[props.id])
        return globalStore.errors[props.id];
    else return [];
});
</script>

<template>
    <div class="datepicker-wrapper">
        <span :class="props.showIcon ? 'p-input-icon-left' : ''">
            <i v-if="props.showIcon" class="pi pi-calendar" />
            <PrimeDatePicker
                showButtonBar
                :disabled="disabled"
                v-model="date"
                dateFormat="dd-M-yy"
                :placeholder="$t('common.select_date')"
                v-bind="$attrs"
            />
        </span>
        <small
            v-for="(error, index) in errors"
            :key="index"
            class="p-error block"
            :class="{ 'mb-2': index == errors.length - 1 }"
            id="text-error"
        >
            {{ error }}
        </small>
    </div>
</template>

<style lang="scss" scoped>
.datepicker-wrapper {
    position: relative;
    width: 100%;
    :deep(input) {
        width: 100%;
    }
    .p-input-icon-left :deep(input) {
        padding-left: 2.5rem !important;
    }
    :deep(.pi-calendar) {
        position: absolute;
        top: 50%;
        left: 0.75rem;
        transform: translateY(-50%);
        z-index: 10;
        color: #9ca3af !important;
    }
}
</style>
