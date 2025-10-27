<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    label: {
        type: String,
        required: true
    },
    modelValue: {
        type: [String, Number, Object],
        default: null
    },
    options: {
        type: Array,
        default: () => []
    },
    optionLabel: {
        type: String,
        default: 'label'
    },
    optionValue: {
        type: String,
        default: 'value'
    },
    disabled: {
        type: Boolean,
        default: false
    },
    showPreview: {
        type: Boolean,
        default: true
    },
    testId: {
        type: String,
        default: ''
    }
});

const emit = defineEmits(['update:modelValue', 'preview']);
const { t } = useI18n();

const selectedValue = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const canPreview = computed(() => {
    return (
        props.showPreview &&
        props.modelValue !== null &&
        props.modelValue !== undefined
    );
});

const handlePreview = () => {
    if (canPreview.value) {
        emit('preview', {
            value: props.modelValue,
            label: props.label
        });
    }
};

const dropdownTestId = computed(() => {
    return props.testId
        ? `${props.testId}-dropdown`
        : 'email-template-dropdown';
});

const previewTestId = computed(() => {
    return props.testId ? `${props.testId}-preview` : 'email-template-preview';
});
</script>

<template>
    <div class="flex flex-column align-items-start gap-3 w-full">
        <label :for="dropdownTestId">
            {{ label }}
        </label>

        <Dropdown
            :id="dropdownTestId"
            v-model="selectedValue"
            :options="options"
            :option-label="optionLabel"
            :option-value="optionValue"
            :placeholder="t('plans.select_template')"
            :disabled="disabled"
            :data-testid="dropdownTestId"
            class="w-full"
        />

        <Button
            v-if="showPreview"
            :label="t('plans.preview_template')"
            :disabled="!canPreview || disabled"
            :data-testid="previewTestId"
            text
            class="font-bolder p-0 justify-content-start"
            @click="handlePreview"
        />
    </div>
</template>
