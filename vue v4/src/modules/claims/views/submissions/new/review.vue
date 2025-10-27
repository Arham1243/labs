<script setup>
import { cfg, errorCounts } from '@/modules/claims/utils/submissions';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useClaimPolicyStore } from '@/modules/claims/stores/Policy';
import { ref, watch } from 'vue';
import helpers from '@/utils/helpers';
import { useClaimInsuredStore } from '@/modules/claims/stores/Insured';
import { useGeneralStore } from '@/modules/claims/stores/General';
import { useRoute, useRouter } from 'vue-router';
import SubmissionExpenseForm from '@/modules/claims/components/submissions/SubmissionExpenseForm.vue';
import { useConfirm } from 'primevue/useconfirm';

const route = useRoute();
const router = useRouter();

let step = cfg.claims_process.claimSteps[4];

const { newSubmission, setSubmissionExpenseData } = useSubmissionStore();
const { currentInsured } = useClaimInsuredStore();
const { currentPolicy } = useClaimPolicyStore();
const { countries, provinces } = useGeneralStore();

//
const insuredData = ref([]);

watch(
    () => currentInsured,
    () => {
        if (currentInsured?.value?.id && countries.value?.length) {
            let insured = currentInsured.value;
            let country = countries?.value?.filter(
                (item) => item.id === insured.country_id
            )[0].name;
            insuredData.value = [
                {
                    label: 'Name',
                    value: `${insured.first_name} ${insured.last_name}`
                },
                {
                    label: 'Policy Number',
                    value: insured.policies[0].policy_number
                },
                { label: 'Email', value: insured.email },
                { label: 'Phone', value: insured.phone_number },
                {
                    label: 'Address',
                    value: `${insured.address}, ${insured.city}, ${insured.postal_code}, ${insured.province_id}, ${country}`
                }
            ];
        }
    },
    { immediate: true, deep: true }
);

//
// Expense

const expenseData = ref([]);

watch(
    () => newSubmission?.value?.expenses,
    () => {
        if (
            newSubmission?.value?.expenses.length &&
            newSubmission?.value?.expenses[0].service_date
        ) {
            let expenses = newSubmission?.value?.expenses;

            expenseData.value = expenses.map((expense) => {
                let benefit = currentPolicy?.value?.benefits.find(
                    (benefit) => benefit.id === expense.benefit_id
                );
                let service_code = benefit?.service_codes.find(
                    (service_code) =>
                        service_code.id === expense.service_code_id
                );
                return [
                    { label: 'Service Type', value: benefit?.name },
                    { label: 'Service Code', value: service_code?.code },
                    {
                        label: 'Service Date',
                        value: helpers.formatDate(expense?.service_date)
                    },
                    {
                        label: 'Amount',
                        value: `${newSubmission.value.currency?.symbol} ${
                            expense?.amount
                                ? expense.amount.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                  }) +
                                  ' ' +
                                  newSubmission.value.currency?.id
                                : ''
                        }`, // helpers.moneyFormat(expense.amount)
                        amount: `${
                            expense?.amount ? expense.amount.toFixed(2) : ''
                        }`
                    },
                    {
                        label: 'Service Description',
                        value: expense?.description
                    }
                ];
            });
        }
    },
    { immediate: true, deep: true }
);

const payeeData = ref([]);

watch(
    () => newSubmission?.value?.payee,
    () => {
        if (newSubmission?.value?.payee.payee) {
            let payee = newSubmission?.value?.payee;
            let insured = currentInsured.value;
            payeeData.value = [
                {
                    label: 'Payee',
                    value:
                        payee.payee === 'Self'
                            ? `Me (${insured.first_name} ${insured.last_name})`
                            : payee.payee
                },
                {
                    label: 'Payment Method',
                    value: payee.payment_method?.replace(/_/g, ' '),
                    cls: 'capitalize'
                }
                // { label: 'Document', value: payee.document }
            ];
        }
    },
    { immediate: true, deep: true }
);

