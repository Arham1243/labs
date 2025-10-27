<script setup>
import helpers from '@/utils/helpers';
import { ref } from 'vue';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import BenefitOverlay from '@/modules/claims/components/benefits/BenefitOverlay.vue';
import BeneficiaryOverlay from '@/modules/claims/components/shared/BeneficiaryOverlay.vue';
import ExpenseDetailsForm from '@/modules/claims/components/expenses/details/ExpenseDetailsForm.vue';
import { useRoute } from 'vue-router';

const props = defineProps({
    currentExpenseIndex: { type: Number }
});

const route = useRoute();
const opBenefit = ref();
const opBeneficiary = ref();
const opApprovedTooltip = ref();
const formRef = ref(null);
const showExpenseDetails = ref(true);
const showEditExpenseForm = ref(false);

const { currentExpense, currentBenefit, searchExpenseBenefit } =
    useExpenseStore();

/**
 * Show Benefit overlay panel
 * @param event
 */
const showBenefitOverlayPanel = (event) => {
    opBenefit.value.toggle(event);
};

/**
 * Show Beneficiary overlay panel
 * @param event
 */
const showBeneficiaryOverlayPanel = (event) => {
    opBeneficiary.value.toggle(event);
};

/**
 * Show approved tooltip
 * @param event
 */
const showApprovedTooltip = (event) => {
    opApprovedTooltip.value.toggle(event);
};

// Call child's saving expense method
const saveExpense = async () => {
    if (formRef.value) {
        const success = await formRef.value.saveExpense();

        // Only proceed if save was successful
        if (success) {
            // Reload policy benefit data after successful save
            await searchExpenseBenefit(
                route.params.clientId,
                currentExpense.value.benefit.id
            );
            showEditExpenseForm.value = false;
        }
    }
};
</script>

