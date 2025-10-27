<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: Object,
        default: () => ({})
    },
    templateOptions: {
        type: Array,
        default: () => []
    },
    isNew: {
        type: Boolean,
        default: false
    },
    editorHeight: {
        type: String,
        default: '220px'
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const emit = defineEmits([
    'update:modelValue',
    'template-changed',
    'content-changed'
]);
const { t } = useI18n();
const selectedTemplate = computed({
    get: () => props.modelValue?.templateId || null,
    set: (value) => {
        const updatedValue = {
            ...props.modelValue,
            templateId: value
        };

        if (value !== props.modelValue?.templateId) {
            emit('template-changed', {
                templateId: value,
                previousTemplateId: props.modelValue?.templateId
            });
        }

        emit('update:modelValue', updatedValue);
    }
});

const editorContent = computed({
    get: () => props.modelValue?.content || '',
    set: (value) => {
        const updatedValue = {
            ...props.modelValue,
            content: value
        };

        emit('content-changed', {
            content: value,
            templateId: props.modelValue?.templateId
        });

        emit('update:modelValue', updatedValue);
    }
});

const editorStyle = computed(() => `height: ${props.editorHeight}`);
</script>

<template>
    <div class="declaration-text-editor">
        <div class="mb-4">
            <Select
                id="declaration-template-dropdown"
                v-model="selectedTemplate"
                :options="templateOptions"
                option-label="name"
                option-value="id"
                :placeholder="t('plans.select_template')"
                :disabled="disabled"
                class="w-full"
                data-testid="declaration-template-dropdown"
            />
        </div>

        <div class="mb-4">
            <Editor
                id="declaration-content-editor"
                v-model="editorContent"
                :editor-style="editorStyle"
                :disabled="disabled"
                data-testid="declaration-content-editor"
            >
            </Editor>
        </div>
    </div>
</template>