const link = (path = '') =>
    router.push(
        `/claims/submissions/new/${path}?client_id=${route.query.client_id}&insured_id=${route.query.insured_id}&policy_id=${route.query.policy_id}&q=${route.query.q}`
    );

let visible = ref(false);
let disabled = ref(true);
let expenseIndex = ref(0);
let expenseLabel = ref('Add New Expense');
let expenseBtnLabel = ref('Add Expense');

const updateExpense = (index, edit = false) => {
    visible.value = true;
    expenseLabel.value = edit ? 'Edit Expense' : 'Add New Expense';
    expenseBtnLabel.value = edit ? 'Update Expense' : 'Add Expense';
    expenseIndex.value = edit
        ? index
        : newSubmission.value.formData.details?.expenses?.length || 0;
};

watch(
    () => newSubmission.value.formData,
    () => {
        disabled.value = !!errorCounts(
            1,
            newSubmission.value.formData?.popup_expense,
            true
        );
    },
    { deep: true, immediate: true }
);

// Handling Duplicate Entries
const confirm = useConfirm();
const duplicateEntry = () => {
    confirm.require({
        message:
            'It looks like you are trying to add the same expense again. Please review your documents and try again.',
        header: 'Notice',
        icon: '',
        rejectClass: 'hidden',
        rejectLabel: '',
        acceptLabel: 'OK',
        // acceptIcon: 'pi pi-check',
        accept: () => {},
        reject: () => {}
    });
};

const saveExpense = () => {
    // Check if similar expense exists
    let exp = newSubmission.value.formData.popup_expense;

    let checkExpense = newSubmission.value.formData.details.expenses.findIndex(
        (expense) =>
            expense.medical_service_type.id === exp.medical_service_type?.id &&
            expense.visit_cost === exp.visit_cost &&
            helpers.parseDate(expense.service_date) ===
                helpers.parseDate(exp.service_date)
    );

    if (checkExpense > -1 && checkExpense !== expenseIndex.value) {
        duplicateEntry();
        return;
    }

    // Set saving expense is in progress, then close dialog
    let newExpenseData = JSON.parse(JSON.stringify(exp));
    newSubmission.value.formData.details.expenses[expenseIndex.value] =
        newExpenseData;
    setSubmissionExpenseData(newExpenseData, expenseIndex.value);

    // clear popup temp data
    newSubmission.value.formData.popup_expense = {};
    visible.value = false;
};

const removeExpense = (index) => {
    if (expenseData.value.length > 1) {
        newSubmission.value.formData.details?.expenses.splice(index, 1);
        newSubmission.value.expenses.splice(index, 1);
    }
};

