<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import lodash from 'lodash';
import { useCodeSetStore } from '../../stores/CodeSet';
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import CodeGroupDetailsForm from './forms/CodeGroupDetailsForm.vue';
import { useEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    data: {
        type: Object,
        required: true
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
    }
});

const { formatValue, initialize } = useDateFormatter();
const helpers = useHelpers();
const codeSetStore = useCodeSetStore();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const busy = ref(false);
const loading = ref(false);
const isEditing = ref(false);
const discardDialog = ref(false);
const item = ref({});
const itemToUpdate = ref({});

onMounted(() => {
    setItem();
    registerCancelCallback(props.componentId, handleCancel);
    initialize();
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

const setItem = () => {
    if (props.data) item.value = lodash.cloneDeep(props.data);
};

const emit = defineEmits(['update:data', 'reloadItem']);

const processData = (data) => {
    codeSetStore.setCurrentCodeGroup(data);
    item.value = lodash.cloneDeep(data);
    itemToUpdate.value = lodash.cloneDeep(item.value);
    emit('update:data', itemToUpdate.value);
    emit('reloadItem');
};

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
    try {
        busy.value = true;
        itemToUpdate.value.service_code_set_id =
            itemToUpdate.value.service_code_set?.id || null;
        const res = await codeSetStore.updateCodeGroup(
            itemToUpdate.value.id,
            itemToUpdate.value
        );
        processData(res.data);
        isEditing.value = false;
        clearActiveComponent();
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else>
        <div class="flex justify-between items-center edit-cancel-button">
            <h5 class="mb-2" data-testid="page-title">Code Group Details</h5>
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
                v-else-if="$ability.can('update service code groups')"
                size="small"
                text
                class="px-2 py-1 p-button-outlined"
                label="Edit"
                icon="pi pi-pencil"
                :disabled="isEditDisabled"
                @click="handleEdit"
                data-testid="edit-button"
            />
        </div>

        <CodeGroupDetailsForm
            v-if="isEditing"
            :isNew="isNew"
            v-model="itemToUpdate"
            data-testid="code-group-details-form"
        />

        <div v-else class="grid grid-cols-12 mt-1">
            <div
                data-testid="name-label"
                class="sm:col-span-6 md:col-span-2 text-sm font-semibold py-1"
            >
                Name:
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm py-1 p-break-word">
                {{ helpers.getLocaleValue(item.name) }}
            </div>
            <div
                data-testid="description-label"
                class="sm:col-span-6 md:col-span-2 text-sm font-semibold py-1"
            >
                Description:
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm py-1 p-break-word">
                {{ helpers.getLocaleValue(item.description) }}
            </div>
            <div
                data-testid="code-set-label"
                class="sm:col-span-6 md:col-span-2 text-sm font-semibold py-1"
            >
                Code Set:
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm py-1 p-break-word">
                {{ helpers.getLocaleValue(item.service_code_set?.name) }}
            </div>
            <div
                data-testid="effective-date-label"
                class="sm:col-span-6 md:col-span-2 text-sm font-semibold py-1"
            >
                Effective Date:
            </div>
            <div class="sm:col-span-6 md:col-span-10 text-sm py-1">
                {{
                    formatValue(item.effective_date, {
                        type: 'date',
                        format: 'long'
                    })
                }}
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>
