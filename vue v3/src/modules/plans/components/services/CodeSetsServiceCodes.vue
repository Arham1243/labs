<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import ServiceCodesTable from '@/modules/plans/components/services/tables/ServiceCodesTable.vue';
import { useEditState } from '@/modules/plans/composables/useEditState';

const props = defineProps({
    id: {
        type: [String, Number],
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

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const isEditing = ref(false);

onMounted(() => {
    registerCancelCallback(props.componentId, handleCancel);
});

onUnmounted(() => {
    unregisterCancelCallback(props.componentId);
});

const isEditable = computed(() => {
    return isEditing.value || props.isNew;
});

const isEditDisabled = computed(() => {
    return (
        activeEditComponent.value &&
        activeEditComponent.value !== props.componentId
    );
});

const handleEdit = () => {
    isEditing.value = true;
    setActiveComponent(props.componentId);
};

const handleCancel = () => {
    if (props.isReview) {
        isEditing.value = false;
        clearActiveComponent();
    } else {
        isEditing.value = false;
        clearActiveComponent();
    }
};
</script>

<template>
    <div>
        <div class="flex justify-content-between align-items-center mb-3">
            <h5 data-testid="page-title">
                {{
                    isNew
                        ? 'Add service codes to include in code set'
                        : 'Services'
                }}
            </h5>
            <div v-if="!isNew">
                <Button
                    v-if="isEditing"
                    label="Done"
                    icon="pi pi-check"
                    class="p-button mr-2"
                    @click="handleCancel"
                    data-testid="cancel-button"
                />
                <Button
                    v-else-if="$ability.can('update service code sets')"
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
        </div>

        <ServiceCodesTable
            :id="id"
            entity="sets"
            :show-new="isEditable"
            :show-import="isEditable"
            :show-actions="isEditable"
            :show-bulk-actions="isEditable"
            :isEditing="isEditable"
            data-testid="service-codes-table"
        />
    </div>
</template>
