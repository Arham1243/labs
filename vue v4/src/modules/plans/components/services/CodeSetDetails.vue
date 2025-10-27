<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import lodash from 'lodash';
import { useCodeSetStore } from '@/modules/plans/stores/CodeSet';
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import CodeSetDetailsForm from '@/modules/plans/components/services/forms/CodeSetDetailsForm.vue';
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
const isEditing = ref(false);
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
    codeSetStore.setCurrentCodeSet(data);
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
        const res = await codeSetStore.updateCodeSet(
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
    <div>
        <div class="flex justify-between items-center mb-2 edit-cancel-button">
            <h5 data-testid="page-title">Code Set Details</h5>
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
                v-else-if="$ability.can('update service code sets')"
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
        <CodeSetDetailsForm
            v-if="isEditing"
            :isNew="isNew"
            v-model="itemToUpdate"
            data-testid="code-set-details-form"
        />

        <div v-else class="grid grid-cols-12 mt-1">
            <div
                data-testid="code-set-name-label"
                class="sm:col-span-6 md:col-span-3 text-sm font-semibold py-1"
            >
                Code Set Name:
            </div>
            <div class="sm:col-span-6 md:col-span-9 text-sm py-1 p-break-word">
                {{ helpers.getLocaleValue(item.name) }}
            </div>
            <div
                data-testid="description-label"
                class="sm:col-span-6 md:col-span-3 text-sm font-semibold py-1"
            >
                Description:
            </div>
            <div class="sm:col-span-6 md:col-span-9 text-sm py-1 p-break-word">
                {{ helpers.getLocaleValue(item.description) }}
            </div>
            <div
                data-testid="effective-date-label"
                class="sm:col-span-6 md:col-span-3 text-sm font-semibold py-1"
            >
                Effective Date:
            </div>
            <div class="sm:col-span-6 md:col-span-9 text-sm py-1">
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
