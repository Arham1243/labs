<script setup>
import lodash from 'lodash';
import { computed } from 'vue';

const emit = defineEmits(['search', 'update:modelValue']);

const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    }
});

const inputValue = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        handleSearch(value);
        emit('update:modelValue', value ? value.trim() : '');
    }
});

const handleSearch = lodash.debounce(() => {
    emit('search', inputValue);
}, 600);
</script>

<template>
    <InputField
        type="text"
        variant="text"
        icon-before="pi pi-search"
        :icon-after="inputValue ? 'pi pi-times' : 'pi'"
        v-model="inputValue"
        :placeholder="placeholder || 'Search'"
        @input="handleSearch"
        @iconAfterClick="inputValue = ''"
    />
</template>

<style lang="scss" scoped></style>
