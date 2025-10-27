<script setup>
import lodash from 'lodash';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import useEventsBus from '@/composables/event-bus';

import PeriodDatesForm from '@/modules/plans/components/plans/forms/PeriodDatesForm.vue';
import { useRoute } from 'vue-router';
import {
    provideEditState,
    useEditState
} from '@/modules/plans/composables/useEditState';

const props = defineProps({
    data: {
        type: Object,
        required: true
    },
    isNew: {
        type: Boolean,
        default: false
    },
    validateDates: {
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

const planStore = usePlanStore();
const { emit } = useEventsBus();
const route = useRoute();

const {
    activeEditComponent,
    setActiveComponent,
    clearActiveComponent,
    handleUnsavedChanges,
    registerCancelCallback,
    unregisterCancelCallback
} = useEditState();

const isEditing = ref(false);
const item = ref(props.data);
const itemToUpdate = ref({});

const busy = ref(false);

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
        // // console.log(error.errors)
        // isEditing.value = false
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2">Period Dates</h5>
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
    <PeriodDatesForm
        v-if="isEditing"
        :isNew="isNew"
        v-model="itemToUpdate"
        :validateDates="validateDates"
    />
    <div v-else class="mx-10 mt-1">
        <table class="w-full mt-3">
            <thead>
                <tr class="">
                    <th class="text-left py-2">Period</th>
                    <th class="text-left py-2">Start Date</th>
                    <th class="text-left py-2">End Date</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in item.periods" :key="item.id">
                    <td class="text-left py-3" v-tooltip.top="item.name">
                        {{
                            lodash.truncate(item.name, {
                                length: 20
                            })
                        }}
                    </td>
                    <td class="text-left py-3">
                        {{
                            formatValue(item.start_date, {
                                type: 'date',
                                format: 'long'
                            })
                        }}
                    </td>
                    <td class="text-left py-3">
                        {{
                            formatValue(item.end_date, {
                                type: 'date',
                                format: 'long'
                            })
                        }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