<template>
    <Card class="pt-3">
        <template #header>
            <div class="flex justify-content-between align-items-center">
                <div>
                    <p
                        class="font-semibold"
                        data-testid="title-expense-details"
                    >
                        <span
                            class="p-button-icon pi pi-chevron-down pr-4 cursor-pointer"
                            data-pc-section="icon"
                            data-testid="btn-show-expense-details"
                            v-if="showExpenseDetails"
                            @click="showExpenseDetails = !showExpenseDetails"
                        ></span>
                        <span
                            class="p-button-icon pi pi-chevron-right pr-4 cursor-pointer"
                            data-pc-section="icon"
                            data-testid="btn-show-expense-details"
                            v-else
                            @click="showExpenseDetails = !showExpenseDetails"
                        ></span>
                        {{ $t('expenses.expense_details') }}
                    </p>
                </div>
                <div>
                    <Button
                        v-if="
                            !showEditExpenseForm &&
                            currentExpense.status !== 'approved' &&
                            currentExpense.status !== 'declined'
                        "
                        class="cursor-pointer"
                        icon="pi pi-pencil"
                        text
                        @click="showEditExpenseForm = true"
                        data-testid="btn-close-expense-details"
                    />
                    <Button
                        v-if="showEditExpenseForm"
                        class="cursor-pointer"
                        :label="$t('buttons.cancel')"
                        text
                        @click="showEditExpenseForm = false"
                        data-testid="btn-close-expense-details-form"
                    />
                    <Button
                        v-if="showEditExpenseForm"
                        class="cursor-pointer"
                        :label="$t('buttons.save')"
                        icon="pi pi-check"
                        iconPos="left"
                        data-testid="btn-edit-expense"
                        @click="saveExpense"
                    />
                </div>
            </div>
        </template>
        <template #content v-if="showExpenseDetails">
            <div v-if="!showEditExpenseForm">
                <div class="grid mt-3">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-expense-id"
                    >
                        {{ $t('expenses.expense_id') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-expense-id"
                    >
                        EXP-{{
                            helpers.formatDate(
                                currentExpense?.service_date,
                                'YYYYMMDD'
                            )
                        }}-{{
                            String(props.currentExpenseIndex + 1).padStart(
                                4,
                                '0'
                            )
                        }}
                    </div>
                </div>
                <div class="grid mt-1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-benefit-code"
                    >
                        {{ $t('expenses.service_code') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-benefit-code"
                    >
                        {{ currentExpense?.service_code?.name }}
                    </div>
                </div>
                <div class="grid mt-1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-benefit"
                    >
                        {{ $t('common.benefit') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-benefit"
                    >
                        <a
                            class="underline cursor-pointer"
                            @mouseover="showBenefitOverlayPanel"
                        >
                            {{ currentExpense.benefit.name.en }}
                        </a>
                    </div>
                    <OverlayPanel ref="opBenefit" class="w-25rem">
                        <BenefitOverlay />
                    </OverlayPanel>
                </div>
                <div class="grid mt-1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-benefit-code"
                    >
                        {{ $t('expenses.din') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-benefit-code"
                    >
                        -
                    </div>
                </div>
                <div class="grid mt-1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-service-date"
                    >
                        {{ $t('expenses.service_date') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-service-date"
                    >
                        {{ helpers.formatDate(currentExpense.service_date) }}
                    </div>
                </div>
                <div class="grid mt-1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-expense-amount"
                    >
                        {{ $t('expenses.expense_amount') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-expense-amount"
                    >
                        {{ helpers.moneyFormat(currentExpense.amount_claimed) }}
                        CAD
                    </div>
                </div>
                <div class="grid mt-1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-beneficiary"
                    >
                        {{ $t('expenses.beneficiary') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-beneficiary"
                    >
                        <a
                            class="underline cursor-pointer"
                            @mouseover="showBeneficiaryOverlayPanel"
                        >
                            {{ currentExpense.beneficiary.name }}
                        </a>
                        <OverlayPanel
                            ref="opBeneficiary"
                            :style="{ width: '450px' }"
                        >
                            <BeneficiaryOverlay
                                :beneficiary="{
                                    name: currentExpense.beneficiary.name
                                }"
                            />
                        </OverlayPanel>
                    </div>
                </div>

                <div class="grid mt-1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-insured-notes"
                    >
                        {{ $t('expenses.reason_for_visit') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-insured-notes"
                    >
                        {{ currentExpense.description }}
                    </div>
                </div>
                <div class="grid mt-1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-diagnosis"
                    >
                        {{ $t('expenses.diagnosis') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-diagnosis"
                    >
                        {{ currentExpense.diagnosis }}
                    </div>
                </div>

                <Divider />

                <div class="grid mt-1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-coverage-include"
                    >
                        {{ $t('expenses.coverage_incl') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-coverage-include"
                    >
                        {{ currentBenefit ? 'Yes' : 'No' }}
                    </div>
                </div>

                <div class="grid mt-1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-coverage"
                    >
                        {{ $t('expenses.coverage') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-coverage"
                    >
                        {{
                            currentBenefit?.coverage
                                ? currentBenefit.coverage + '%'
                                : '-'
                        }}
                    </div>
                </div>

                <div class="grid mt-1" v-if="1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-to-maximum-of"
                    >
                        {{ $t('expenses.to_maximum_of') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
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

                <div class="grid mt-1" v-if="1">
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-coverage-left"
                    >
                        {{ $t('expenses.coverage_left') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
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

                <divider v-if="currentExpense.status === 'approved'" />

                <div
                    class="grid mt-1"
                    v-if="currentExpense.status === 'approved'"
                >
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-coverage-left"
                    >
                        {{ $t('expenses.approved_total') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-coverage-left"
                    >
                        {{
                            helpers.moneyFormat(currentExpense.amount_approved)
                        }}
                        CAD
                        <i
                            class="pi pi-info-circle cursor-pointer"
                            @mouseover="showApprovedTooltip"
                        />
                        <OverlayPanel
                            ref="opApprovedTooltip"
                            class="expense-approved-tooltip"
                            :style="{ width: '290px', background: '#495057' }"
                        >
                            <div class="grid m-1">
                                <div
                                    class="col-7 font-semibold py-1 text-white"
                                    data-testid="label-approved-amount"
                                >
                                    {{ $t('expenses.approval_amt') }}
                                </div>
                                <div
                                    class="col-5 py-1 p-break-word text-white text-right"
                                    data-testid="text-approved-amount"
                                >
                                    {{
                                        helpers.moneyFormat(
                                            currentExpense.amount_approved
                                        )
                                    }}
                                    CAD
                                </div>
                            </div>
                            <div class="grid m-1">
                                <div
                                    class="col-7 font-semibold py-1 text-white"
                                    data-testid="label-co-pay-amt"
                                >
                                    {{ $t('expenses.co_pay_amt') }} ({{
                                        parseFloat(
                                            currentExpense.amount_co_pay /
                                                currentExpense.amount_approved
                                        ).toFixed(2) * 100
                                    }}%)
                                </div>
                                <div
                                    class="col-5 py-1 p-break-word text-white text-right"
                                    data-testid="text-co-pay-amt"
                                >
                                    {{
                                        helpers.moneyFormat(
                                            currentExpense.amount_co_pay
                                        )
                                    }}
                                    CAD
                                </div>
                            </div>
                            <div class="grid m-1">
                                <div
                                    class="col-7 font-semibold py-1 text-white"
                                    data-testid="label-approved-total"
                                >
                                    {{ $t('expenses.approved_total') }}
                                </div>
                                <div
                                    class="col-5 py-1 p-break-word text-white text-right"
                                    data-testid="text-approved-total"
                                >
                                    {{
                                        helpers.moneyFormat(
                                            currentExpense.amount_approved -
                                                currentExpense.amount_co_pay
                                        )
                                    }}
                                    CAD
                                </div>
                            </div>
                        </OverlayPanel>
                    </div>
                </div>

                <div
                    class="grid mt-1"
                    v-if="currentExpense.status === 'approved'"
                >
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-approved-by"
                    >
                        {{ $t('expenses.approved_by') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-approved-by"
                    >
                        <!-- Change it to the real data later -->
                        John Doe (you)
                    </div>
                </div>

                <div
                    class="grid mt-1"
                    v-if="currentExpense.status === 'approved'"
                >
                    <div
                        class="col-5 font-semibold py-1"
                        data-testid="label-approved-on"
                    >
                        {{ $t('expenses.approved_on') }}
                    </div>
                    <div
                        class="col-7 py-1 p-break-word"
                        data-testid="text-approved-on"
                    >
                        {{
                            helpers.formatDate(
                                currentExpense.updated_at,
                                'DD-MMM-YYYY h:mm a'
                            )
                        }}
                    </div>
                </div>
            </div>
            <div v-else>
                <ExpenseDetailsForm ref="formRef" />
            </div>
        </template>
    </Card>
</template>

<style scoped lang="scss"></style>
