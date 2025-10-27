<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import ExpenseCard from '@/modules/claims/components/expenses/details/ExpenseCard.vue';

const route = useRoute();
const router = useRouter();
const currentExpenseIndex = ref(0);
const emits = defineEmits(['showExpenseLists']);
const { currentExpenses, currentExpense } = useExpenseStore();
/**
 * Watch for the current expense changes
 */
watch(
    () => currentExpense.value,
    () => {
        updateCurrentExpenseIndex();
    }
);

/**
 * On Mounted
 */
onMounted(() => {
    // Update current expense index
    updateCurrentExpenseIndex();
});

/**
 * Paginate expense
 * @param direction
 */
const paginateExpense = (direction) => {
    if (direction === 'next') {
        router.replace({
            name: 'Expenses',
            params: {
                submissionId: route.params.submissionId,
                expenseId:
                    currentExpenses.value[currentExpenseIndex.value + 1].id
            }
        });
    } else if (direction === 'previous') {
        router.replace({
            name: 'Expenses',
            params: {
                submissionId: route.params.submissionId,
                expenseId:
                    currentExpenses.value[currentExpenseIndex.value - 1].id
            }
        });
    }
};

/**
 * Update current expense index
 */
const updateCurrentExpenseIndex = () => {
    // Get the index number of the current expense
    currentExpenseIndex.value = currentExpenses.value.findIndex(
        (expense) => expense.id === currentExpense.value.id
    );
};
</script>

<template>
    <div class="mt-2">
        <div class="flex justify-between items-center py-3">
            <div class="flex gap-3 items-center">
                <Button
                    data-testid="btn-open-expenses-lists"
                    outlined
                    @click="emits('showExpenseLists')"
                    icon="pi pi-times"
                    size="large"
                />
                <h5 class="mt-0" data-testid="text-expense-pagination">
                    {{ $t('expenses.expense') }}
                    {{ currentExpenseIndex + 1 }} /
                    {{ currentExpenses.length }}
                </h5>
                <ClaimStatusTag
                    class="text-sm"
                    :status="currentExpense?.status"
                    :icon="
                        currentExpense?.status === 'approved'
                            ? 'pi pi-check'
                            : currentExpense?.status === 'declined'
                              ? 'pi pi-times'
                              : 'pi pi-eye'
                    "
                    data-testid="tag-expense-status"
                />
            </div>

            <div class="flex gap-2">
                <Button
                    outlined
                    data-testid="btn-goto-next-expense"
                    :disabled="currentExpenseIndex === 0"
                    @click="paginateExpense('previous')"
                    icon="pi pi-angle-left"
                    size="large"
                />
                <Button
                    outlined
                    data-testid="btn-goto-previous-expense"
                    :disabled="currentExpenseIndex === currentExpenses.length - 1"
                    @click="paginateExpense('next')"
                    icon="pi pi-angle-right"
                    size="large"
                />
            </div>
        </div>
    </div>

    <ExpenseCard :currentExpenseIndex="currentExpenseIndex" />
</template>
