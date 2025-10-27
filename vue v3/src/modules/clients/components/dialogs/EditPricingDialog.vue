<script setup>
import { computed, watch } from 'vue';
import { useNonInsuranceProductStore } from '@/modules/plans/stores/NonInsuranceProduct';
import { provideEditState } from '@/modules/plans/composables/useEditState';
import AttachPricingInit from '@/modules/plans/components/shared/AttachPricing/AttachPricingInit.vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    nonInsuranceProduct: {
        type: Object,
        required: true
    }
});

const editState = provideEditState();
const emits = defineEmits(['update:modelValue']);
const nonInsuranceProductStore = useNonInsuranceProductStore();

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

const pivotId = computed(() => {
    const id = props.nonInsuranceProduct?.pivot?.id;
    return id ? String(id) : null;
});

const customStore = {
    currentNonInsuranceProduct: computed(
        () => nonInsuranceProductStore.currentNonInsuranceProduct
    ),
    setCurrentNonInsuranceProduct: (value) => {
        nonInsuranceProductStore.setCurrentNonInsuranceProduct(value);
    },
    clearCurrentNonInsuranceProduct: () => {
        nonInsuranceProductStore.clearCurrentNonInsuranceProduct();
    },
    searchPlanPrices: (id, payload, params) => {
        const cleanPayload = { ...payload };
        if (cleanPayload.includes) {
            cleanPayload.includes = cleanPayload.includes.filter(
                (inc) => inc.relation === 'priceRules'
            );
        }

        return nonInsuranceProductStore.searchNonInsuranceProductablePrices(
            pivotId.value,
            cleanPayload,
            params
        );
    },

    planPricesStore: (id, payload) => {
        return nonInsuranceProductStore.nonInsuranceProductablePricesStore(
            pivotId.value,
            payload
        );
    },

    planPricesUpdate: (id, priceId, payload) => {
        return nonInsuranceProductStore.nonInsuranceProductablePricesUpdate(
            pivotId.value,
            priceId,
            payload
        );
    },

    planPricesDelete: (id, priceId) => {
        return nonInsuranceProductStore.nonInsuranceProductablePricesDelete(
            pivotId.value,
            priceId
        );
    },

    detachPlanWithPrices: (id, resources) => {
        return nonInsuranceProductStore.detachNonInsuranceProductableWithPrices(
            pivotId.value,
            resources
        );
    },

    revertToDefaultNonInsuranceProductablePrices: (id, payload) => {
        return nonInsuranceProductStore.revertToDefaultNonInsuranceProductablePrices(
            pivotId.value,
            payload
        );
    },

    getPlan: async (id, params) => {
        return {
            data: props.nonInsuranceProduct
        };
    }
};

watch(
    () => props.modelValue,
    (isOpen) => {
        if (isOpen && props.nonInsuranceProduct) {
            nonInsuranceProductStore.setCurrentNonInsuranceProduct(
                props.nonInsuranceProduct
            );
        } else if (!isOpen) {
            editState.clearActiveComponent();
        }
    }
);
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        header="Edit Core Cap Membership Pricing"
        :style="{ width: '90vw', maxWidth: '1200px' }"
        :contentStyle="{ padding: '0' }"
    >
        <div v-if="nonInsuranceProduct && pivotId" class="p-4">
            <AttachPricingInit
                :id="pivotId"
                :store="customStore"
                :isInDialog="true"
                component-id="edit-non-insurance-product-pricing-dialog"
            />
        </div>

        <div v-else-if="!pivotId" class="p-4">
            <Message severity="error" :closable="false">
                <strong>Error:</strong> No pivot ID found. Cannot load prices.
            </Message>
        </div>
    </Dialog>
</template>
