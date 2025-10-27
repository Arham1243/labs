<script setup>
import lodash from 'lodash';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
import useEventsBus from '@/composables/event-bus';

import PlanDatesForm from '@/modules/plans/components/plans/associated/forms/PlanDatesForm.vue';

import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';
import { useI18n } from 'vue-i18n';
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
    periods: {
        type: Array,
        default: () => []
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

const helpers = useHelpers();

const { t } = useI18n();

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
    <div class="flex justify-content-between align-items-center">
        <h5 class="mb-2">
            {{ data.category.name }}
            {{ $t('common.settings') }}
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
    <PlanDatesForm
        v-if="isEditing"
        :isNew="isNew"
        v-model="itemToUpdate"
        :planCategory="itemToUpdate.category.code"
        :periods="periods"
        @save="save"
    />
    <div v-else class="mt-4">
        <div class="grid" v-if="data[data.category.code + '_type'] === 'open'">
            <div class="sm:col-6 md:col-3 text-sm font-semibold py-1">
                {{ $t('common.min') }} # {{ $t('common.of_days') }}
            </div>
            <div class="sm:col-6 md:col-9 text-sm py-1 p-break-word">
                {{ data[data.category.code + '_min_days'] }}
                {{ $t('common.days') }}
            </div>
            <div class="sm:col-6 md:col-3 text-sm font-semibold py-1">
                {{ $t('common.max') }} # {{ $t('common.of_days') }}
            </div>
            <div class="sm:col-6 md:col-9 text-sm py-1 p-break-word">
                {{ data[data.category.code + '_max_days'] }}
                {{ $t('common.days') }}
            </div>
        </div>
        <div v-else>
            <div
                v-for="(period, i) in data[data.category.code + '_periods']"
                :key="i"
                class="text-sm"
            >
                <span>
                    {{ period.days }} days
                    {{
                        String(period.plan_period_precedence.name).toLowerCase()
                    }}
                    {{ period.plan_period_id.name }} period
                    {{
                        String(
                            period.plan_period_date_reference.name
                        ).toLowerCase()
                    }}
                    ({{
                        formatValue(
                            period.plan_period_id[
                                period.plan_period_date_reference.value
                            ],
                            {
                                type: 'date',
                                format: 'long'
                            }
                        )
                    }})
                </span>
            </div>
        </div>
    </div>
</template>