const retractChanges = () => {
    // clear popup temp data
    newSubmission.value.formData.popup_expense = {};
    visible.value = false;
};
</script>
<template>
    <h3 data-testid="text-step">{{ step.description }}</h3>

    <!-- Policy Holder  -->
    <div class="card mt-6">
        <div class="flex justify-between items-center">
            <h4
                class="text-xl"
                data-testid="text-title-policy"
                v-text="'Policy Holder'"
            />
            <Button
                label="Edit"
                icon="pi pi-pencil"
                size="small"
                outlined
                class="py-2"
                @click="link()"
                data-testid="btn-edit-policy-holder"
            />
        </div>
        <divider />
        <div
            v-if="insuredData?.length"
            v-for="insured in insuredData"
            :key="insured.label"
            class="flex mt-6"
        >
            <b
                class="w-44 shrink-0"
                v-text="insured.label + ':'"
                :data-testid="
                    'text-policy-label-' +
                    insured.label.toLowerCase().replace(' ', '-')
                "
            />
            <div
                v-text="insured.value"
                :data-testid="
                    'text-policy-value-' +
                    insured.label.toLowerCase().replace(' ', '-')
                "
            />
        </div>
        <pre v-if="0" class="text-xs" v-text="insuredData" />
    </div>

    <!-- Claim Info / Expense  -->
    <div class="card">
        <h4
            class="text-xl"
            v-text="'Claim Information'"
            data-testid="text-title-claim-info"
        />
        <divider />
        <div
            v-for="(expenses, i) in expenseData"
            :key="expenses"
            class="mt-6 mb-6 pb-6 border-b border-gray-300"
        >
            <div class="flex justify-between items-center mb-6">
                <h5
                    class="text-lg"
                    :data-testid="'text-title-expense-' + (i + 1)"
                >
                    Expense {{ i + 1 }}
                </h5>
                <div class="flex gap-2">
                    <Button
                        label="Edit"
                        icon="pi pi-pencil"
                        size="small"
                        outlined
                        class="py-2"
                        @click="updateExpense(i, true)"
                        :data-testid="'btn-edit-expense-' + (i + 1)"
                    />
                    <Button
                        v-if="expenseData.length > 1"
                        icon="pi pi-trash"
                        size="small"
                        severity="danger"
                        class="py-2"
                        @click="removeExpense(i)"
                        :data-testid="'btn-remove-expense-' + (i + 1)"
                    />
                </div>
            </div>
            <div
                v-for="expense in expenses"
                :key="expense.label"
                class="flex mt-6"
            >
                <b
                    class="w-44"
                    v-text="expense.label + ':'"
                    :data-testid="
                        'text-expense-label-' +
                        expense.label.toLowerCase().replace(' ', '-') +
                        '-' +
                        (i + 1)
                    "
                />
                <div
                    v-text="expense.value"
                    :data-testid="
                        'text-expense-value-' +
                        expense.label.toLowerCase().replace(' ', '-') +
                        '-' +
                        (i + 1)
                    "
                />
            </div>
        </div>

        <Button
            v-if="expenseData.length < cfg.maximum_expenses"
            label="Add Another Expense"
            icon="pi pi-plus"
            size="small"
            class="!py-2.5"
            data-testid="btn-add-another-expense"
            @click="updateExpense"
        />
        <div v-else class="text-yellow-600">
            <i class="pi pi-info-circle" /> You can only add up to
            {{ cfg.maximum_expenses }} expenses per submission
        </div>
    </div>

    <!-- Payee  -->
    <div class="card">
        <div class="flex justify-between items-center">
            <h4
                class="text-xl"
                v-text="'Payment Information'"
                data-testid="text-title-payee"
            />
            <Button
                label="Edit"
                icon="pi pi-pencil"
                size="small"
                outlined
                class="py-2"
                @click="link('payee')"
                data-testid="btn-edit-payee"
            />
        </div>
        <divider />
        <div
            v-if="payeeData?.length"
            v-for="payee in payeeData"
            :key="payee.label"
            class="flex mt-6"
        >
            <b
                class="w-44 shrink-0"
                v-text="payee.label + ':'"
                :data-testid="
                    'text-payee-label-' +
                    payee.label.toLowerCase().replace(' ', '-')
                "
            />
            <div
                v-text="payee.value"
                :class="payee.cls"
                :data-testid="
                    'text-payee-value-' +
                    payee.label.toLowerCase().replace(' ', '-')
                "
            />
        </div>
        <pre v-if="0" class="text-xs" v-text="payeeData" />
    </div>

    <Dialog
        v-model:visible="visible"
        modal
        :header="expenseLabel"
        :style="{ maxWidth: '56rem', width: '80%' }"
        data-testid="dialog-expense"
    >
        <div class="px-3">
            <SubmissionExpenseForm
                :Index="expenseIndex"
                :popup="true"
                :addNew="expenseLabel !== 'Edit Expense'"
            />

            <div class="flex justify-end gap-2 mt-6">
                <Button
                    type="button"
                    label="Cancel"
                    link
                    @click="retractChanges"
                    data-testid="dialog-btn-cancel-expense"
                />
                <Button
                    type="button"
                    :label="expenseBtnLabel"
                    icon="pi pi-check"
                    data-testid="dialog-btn-save-expense"
                    :disabled="disabled"
                    @click="saveExpense"
                />
            </div>
        </div>
    </Dialog>
</template>
