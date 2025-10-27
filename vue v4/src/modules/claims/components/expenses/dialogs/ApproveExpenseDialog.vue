<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import helpers from '@/utils/helpers';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import { useGeneralStore } from '@/modules/claims/stores/General';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    currentExpenseIndex: {
        type: Number
    }
});

const emits = defineEmits(['update:modelValue'], ['approveExpense']);
const globalStore = useGlobalStore();
const { t } = useI18n();
const { getCurrencies } = useGeneralStore();
const { currentSubmission } = useSubmissionStore();
const { currentExpense, currentBenefit } = useExpenseStore();

const currencies = ref([]);
const formData = ref({
    expenseApprovalAmount: null,
    expenseCoPayPercentage: null
});

const is_courtesy_pay = ref(false);
const is_courtesy_pay_disabled = ref(true);
const courtesy_reason = ref('');

/**
 * Dialog visibility
 * @type {WritableComputedRef<*, *>}
 */
const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

/**
 * Expense Co-Pay Amount
 * @type {WritableComputedRef<*, *>}
 */
const expenseCoPayAmount = computed({
    get() {
        return (
            formData.value.expenseApprovalAmount *
            (formData.value.expenseCoPayPercentage / 100)
        );
    },
    set(value) {
        formData.value.expenseCoPayAmount = value;
    }
});

/**
 * Expense Approved Total
 * @type {WritableComputedRef<*, *>}
 */
const expenseApprovedTotal = computed({
    get() {
        return formData.value.expenseApprovalAmount - expenseCoPayAmount.value;
    },
    set(value) {
        formData.value.expenseApprovedTotal = value;
    }
});

// /**
//  * Coverage Left
//  * @type {WritableComputedRef<*, *>}
//  */
// const coverageLeft = computed({
//     get() {
//         return props.expense.coverage.left - expenseApprovedTotal.value;
//     },
//     set(value) {
//         // eslint-disable-next-line vue/no-mutating-props
//         props.expense.coverage.left = value;
//     }
// });

watch(
    () => is_courtesy_pay.value,
    (newValue) => {
        if (newValue === true) {
            formData.value.expenseApprovalAmount = Number(
                currentExpense.value.amount_claimed
            );
        }
    }
);

onMounted(async () => {
    currencies.value = await getCurrencies();
    if (
        Number(currentBenefit.value?.balance) <
        Number(currentExpense.value?.amount_claimed)
    ) {
        is_courtesy_pay_disabled.value = false;
    }
});

/**
 * Approve Expense
 * @returns {Promise<void>}
 */
