<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import helpers from '@/utils/helpers';
import {getNestedValue, toSnakeCase} from '@/modules/claims/utils/helper.js';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import { createExpenseApprovalData, createExpenseCoverageData, createExpenseData } from '@/modules/claims/config/expenses.js';
import BenefitOverlay from '@/modules/claims/components/benefits/BenefitOverlay.vue';
import BeneficiaryOverlay from '@/modules/claims/components/shared/BeneficiaryOverlay.vue';
import ExpenseDetailsForm from '@/modules/claims/components/expenses/details/ExpenseDetailsForm.vue';
import ApprovalExpenseOverlay from '@/modules/claims/components/shared/ApprovalExpenseOverlay.vue';

const props = defineProps({
    currentExpenseIndex: { type: Number }
});

const { t } = useI18n();
const route = useRoute();
const opBenefit = ref();
const opBeneficiary = ref();
const opApprovedTooltip = ref();
const formRef = ref(null);
const showExpenseDetails = ref(true);
const showEditExpenseForm = ref(false);

const expenseData = createExpenseData(t);
const expenseCoverageData = createExpenseCoverageData(t);
const expenseApprovalData = createExpenseApprovalData(t);

const { currentExpense, currentBenefit, searchExpenseBenefit } = useExpenseStore();

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
    <Card>
        <template #header>
            <div class="flex justify-between items-center">
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
                <div class="grid grid-cols-3 gap-4 mt-3" v-for="expenseDataItem in expenseData">
                    <div
                        class="font-semibold py-1"
                        :data-testid="'label-expense-detail-' + toSnakeCase(expenseDataItem.label)"
                    >
                        {{ expenseDataItem.label }}
                    </div>
                    <div
                        class="col-span-2 py-1 p-break-word"
                        v-if="expenseDataItem.label === 'Expense ID'"
                        data-testid="text-expense-detail-expense-id"
                    >
                        EXP-{{ helpers.formatDate(currentExpense?.service_date, 'YYYYMMDD') }}-{{ String(props.currentExpenseIndex + 1).padStart(4, '0') }}
                    </div>
                    <div
                        class="col-span-2 py-1 p-break-word"
                        v-else-if="expenseDataItem.type === 'date'"
                        :data-testid="'text-expense-detail-' + toSnakeCase(expenseDataItem.label)"
                    >
                        {{ helpers.formatDate(getNestedValue({ currentExpense }, expenseDataItem.field)) }}
                    </div>
                    <div
                        class="col-span-2 py-1 p-break-word"
                        v-else-if="expenseDataItem.type === 'currency'"
                        :data-testid="'text-expense-detail-' + toSnakeCase(expenseDataItem.label)"
                    >
                        {{ helpers.moneyFormat(getNestedValue({ currentExpense }, expenseDataItem.field)) }} CAD
                    </div>
                    <div
                        class="col-span-2 py-1 p-break-word"
                        :data-testid="'text-expense-detail-' + toSnakeCase(expenseDataItem.label)"
                        v-else
                    >
                        <a class="underline text-blue-800 cursor-pointer" v-if="expenseDataItem.type === 'link'" @click="showBenefitOverlayPanel">{{ getNestedValue({ currentExpense }, expenseDataItem.field) }}</a>
                        <span v-else>{{ getNestedValue({ currentExpense }, expenseDataItem.field) }}</span>
                    </div>
                </div>

                <Popover ref="opBenefit" class="w-[33rem]">
                    <BenefitOverlay class="p-1" />
                </Popover>

                <Divider />

                <div class="grid grid-cols-3 gap-4 mt-1" v-for="expenseCoverageDataItem in expenseCoverageData">
                    <div
                        class="font-semibold py-1"
                        data-testid="label-coverage-include"
                    >
                        {{ expenseCoverageDataItem.label }}
                    </div>
                    <div
                        class="col-span-2 py-1 p-break-word"
                        v-if="expenseCoverageDataItem.label === 'Coverage Incl.'"
                        data-testid="text-expense-id"
                    >
                        {{ currentBenefit ? 'Yes' : 'No' }}
                    </div>
                    <div
                        class="col-span-2 py-1 p-break-word"
                        v-else-if="expenseCoverageDataItem.type === 'currency'"
                        data-testid="text-expense-id"
                    >
                        {{ helpers.moneyFormat(getNestedValue({ currentBenefit }, expenseCoverageDataItem.field)) }} CAD
                    </div>
                    <div
                        class="col-span-2 py-1 p-break-word"
                        data-testid="text-coverage-include"
                        v-else
                    >
                        {{ expenseCoverageDataItem.label === 'Coverage' ?
                            getNestedValue({ currentBenefit }, expenseCoverageDataItem.field) + '%'
                            : getNestedValue({ currentBenefit }, expenseCoverageDataItem.field) }}
                    </div>
                </div>

                <divider v-if="currentExpense.status === 'approved'" />

                <div
                    class="grid grid-cols-3 gap-4 mt-1"
                    v-if="currentExpense.status === 'approved'"
                    v-for="expenseApprovalDataItem in expenseApprovalData"
                >
                    <div
                        class="font-semibold py-1"
                        data-testid="label-coverage-left"
                    >
                        {{ expenseApprovalDataItem.label }}
                    </div>
                    <div
                        class="col-span-2 py-1 p-break-word"
                        data-testid="text-coverage-left"
                        v-if="expenseApprovalDataItem.type === 'date'"
                    >
                        {{ helpers.formatDate(getNestedValue({ currentExpense }, expenseApprovalDataItem.field), 'DD-MMM-YYYY h:mm a') }}
                    </div>
                    <div
                        class="col-span-2 py-1 p-break-word items-center"
                        data-testid="text-coverage-left"
                        v-else-if="expenseApprovalDataItem.type === 'currency'"
                        @click="showApprovedTooltip"
                    >
                        {{ helpers.moneyFormat(getNestedValue({ currentExpense }, expenseApprovalDataItem.field)) }} CAD
                        <i class="pi pi-info-circle pl-1 cursor-pointer"/>
                    </div>
                    <div
                        class="col-span-2 py-1 p-break-word"
                        data-testid="text-coverage-left"
                        v-else
                    >
                        Jone Doe (you)
                    </div>
                </div>

                <Popover v-if="currentExpense.status === 'approved'" ref="opApprovedTooltip" class="p-0! w-[30rem] approval-expense-overlay" :pt="{ root: 'custom-popover' }">
                    <ApprovalExpenseOverlay :expense="currentExpense" />
                </Popover>
            </div>
            <div v-else>
                <ExpenseDetailsForm ref="formRef" />
            </div>
        </template>
    </Card>
</template>

<style scoped lang="scss"></style>
