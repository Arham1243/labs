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
    <div class="search-input-wrapper">
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
    </div>
</template>

<style lang="scss" scoped>
.search-input-wrapper {
    position: relative;
    width: 100%;
    //margin-bottom: 0.75rem;

    // Style the input field itself
    :deep(input) {
        width: 100% !important;
        padding-left: 2.5rem !important;
    }

    // Style the icon
    :deep(.pi-search) {
        position: absolute;
        top: 50%;
        left: 0.75rem;
        transform: translateY(-50%);
        z-index: 1;
        color: #9ca3af !important;
    }

    // Style the clear icon
    :deep(.pi-times) {
        position: absolute;
        top: 50%;
        right: 0.75rem;
        transform: translateY(-50%);
        z-index: 1;
        cursor: pointer;
        color: #9ca3af !important;
    }
}
</style>
