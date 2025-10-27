<script setup>
import lodash from 'lodash';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useHelpers } from '@/composables';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import useEventsBus from '@/composables/event-bus';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import PlanDetailsForm from '@/modules/plans/components/plans/forms/PlanDetailsForm.vue';
import { useRoute } from 'vue-router';
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

const { formatValue, formatEndDateDisplay, initialize } = useDateFormatter();

const route = useRoute();
const helpers = useHelpers();
const planStore = usePlanStore();
const { emit } = useEventsBus();

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
        await planStore.updatePlan(
            itemToUpdate.value.id,
            planStore.transferPayload(itemToUpdate.value)
        );
        isEditing.value = false;
        clearActiveComponent();
        if (route.name === 'Plan Details') {
            emit('reloadPlanDetails');
        } else {
            emit('reloadReviewPlanDetails');
        }
    } catch (error) {
        //
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <div class="flex justify-content-between align-items-center">
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
    <PlanDetailsForm v-if="isEditing" :isNew="isNew" v-model="itemToUpdate" />

    <div v-else class="grid mt-1">
        <div class="sm:col-6 md:col-3 text-sm font-semibold py-1">
            Plan Name
        </div>
        <div class="sm:col-6 md:col-9 text-sm py-1 p-break-word">
            {{ helpers.getLocaleValue(item.name) }}
        </div>
        <div class="sm:col-6 md:col-3 text-sm font-semibold py-1">
            {{ $t('common.effective_date') }}
        </div>
        <div class="sm:col-6 md:col-9 text-sm py-1">
            {{
                formatValue(item.effective_date, {
                    type: 'date',
                    format: 'long'
                })
            }}
        </div>
        <div class="sm:col-6 md:col-3 text-sm font-semibold py-1">
            {{ $t('common.end_date') }}
        </div>
        <div class="sm:col-6 md:col-9 text-sm py-1">
            {{ formatEndDateDisplay(item.end_date) }}
        </div>
        <div class="sm:col-6 md:col-3 text-sm font-semibold py-1">Domestic</div>
        <div class="sm:col-6 md:col-9 text-sm py-1">
            <template v-if="item.type?.value == 'domestic'"
                ><i class="pi pi-check"></i> Yes</template
            >
            <template v-else><i class="pi pi-times"></i> No</template>
        </div>
        <div class="sm:col-6 md:col-3 text-sm font-semibold py-1">Inbound</div>
        <div class="sm:col-6 md:col-9 text-sm py-1">
            <template v-if="item.bound.value == 'in'"
                ><i class="pi pi-check"></i> Yes</template
            >
            <template v-else><i class="pi pi-times"></i> No</template>
        </div>
        <div class="sm:col-6 md:col-3 text-sm font-semibold py-1">
            Authorized By
        </div>
        <div class="sm:col-6 md:col-9 text-sm py-1">
            {{ item.authorized?.name }}
        </div>
    </div>
</template>
