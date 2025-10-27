<script setup>
import lodash from 'lodash';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import useEventsBus from '@/composables/event-bus';

import PlanDetailsForm from '@/modules/plans/components/plans/associated/forms/PlanDetailsForm.vue';
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
    plan: {
        type: String,
        required: true
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

const { formatValue, formatEndDateDisplay, initialize } = useDateFormatter();
const helpers = useHelpers();
const associatedPlanStore = useAssociatedPlanStore();
const { emit } = useEventsBus();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const isEditing = ref(false);
const busy = ref(false);
const item = ref(props.data);
const itemToUpdate = ref({});

onMounted(() => {
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
        await associatedPlanStore.updateAssociatedPlan(
            props.plan,
            associatedPlanStore.currentPlan.id,
            associatedPlanStore.transferPayload(itemToUpdate.value)
        );

        isEditing.value = false;
        clearActiveComponent();
        emit('reloadPlan');
    } catch (error) {
        //
    } finally {
        busy.value = false;
    }
};
</script>
<template>
    <div class="flex justify-between items-center edit-cancel-button">
        <h5 class="mb-2">
            {{ $t('plans.plan_details') }}
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
    <PlanDetailsForm
        v-if="isEditing"
        :isNew="isNew"
        v-model="itemToUpdate"
        @save="save"
    />
    <div v-else class="grid grid-cols-12 items-start mt-1">
        <div class="col-span-4 text-sm font-semibold py-1">Category</div>
        <div class="col-span-8 text-sm py-1 p-break-word">
            {{ item.category.name }}
        </div>
        <div class="col-span-4 text-sm font-semibold py-1">
            {{ $t('common.effective_date') }}
        </div>
        <div class="col-span-8 text-sm py-1">
            {{
                formatValue(item.effective_date, {
                    type: 'date',
                    format: 'long'
                })
            }}
        </div>
        <div class="col-span-4 text-sm font-semibold py-1">
            {{ $t('common.end_date') }}
        </div>
        <div class="col-span-8 text-sm py-1">
            {{ formatEndDateDisplay(item.end_date) }}
        </div>
        <div class="col-span-4 text-sm font-semibold py-1">
            Authorized By
        </div>
        <div class="col-span-8 text-sm py-1">
            {{ item.authorized.name }}
        </div>
    </div>

</template>
