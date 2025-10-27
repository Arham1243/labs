<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import {
    enrollmentType,
    invoiceFrequency,
    paymentTerms,
    paymentTypes
} from '@/config';
import { usePaymentMethodsStore } from '@/modules/administration/stores';
import InputField from '@/components/common/InputField.vue';

const props = defineProps({
    modelValue: {
        type: Object
    },
    isNew: {
        type: Boolean,
        default: false
    },
    variant: {
        type: String,
        default: 'client'
    },
    disabled: {
        type: Boolean,
        default: false
    }
});

const paymentMethodsStore = usePaymentMethodsStore();

const paymentMethods = ref([]);
const loadingPaymentMethods = ref(false);

const emit = defineEmits(['update:modelValue']);

const formData = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    }
});
const shouldDisableBasedOnPaymentType = ref(props.disabled);

const disableInvoiceFrequencyAndPaymentTermsAndSetToNull = () => {
    formData.value.invoice_frequency = null;
    formData.value.payment_terms = null;
    shouldDisableBasedOnPaymentType.value = true;
};

watch(
    () => formData.value.is_same_as_client,
    async (is_same_as_client) => {
        if (!is_same_as_client) {
            return;
        }

        await searchPaymentMethods();

        formData.value.payment_methods = syncPaymentMethods(
            formData.value.payment_methods
        );
    }
);

watch(
    [() => formData.value.payment_type, () => formData.value.enrollment_types],
    async ([newPaymentType, newEnrollmentTypes]) => {
        if (!formData.value.is_same_as_client) {
            formData.value.payment_methods = [];
        }

        if (newPaymentType) {
            if (newEnrollmentTypes) {
                await searchPaymentMethods();
            }

            if (newPaymentType === 'cod') {
                disableInvoiceFrequencyAndPaymentTermsAndSetToNull();
                return;
            }
        }

        shouldDisableBasedOnPaymentType.value = false;
    }
);

const searchPaymentMethods = async (search = '') => {
    try {
        loadingPaymentMethods.value = true;

        const res = await paymentMethodsStore.list(
            {
                search: {
                    value: search
                },
                filters: [
                    {
                        field: 'payment_type',
                        value: formData.value.payment_type ?? ''
                    }
                ]
            },
            { limit: 100 }
        );

        paymentMethods.value = res.data
            ?.filter((paymentMethod) => {
                for (const enrollmentType of formData.value.enrollment_types) {
                    if (
                        paymentMethod.enrollment_types.includes(enrollmentType)
                    ) {
                        return true;
                    }
                }
                return false;
            })
            .map((paymentMethod) => {
                return {
                    ...paymentMethod,
                    payment_provider_id:
                        paymentMethod.payment_provider_id.replaceAll('_', ' ')
                };
            });
    } finally {
        loadingPaymentMethods.value = false;
    }
};

const syncPaymentMethods = (paymentMethodsToSync) => {
    const syncedPaymentMethods = [];

    paymentMethodsToSync?.forEach((paymentMethod) => {
        let foundPaymentMethod = paymentMethods.value.find(
            (i) => String(i.id) === String(paymentMethod.id)
        );

        if (foundPaymentMethod) {
            syncedPaymentMethods.push(foundPaymentMethod);
        }
    });

    return syncedPaymentMethods;
};

onMounted(async () => {
    if (formData.value.payment_type) {
        await searchPaymentMethods();

        if (formData.value.payment_type === 'cod') {
            disableInvoiceFrequencyAndPaymentTermsAndSetToNull();
        }

        if (formData.value.payment_methods?.length > 0) {
            formData.value.payment_methods = syncPaymentMethods(
                formData.value.payment_methods
            );
        }
    }
});
</script>

<template>
    <div class="p-fluid formgrid grid mt-4">
        <div class="field col-12">
            <label data-testid="enrollment-types-label"
                >Enrolment Types *</label
            >
            <InputField
                id="enrollment_types"
                class="enrollment_types"
                variant="multiselect"
                :options="enrollmentType"
                optionLabel="name"
                optionValue="code"
                placeholder="Select"
                v-model="formData.enrollment_types"
                :disabled="disabled"
                data-testid="enrollment-types-multiselect"
            />
        </div>
        <div class="field col-6">
            <label for="address" data-testid="payment-type-label"
                >Payment Type *</label
            >
            <InputField
                id="payment_type"
                variant="dropdown"
                :options="paymentTypes"
                optionLabel="name"
                optionValue="code"
                placeholder="Select"
                v-model="formData.payment_type"
                :disabled="disabled"
                showClear
                data-testid="payment-type-dropdown"
            />
        </div>
        <div class="field col-6">
            <label for="payment_methods" data-testid="payment-method-label"
                >Payment Methods *</label
            >
            <ApiMultiselect
                id="payment_methods"
                optionLabel="payment_provider_id"
                v-model="formData.payment_methods"
                @search="(search) => searchPaymentMethods(search)"
                :loading="loadingPaymentMethods"
                :items="paymentMethods"
                :disabled="disabled || formData.payment_type === null"
                :class="
                    disabled || formData.payment_type === null
                        ? 'custom-disabled'
                        : ''
                "
                data-testid="payment-method-dropdown"
            />
        </div>
        <div class="field col-6">
            <label for="address" data-testid="invoice-frequency-label"
                >Invoice Frequency *</label
            >
            <InputField
                id="invoice_frequency"
                variant="dropdown"
                :options="invoiceFrequency"
                optionLabel="name"
                optionValue="code"
                placeholder="Select"
                v-model="formData.invoice_frequency"
                :disabled="disabled || shouldDisableBasedOnPaymentType"
                data-testid="invoice-frequency-dropdown"
            />
        </div>
        <div class="field col-6">
            <label data-testid="payment-terms-label">Payment Terms *</label>
            <InputField
                id="payment_terms"
                variant="dropdown"
                :options="paymentTerms"
                optionLabel="name"
                optionValue="code"
                placeholder="Select"
                v-model="formData.payment_terms"
                :disabled="disabled || shouldDisableBasedOnPaymentType"
                data-testid="payment-terms-dropdown"
            />
        </div>
        <div class="field col-12">
            <label
                for="preferred_invoice_name"
                data-testid="preferred-invoice-name-label"
                >Preferred Invoice Name</label
            >
            <InputField
                id="preferred_invoice_name"
                variant="text"
                v-model="formData.preferred_invoice_name"
                :disabled="disabled"
                data-testid="preferred-invoice-name-input"
            />
        </div>
        <div class="field col-12">
            <label for="quickbooks_id" data-testid="quickbooks-id-label"
                >Quickbooks ID</label
            >
            <InputField
                id="quickbooks_id"
                variant="text"
                v-model="formData.quickbooks_id"
                :disabled="disabled"
                data-testid="quickbooks-id-input"
            />
        </div>
    </div>
</template>

<style>
.enrollment_types.p-disabled {
    background: #e9ecef !important;
}
</style>
