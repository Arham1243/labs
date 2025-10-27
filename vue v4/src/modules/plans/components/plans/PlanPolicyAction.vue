<script setup>
import lodash from 'lodash';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { usePlanStore } from '@/modules/plans/stores/Plan';
import useEventsBus from '@/composables/event-bus';
import { useHelpers } from '@/composables';
import { useDateFormatter } from '@/composables/useDateFormatter.js';

import PolicyActionFrom from '@/modules/plans/components/plans/forms/PolicyActionFrom.vue';
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

const { formatValue, initialize } = useDateFormatter();
const helpers = useHelpers();

const route = useRoute();
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

const fullCancellationPeriods = [].concat(
    ...item.value.periods.map((item) => {
        return item.cancellation_periods
            .filter((period) => {
                return period.type === 'full';
            })
            .map((period) => ({
                ...period,
                date: helpers.formatDate(
                    item[period['plan_period_date_reference']],
                    'MMMM D'
                )
            }));
    })
);

const partialCancellationPeriods = [].concat(
    ...item.value.periods.map((item) => {
        return item.cancellation_periods
            .filter((period) => {
                return period.type === 'partial';
            })
            .map((period) => ({
                ...period,
                date: helpers.formatDate(
                    item[period['plan_period_date_reference']],
                    'MMMM D'
                )
            }));
    })
);

const extensionPeriods = [].concat(
    ...item.value.periods.map((item) => {
        return item.extension_periods.map((period) => ({
            ...period,
            date: helpers.formatDate(
                item[period['plan_period_date_reference']],
                'MMMM D'
            )
        }));
    })
);

