<script setup>
import lodash from 'lodash';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import useEventsBus from '@/composables/event-bus';
import { usePlanStore } from '@/modules/plans/stores/Plan';

import { useRoute } from 'vue-router';
import BundlesForm from '@/modules/plans/components/plans/forms/BundlesForm.vue';
import helpers from '@/utils/helpers';
import { useAssociatedPlanStore } from '@/modules/plans/stores/AssociatedPlan';
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
    variant: {
        type: String,
        default: 'plan',
        validator(value) {
            return ['plan', 'associatedPlan'].includes(value);
        }
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

const emits = defineEmits(['nonInsuranceProductChanged']);

const planStore = usePlanStore();
const associatedPlanStore = useAssociatedPlanStore();
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
const busy = ref(false);
const item = ref(props.data);
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

const initialNonInsuranceProductIds = computed(() => {
    return (
        props.data?.non_insurance_products?.map(
            (nonInsuranceProduct) => nonInsuranceProduct.id
        ) || []
    );
});
const itemToUpdateNonInsuranceProductIds = computed(() => {
    return (
        itemToUpdate.value?.non_insurance_products?.map(
            (nonInsuranceProduct) => nonInsuranceProduct.id
        ) || []
    );
});

const isNotChanged = computed(() => {
    const initial = new Set(initialNonInsuranceProductIds.value);
    const current = new Set(itemToUpdateNonInsuranceProductIds.value);
    if (initial.size !== current.size) return false;
    return [...initial].every((id) => current.has(id));
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

const nonInsuranceProducts = computed(() => {
    if (item.value.non_insurance_products?.length === 0) {
        return null;
    }

    let nonInsuranceProductString = '';

    item.value.non_insurance_products?.forEach((nonInsuranceProduct, index) => {
        nonInsuranceProductString +=
            (index === 0 ? '' : ', ') +
            helpers.getLocaleValue(nonInsuranceProduct.name);
    });

    return nonInsuranceProductString;
});

const save = async () => {
    try {
        busy.value = true;

        let actionType = null;

        if (
            itemToUpdateNonInsuranceProductIds.value.length >
            initialNonInsuranceProductIds.value.length
        ) {
            actionType = 'added';
        } else if (
            itemToUpdateNonInsuranceProductIds.value.length <
            initialNonInsuranceProductIds.value.length
        ) {
            actionType = 'removed';
        } else {
            if (!isNotChanged.value) {
                actionType = 'changed';
            }
        }

        switch (props.variant) {
            case 'plan':
                await planStore.updatePlan(
                    itemToUpdate.value.id,
                    planStore.transferPayload(itemToUpdate.value)
                );

                if (actionType) {
                    emits('nonInsuranceProductChanged', actionType);
                }

                isEditing.value = false;
                clearActiveComponent();
                if (route.name === 'Plan Details') {
                    emit('reloadPlanDetails');
                } else {
                    emit('reloadReviewPlanDetails');
                }
                break;

            case 'associatedPlan':
                await associatedPlanStore.updateAssociatedPlan(
                    associatedPlanStore.parentPlan.id,
                    associatedPlanStore.currentPlan.id,
                    associatedPlanStore.transferPayload(itemToUpdate.value)
                );

                if (actionType) {
                    emits('nonInsuranceProductChanged', actionType);
                }

                clearActiveComponent();
                emit('reloadPlan');
                break;
        }
        item.value = lodash.cloneDeep(itemToUpdate.value);
    } finally {
        busy.value = false;
    }
};
</script>

<template>
    <div class="flex justify-between items-center edit-cancel-button">
        <h5 class="mb-2" data-testid="bundles-title">
            {{ $t('plans.bundles') }}
        </h5>
        <div v-if="isEditing">
            <Button
                :label="$t('buttons.cancel')"
                class="p-button-outlined mr-2"
                @click="handleCancel"
                data-testid="cancel-button"
            />
            <Button
                :label="$t('buttons.save')"
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
            :label="$t('buttons.edit')"
            icon="pi pi-pencil"
            :disabled="isEditDisabled"
            @click="handleEdit"
            data-testid="edit-button"
        />
    </div>
    <BundlesForm
        v-if="isEditing"
        :isNew="isNew"
        v-model="itemToUpdate"
        data-testid="bundles-form"
    />
    <div v-else class="grid grid-cols-12 gap-4 mt-1">
        <div
            data-testid="include-non-insurance-product-label"
            class="col-span-4 text-sm font-semibold py-1"
        >
            {{ $t('plans.include_non_insurance_products') }}
        </div>
        <div class="col-span-8 text-sm py-1 p-break-word">
            <template v-if="nonInsuranceProducts">
                {{ nonInsuranceProducts }}
            </template>
            <template v-else
                ><i
                    class="pi pi-times"
                    data-testid="no-non-insurance-products-icon"
                ></i>
                No</template
            >
        </div>
    </div>
</template>
