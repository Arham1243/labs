<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import DeclarationText from '@/modules/plans/components/plans/DeclarationText.vue';
import { useEditState } from '@/modules/plans/composables/useEditState';
import lodash from 'lodash';

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
    componentId: {
        type: String,
        required: true
    },
    isReview: {
        type: Boolean,
        default: false
    },
    editorHeight: {
        type: String,
        default: '220px'
    }
});

const route = useRoute();
const planStore = usePlanStore();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const emit = defineEmits([
    'update:modelValue',
    'template-changed',
    'content-changed',
    'view-full-content',
    'reloadDeclarationText',
    'reloadReviewDeclarationText'
]);
const { t } = useI18n();

const busy = ref(false);
const isEditing = ref(false);
const item = ref(props.modelValue);
const itemToUpdate = ref({});

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const isNotChanged = computed(() => {
    return lodash.isEqual(item.value, itemToUpdate.value);
});

const handleEdit = () => {
    itemToUpdate.value = lodash.cloneDeep(item.value);
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    if (props.isReview) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        if (!isNotChanged.value) {
            handleUnsavedChanges(() => {
                isEditing.value = false;
                clearActiveComponent();
            });
        } else {
            isEditing.value = false;
            clearActiveComponent();
        }
    }
};

const save = async () => {
    busy.value = true;
    try {
        await planStore.updatePlan(
            itemToUpdate.value.id,
            planStore.transferPayload(itemToUpdate.value)
        );
        isEditing.value = false;
        clearActiveComponent();
        if (route.name === 'Declaration Text Details') {
            emit('reloadDeclarationText');
        } else {
            emit('reloadReviewDeclarationText');
        }
    } catch (error) {
        console.error('Error saving:', error);
    } finally {
        busy.value = false;
    }
};

const updateItemToUpdate = (key, value) => {
    itemToUpdate.value = {
        ...itemToUpdate.value,
        [key]: value
    };
};

const declarationData = computed({
    get: () => {
        const source = isEditing.value ? itemToUpdate.value : props.modelValue;
        return (
            source?.declaration || {
                templateId: null,
                content: ''
            }
        );
    },
    set: (value) => {
        if (isEditing.value) {
            updateItemToUpdate('declaration', value);
        } else {
            emit('update:modelValue', {
                ...props.modelValue,
                declaration: value
            });
        }
    }
});

const updateModelValue = (key, value) => {
    emit('update:modelValue', {
        ...props.modelValue,
        [key]: value
    });
};

const handleTemplateChanged = (templateData) => {
    emit('template-changed', templateData);
};

const handleContentChanged = (contentData) => {
    emit('content-changed', contentData);
};

const getTemplateName = (templateId) => {
    if (!templateId || !props.templateOptions) return 'No template selected';
    const template = props.templateOptions.find((t) => t.id === templateId);
    return template ? template.name : 'Template not found';
};

const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
};

const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    const cleanText = stripHtml(text);
    return cleanText.length > maxLength
        ? cleanText.substring(0, maxLength) + '...'
        : cleanText;
};
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2">
            {{ $t('plans.declaration_text') }}
        </h5>
        <div v-if="isEditing">
            <Button
                label="Cancel"
                class="p-button-outlined mr-2"
                @click="handleCancel"
                data-testid="cancel-button"
            />
            <Button
                label="Save"
                :loading="busy"
                :disabled="isNotChanged"
                @click="save"
                data-testid="save-button"
            />
        </div>
        <Button
            v-else
            size="small"
            text
            class="px-2 py-1"
            label="Edit"
            icon="pi pi-pencil"
            :disabled="isEditDisabled"
            @click="handleEdit"
            data-testid="edit-button"
        />
    </div>

    <div v-if="isEditing" class="mt-4">
        <DeclarationText
            v-model="declarationData"
            :template-options="templateOptions"
            :is-new="isNew"
            :editor-height="editorHeight"
            @template-changed="handleTemplateChanged"
            @content-changed="handleContentChanged"
        />
    </div>

    <div v-else class="mt-4">
        <div class="grid">
            <div class="col-12">
                <div class="flex flex-column gap-3">
                    <div
                        v-if="declarationData.content"
                        class="flex justify-content-between align-items-center py-2"
                    >
                        <span class="text-600">Content Statistics</span>
                        <div class="flex align-items-center gap-3">
                            <small class="text-500">
                                {{ stripHtml(declarationData.content).length }}
                                characters
                            </small>
                            <small class="text-500">
                                {{
                                    stripHtml(declarationData.content)
                                        .split(/\s+/)
                                        .filter((word) => word.length > 0)
                                        .length
                                }}
                                words
                            </small>
                        </div>
                    </div>
                </div>
                <div
                    v-if="
                        !declarationData.content && !declarationData.templateId
                    "
                    class="text-center py-6 mt-4"
                >
                    <i class="pi pi-file-edit text-4xl text-300 mb-3"></i>
                    <p class="text-600 m-0">No declaration text</p>
                </div>
            </div>
        </div>
    </div>
</template>
