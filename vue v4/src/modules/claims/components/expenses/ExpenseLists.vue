<script setup>
import { inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import helpers from '@/utils/helpers';
import { useRoute, useRouter } from 'vue-router';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import ExpenseForm from '@/modules/claims/components/expenses/ExpenseForm.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const user = inject('currentUser');
const openNewExpenseForm = ref();
const emits = defineEmits(['showExpenseLists']);
const expenseStore = useExpenseStore();
const submissionStore = useSubmissionStore();
const { currentExpenses } = useExpenseStore();

/**
 * Show expense details
 * @param expense
 * @param event
 */
const showExpenseDetails = (expense, event) => {
    if (!event.target?.classList?.contains('p-checkbox-box')) {
        emits('showExpenseLists', expense.id);
    }
};

/**
 * Create expense
 * @param payload
 */
const createExpense = async (payload) => {
    try {
        payload.user_id = user.value.id;
        const res = await expenseStore.createExpense(route.params.clientId, {
            ...payload,
            submission_id: submissionStore.currentSubmission.id
        });

        openNewExpenseForm.value = false;

        // redirect to the new expense
        await router.push({
            name: 'Expenses',
            params: {
                submissionId: submissionStore.currentSubmission.id,
                expenseId: res.data.id
            }
        });
    } catch (error) {
        console.log(error);
    }
};
</script>

<template>
    <div class="flex justify-between">
        <Button
            :label="t('claims.filter')"
            icon="pi pi-filter"
            iconPos="right"
            class="p-button-outlined mr-2"
            data-testid="btn-filter"
        />
        <Button
            :label="t('expenses.new_expense')"
            icon="pi pi-plus"
            iconPos="left"
            class="p-button-outlined"
            data-testid="btn-open-new-expense-sidebar"
            @click="openNewExpenseForm = true"
        />
    </div>

    <Card
        v-for="expense in currentExpenses"
        :key="expense.id"
        class="mb-12 mt-12 shadow pb-2 cursor-pointer"
        @click="showExpenseDetails(expense, $event)"
    >
        <template #content>
            <div class="grid m-0">
                <div class="col-12 p-0">
                    <div
                        class="flex justify-between items-center"
                    >
                        <h6 :data-testid="'text-benefit-title' + expense.id">
                            {{ expense.benefit_name }}
                        </h6>
                        <ClaimStatusTag
                            class="text-sm"
                            :status="expense.status"
                            :icon="
                                expense.status === 'approved'
                                    ? 'pi pi-check'
                                    : expense.status === 'declined'
                                      ? 'pi pi-times'
                                      : 'pi pi-eye'
                            "
                            data-testid="tag-submission-status"
                        />
                    </div>
                    <div
                        class="flex justify-content-between align-content-center mt-2 mb-3"
                    >
                        <p data-testid="text-expense-amount-and-date">
                            {{ helpers.formatDate(expense.created_at) }} •
                            {{ helpers.moneyFormat(expense.amount_claimed) }}
                            CAD
                        </p>
                    </div>
                </div>
            </div>
        </template>
    </Card>

    <Drawer
        v-model:visible="openNewExpenseForm"
        position="right"
        class="new-expense-sidebar"
    >
        <h5>{{ $t('expenses.new_expense') }}</h5>
        <ExpenseForm
            @createExpense="
                (payload) => {
                    createExpense(payload);
                }
            "
            @closeExpenseForm="openNewExpenseForm = false"
        />
    </Drawer>
</template>
