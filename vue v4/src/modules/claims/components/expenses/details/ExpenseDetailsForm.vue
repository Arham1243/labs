<script setup>
import { inject, onMounted, ref, watch } from 'vue';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import { useGeneralStore } from '@/modules/claims/stores/General';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';

const { t } = useI18n();
const route = useRoute();
const currentUser = inject('currentUser');
const globalStore = useGlobalStore();
const benefits = ref([]);
const serviceCodes = ref([]);
const currentCurrency = 'CAD'; // ! USE DEFAULT CURRENCY FOR NOW
const { currentSubmission } = useSubmissionStore();
const { currentExpense, updateExpense } = useExpenseStore();
const { mutate } = updateExpense();
const { getPolicy } = useGeneralStore();

// ! DUMMY DATA FOR DIN
const dins = ref([
    { label: 'DIN 1', value: 'DIN 1' },
    { label: 'DIN 2', value: 'DIN 2' },
    { label: 'DIN 3', value: 'DIN 3' }
]);

const formData = ref({
    benefit_id: currentExpense.value.benefit.id,
    service_code_id: currentExpense.value?.service_code?.id,
    service_date: currentExpense.value.service_date,
    amount_claimed: currentExpense.value.amount_claimed,
    currency: currentExpense.value.currency,
    beneficiary: currentExpense.value.beneficiary.name,
    description: currentExpense.value.description,
    user_id: currentUser.value.id
});

// Validation errors
const errors = ref({
    amount_claimed: '',
    description: ''
});

/**
 * On Mounted
 */
onMounted(async () => {
    const policy = await getPolicy(
        route.params.clientId,
        currentSubmission.value.policy.id
    );

    // Build benefits dropdown
    benefits.value = policy?.data?.benefits?.map((benefit) => {
        return {
            label: benefit.name,
            value: benefit.id
        };
    });

    // Build service codes dropdown based on selected benefit
    serviceCodes.value = policy?.data?.benefits
        .find((benefit) => benefit.id === currentExpense.value.benefit.id)
        .service_codes.map((serviceCode) => {
            return {
                label: serviceCode.code,
                value: serviceCode.id
            };
        });
});

// Watch for changes in the benefit dropdown and update the service codes
watch(
    () => formData.value.benefit_id,
    async (newBenefit) => {
        const policy = await getPolicy(
            route.params.clientId,
            currentSubmission.value.policy.id
        );

        formData.value.service_code_id = null;
        serviceCodes.value = policy?.data?.benefits
            .find((benefit) => benefit.id === newBenefit)
            .service_codes.map((serviceCode) => {
                return {
                    label: serviceCode.code,
                    value: serviceCode.id
                };
            });
    }
);

/**
 * Validate form fields
 */
const validateForm = () => {
    let isValid = true;

    // Clear previous errors
    errors.value.amount_claimed = '';
    errors.value.description = '';

    // Validate expense amount
    if (!formData.value.amount_claimed || formData.value.amount_claimed <= 0) {
        errors.value.amount_claimed = t(
            'notifications.expense_amount_required'
        );
        isValid = false;
    }

    // Validate reason for visit
    if (
        !formData.value.description ||
        formData.value.description.trim() === ''
    ) {
        errors.value.description = t('notifications.reason_for_visit_required');
        isValid = false;
    }

    return isValid;
};

/**
 * Function to save expense
 */
const saveExpense = async () => {
    // Validate form first
    if (!validateForm()) {
        return false;
    }

    try {
        // Add API call or emit event here
        await mutate({
            tenantId: route.params.clientId,
            expenseId: currentExpense.value.id,
            formData: formData.value
        });

        // Show success notification
        globalStore.showSuccess(
            t('notifications.expense_changed'),
            t('notifications.expense_updated')
        );

        return true;
    } catch (error) {
        console.error('Error saving expense:', error);
        globalStore.showError(
            t('notifications.error'),
            t('notifications.save_failed')
        );
        return false;
    }
};

// Expose function to parent
defineExpose({
    saveExpense
});
</script>

<template>
    <div class="mt-5">
        <div class="flex flex-col gap-2">
            <label data-testid="label-benefit">{{ $t('common.benefit') }}</label>
            <Select
                data-testid="dropdown-benefit"
                v-model="formData.benefit_id"
                :options="benefits"
                optionLabel="label"
                optionValue="value"
            />
        </div>
        <div class="flex flex-col gap-2 mt-5">
            <label data-testid="label-service-code">{{ $t('expenses.service_code') }}</label>
            <Select
                data-testid="dropdown-service-code"
                v-model="formData.service_code_id"
                :options="serviceCodes"
                optionLabel="label"
                optionValue="value"
                placeholder="Select service code"
            />
        </div>
        <div class="flex flex-col gap-2 mt-5">
            <label data-testid="label-din">{{ $t('expenses.din') }}</label>
            <Select
                data-testid="dropdown-din"
                :options="dins"
                optionLabel="label"
                optionValue="value"
            />
        </div>
        <div class="flex flex-col gap-2 mt-5">
            <label data-testid="label-service-date">{{ $t('expenses.service_date') }}</label>
            <DatePicker
                v-model="formData.service_date"
                data-testid="date-picker-service-date"
                id="service_date"
                disabled
            />
        </div>
        <div class="flex flex-col gap-2 mt-5">
            <label data-testid="label-expense-amt">{{ $t('expenses.expense_amt') }}</label>
            <InputNumber
                v-model="formData.amount_claimed"
                currency="CAD"
                locale="en-US"
                mode="currency"
                data-testid="input-expense-amt"
                :class="{ 'p-invalid': errors.amount_claimed }"
            />
            <small class="p-error" v-if="errors.amount_claimed">{{ errors.amount_claimed }}</small>
        </div>
        <div class="flex flex-col gap-2 mt-5">
            <label data-testid="label-expense-amt">{{ $t('common.currency') }}</label>
            <Select
                data-testid="dropdown-currency"
                v-model="currentCurrency"
                optionLabel="label"
                optionValue="value"
                :options="[{ label: 'CAD', value: 'CAD' }]"
            />
        </div>
        <div class="flex flex-col gap-2 mt-5">
            <label data-testid="label-beneficiary">{{ $t('expenses.beneficiary') }}</label>
            <Select data-testid="dropdown-beneficiary" :items="[]" />
        </div>
        <div class="flex flex-col gap-2 mt-5">
            <label data-testid="label-description">{{ $t('expenses.reason_for_visit') }}</label>
            <Textarea
                rows="3"
                cols="30"
                v-model="formData.description"
                data-testid="textarea-description"
                :class="{ 'p-invalid': errors.description }"
            />
            <small class="p-error" v-if="errors.description">{{ errors.description }}</small>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