const approveExpense = () => {
    if (
        !formData.value.expenseApprovalAmount ||
        formData.value.expenseApprovalAmount >
            currentExpense.value.amount_claimed
    ) {
        // Show error notification if expenseApprovalAmount is empty or exceeds the amount claimed
        globalStore.showError(
            t('notifications.expense_changed'),
            t('notifications.approval_amount_invalid')
        );
    } else if (!currentExpense.value.service_code) {
        // Show error notification if the expense service code is missing
        globalStore.showError(
            t('notifications.expense_changed'),
            t('notifications.service_code_required')
        );
    } else if (is_courtesy_pay.value && courtesy_reason.value === '') {
        // Show error notification if courtesy pay is selected but the reason is empty
        globalStore.showError(
            t('notifications.expense_changed'),
            t('notifications.courtesy_reason_required')
        );
    } else {
        // Approve the expense
        const payload = {
            status: 'approved',
            amount_approved: expenseApprovedTotal.value,
            amount_co_pay: expenseCoPayAmount.value,
            amount_declined:
                currentExpense.value.amount_claimed -
                formData.value.expenseApprovalAmount,
            amount_refund: 0,
            is_courtesy_pay: is_courtesy_pay.value,
            ...(is_courtesy_pay.value && {
                courtesy_pay_reason: courtesy_reason.value
            })
        };
        emits('approveExpense', payload);
    }
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="$t('expenses.approve') + ' ' + $t('expenses.expense')"
        :style="{ width: '580px' }"
    >
        <div class="flex justify-between items-center">
            <h6 data-testid="text-expense-title">
                Submission ID: {{ currentSubmission.ref_number }}
                <br />
                Expense # {{ props.currentExpenseIndex + 1 }}
            </h6>
            <ClaimStatusTag
                data-testid="tag-expense-status"
                :status="currentExpense.status"
                :icon="'pi pi-eye'"
            />
        </div>
        <divider class="mb-20 mt-20" />
        <div>
            <div class="grid grid-cols-3 gap-4 items-center mt-1">
                <div
                    class="font-semibold py-1"
                    data-testid="label-coverage-include"
                >
                    {{ $t('expenses.coverage_incl') }}
                </div>
                <div
                    class="col-span-2 py-1 p-break-word"
                    data-testid="text-coverage-include"
                >
                    {{ currentBenefit ? 'Yes' : 'No' }}
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4 items-center mt-1" v-if="1">
                <div
                    class="font-semibold py-1"
                    data-testid="label-coverage"
                >
                    {{ $t('expenses.coverage') }}
                </div>
                <div
                    class="col-span-2 py-1 p-break-word"
                    data-testid="text-coverage"
                >
                    {{
                        currentBenefit?.coverage
                            ? currentBenefit.coverage + '%'
                            : '-'
                    }}
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4 items-center mt-1" v-if="1">
                <div
                    class="font-semibold py-1"
                    data-testid="label-to-maximum-of"
                >
                    {{ $t('expenses.to_maximum_of') }}
                </div>
                <div
                    class="col-span-2 py-1 p-break-word"
                    data-testid="text-to-maximum-of"
                >
                    {{
                        currentBenefit?.max_amount
                            ? helpers.moneyFormat(currentBenefit.max_amount)
                            : '-'
                    }}
                    CAD
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4 items-center mt-1" v-if="1">
                <div
                    class="col-4 font-semibold py-1"
                    data-testid="label-coverage-left"
                >
                    {{ $t('expenses.coverage_left') }}
                </div>
                <div
                    class="col-span-2 py-1 p-break-word"
                    data-testid="text-coverage-left"
                >
                    {{
                        currentBenefit?.balance
                            ? helpers.moneyFormat(currentBenefit?.balance)
                            : '-'
                    }}
                    CAD
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4 items-center mt-1">
                <div
                    class="font-semibold py-1"
                    data-testid="label-expense-amount"
                >
                    {{ $t('expenses.expense_amount') }}
                </div>
                <div
                    class="col-span-2 py-1 p-break-word"
                    data-testid="text-expense-amount"
                >
                    {{
                        helpers.moneyFormat(
                            currentExpense.amount_claimed,
                            'cad'
                        )
                    }}
                    CAD
                </div>
            </div>

            <divider class="mb-20 mt-20" />

            <div class="grid grid-cols-3 gap-4 items-center mt-3">
                <div
                    class="font-semibold"
                    data-testid="label-expense-approval-amount"
                >
                    {{ $t('expenses.approval_amount') }}
                </div>
                <div class="col-span-2 p-break-word">
                    <InputNumber
                        prefix="$ "
                        :minFractionDigits="2"
                        :maxFractionDigits="2"
                        class="mr-1"
                        data-testid="input-expense-approval-amount"
                        v-model="formData.expenseApprovalAmount"
                    />
                    <span class="ml-2">CAD</span>
<!--                    <Select-->
<!--                        :options="currencies.data"-->
<!--                        optionLabel="id"-->
<!--                        placeholder="CAD"-->
<!--                        data-testid="dropdown-expense-approval-amount-currency"-->
<!--                    />-->
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4 items-center mt-3">
                <div
                    class="font-semibold"
                    data-testid="label-expense-co-pay-amount"
                >
                    {{ $t('expenses.co_pay_amount') }}
                </div>
                <div class="col-span-1 p-break-word">
                    <InputNumber
                        suffix=" %"
                        data-testid="input-expense-co-pay-amount-percentage"
                        class="percentage-input"
                        v-model="formData.expenseCoPayPercentage"
                    />
                </div>
                <div class="py-1 p-break-word">
                    <InputNumber
                        prefix="$ "
                        suffix=" CAD"
                        :minFractionDigits="2"
                        :maxFractionDigits="2"
                        class="mr-1 co-pay-amount-input"
                        data-testid="input-expense-co-pay-amount"
                        v-model="expenseCoPayAmount"
                        disabled
                    />
                </div>
            </div>
            <div class="grid grid-cols-3 gap-4 items-center mt-3">
                <div
                    class="font-semibold"
                    data-testid="label-expense-approved-total"
                >
                    {{ $t('expenses.approved_total') }}
                </div>
                <div class="col-span-2 py-1 p-break-word">
                    <InputNumber
                        prefix="$ "
                        suffix=" CAD"
                        :minFractionDigits="2"
                        :maxFractionDigits="2"
                        class="mr-1 approved-total-input"
                        data-testid="input-expense-approved-total"
                        aria-describedby="approved-total-help"
                        v-model="expenseApprovedTotal"
                        disabled
                    />
                    <br />
                    <!--                    <small-->
                    <!--                        id="approved-total-help"-->
                    <!--                        v-if="props.expense.coverage.include"-->
                    <!--                    >-->
                    <!--                        Coverage left after approval:-->
                    <!--                        {{ formatCurrency(coverageLeft) }}-->
                    <!--                    </small>-->
                </div>
            </div>

            <div class="flex items-center gap-2 mt-3">
                <Checkbox
                    id="is_courtesy_pay"
                    v-model="is_courtesy_pay"
                    :disabled="is_courtesy_pay_disabled"
                    data-testid="checkbox-is-courtesy-pay"
                    binary
                />
                <label for="is_courtesy_pay"> Courtesy Pay </label>
            </div>
            <div v-if="is_courtesy_pay" class="flex flex-col gap-2 mt-3">
                <label for="courtesy_reason" class="font-bold">
                    Reason for Courtesy Pay
                </label>
                <Textarea
                    v-model="courtesy_reason"
                    id="courtesy_reason"
                    autoResize
                    rows="3"
                    placeholder="Enter reason..."
                    data-testid="textarea-courtesy-reason"
                />
            </div>

            <divider class="mb-1" />
        </div>

        <template #footer>
            <Button
                :label="$t('buttons.cancel')"
                text
                data-testid="btn-approve-expense-cancel"
                @click="dialog = false"
            />
            <Button
                :label="$t('buttons.confirm')"
                data-testid="btn-approve-expense-confirm"
                @click="approveExpense"
            />
        </template>
    </Dialog>
</template>

<style scoped lang="scss"></style>
