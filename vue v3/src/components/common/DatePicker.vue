<script setup>
import { computed, ref, watch } from 'vue';
import { useGlobalStore } from '@/stores';
import { useHelpers } from '@/composables';

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
    <span class="p-input-icon-left">
        <i class="pi pi-calendar" />
        <Calendar
            showButtonBar
            :disabled="disabled"
            v-model="date"
            dateFormat="dd-M-yy"
            v-bind="$attrs"
            :placeholder="$t('common.select_date')"
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
</template>

<style lang="scss" scoped></style>