const earlyReturnPeriods = [].concat(
    ...item.value.periods.map((item) => {
        return item.early_return_periods.map((period) => ({
            ...period,
            date: helpers.formatDate(
                item[period['plan_period_date_reference']],
                'MMMM D'
            )
        }));
    })
);

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
    <div class="flex justify-between items-center edit-cancel-button">
        <h5 class="mb-2">Policy Actions</h5>
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
            class="px-2 py-1 p-button-outlined"
            label="Edit"
            icon="pi pi-pencil"
            :disabled="isEditDisabled"
            @click="handleEdit"
            data-testid="edit-button"
        />
    </div>
    <PolicyActionFrom v-if="isEditing" :isNew="isNew" v-model="itemToUpdate" />
    <div v-else class="grid grid-cols-12 mt-1">
        <div class="col-span-4 text-sm font-semibold py-1">
            {{ $t('common.cancellations') }}
        </div>
        <div class="col-span-8 text-sm py-1 p-break-word">
            <template v-if="item.is_cancellations && item.cancellation_type">
                <i class="pi pi-check"></i>
                {{ lodash.upperFirst(item.cancellation_type.name) }}
            </template>
            <template v-else>
                <i class="pi pi-times"></i>
                No
            </template>
        </div>
        <template v-if="fullCancellationPeriods.length">
            <div class="col-span-4 text-sm font-semibold py-1">
                {{ $t('common.full_cancellation_periods') }}
            </div>
            <div class="col-span-8 text-sm py-1 p-break-word">
                <span
                    v-for="cancel in fullCancellationPeriods"
                    :key="cancel.id"
                    class="text-sm p-break-all"
                >
                    {{ cancel.days }} days
                    {{ cancel.plan_period_precedence }}
                    {{ cancel.name }} period
                    {{ cancel.plan_period_date_reference.replace('_', ' ') }}
                    ({{
                        formatValue(cancel.date, {
                            type: 'date',
                            format: 'long'
                        })
                    }})
                </span>
            </div>
        </template>
        <template v-if="partialCancellationPeriods.length">
            <div class="col-span-4 text-sm font-semibold py-1">
                {{ $t('common.partial_cancellation_periods') }}
            </div>
            <div class="col-span-8 text-sm py-1 p-break-word">
                <span
                    v-for="cancel in partialCancellationPeriods"
                    :key="cancel.id"
                    class="text-sm p-break-all"
                >
                    {{ cancel.days }} days
                    {{ cancel.plan_period_precedence }}
                    {{ cancel.name }} period
                    {{ cancel.plan_period_date_reference.replace('_', ' ') }}
                    ({{
                        formatValue(cancel.date, {
                            type: 'date',
                            format: 'long'
                        })
                    }})
                </span>
            </div>
        </template>
        <div class="col-span-4 text-sm font-semibold py-1">
            {{ $t('common.extensions') }}
        </div>
        <div class="col-span-8 text-sm py-1 p-break-word">
            <template v-if="item.is_extensions && item.extension_type">
                <i class="pi pi-check"></i>
                {{ lodash.upperFirst(item.extension_type.name) }}
            </template>
            <template v-else>
                <i class="pi pi-times"></i>
                No
            </template>
        </div>
        <template v-if="extensionPeriods.length">
            <div class="col-span-4 text-sm font-semibold py-1">
                {{ $t('common.extension_periods') }}
            </div>
            <div class="col-span-8 text-sm py-1 p-break-word">
                <p
                    v-for="cancel in extensionPeriods"
                    :key="cancel.id"
                    class="text-sm p-break-all"
                >
                    {{ cancel.days }} days
                    {{ cancel.plan_period_precedence }}
                    {{ cancel.name }} period
                    {{ cancel.plan_period_date_reference.replace('_', ' ') }}
                    ({{
                        formatValue(cancel.date, {
                            type: 'date',
                            format: 'long'
                        })
                    }})
                </p>
            </div>
        </template>
        <div class="col-span-4 text-sm font-semibold py-1">
            {{ $t('common.early_returns') }}
        </div>
        <div class="col-span-8 text-sm py-1 p-break-word">
            <template v-if="item.is_early_returns && item.early_return_type">
                <i class="pi pi-check"></i>
                {{ lodash.upperFirst(item.early_return_type.name) }}
            </template>
            <template v-else>
                <i class="pi pi-times"></i>
                No
            </template>
        </div>
        <template v-if="earlyReturnPeriods.length">
            <div class="col-span-4 text-sm font-semibold py-1">
                {{ $t('common.early_return_periods') }}
            </div>
            <div class="col-span-8 text-sm py-1 p-break-word">
                <p
                    v-for="cancel in earlyReturnPeriods"
                    :key="cancel.id"
                    class="text-sm p-break-all"
                >
                    {{ cancel.days }} days
                    {{ cancel.plan_period_precedence }}
                    {{ cancel.name }} period
                    {{ cancel.plan_period_date_reference.replace('_', ' ') }}
                    ({{
                        formatValue(cancel.date, {
                            type: 'date',
                            format: 'long'
                        })
                    }})
                </p>
            </div>
        </template>
        <div class="col-span-4 text-sm font-semibold py-1">
            {{ $t('common.opt_out') }}
        </div>
        <div class="col-span-8 text-sm py-1 p-break-word">
            <template v-if="item.is_opt_out"
                ><i class="pi pi-check"></i> Yes</template
            >
            <template v-else><i class="pi pi-times"></i> No</template>
        </div>
        <div class="col-span-4 text-sm font-semibold py-1">
            {{ $t('common.overlap') }}
        </div>
        <div class="col-span-8 text-sm py-1 p-break-word">
            <template v-if="item.is_overlap"
                ><i class="pi pi-check"></i> Yes</template
            >
            <template v-else><i class="pi pi-times"></i> No</template>
        </div>
        <div class="col-span-4 text-sm font-semibold py-1">
            {{ $t('common.refundable') }}
        </div>
        <div class="col-span-8 text-sm py-1 p-break-word">
            <template v-if="item.is_refundable"
                ><i class="pi pi-check"></i> Yes</template
            >
            <template v-else><i class="pi pi-times"></i> No</template>
        </div>
    </div>
</template>
