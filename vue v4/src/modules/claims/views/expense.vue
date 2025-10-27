<script setup>
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useClaimStore } from '@/modules/claims/stores/index.js';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import { useActivityStore } from '@/stores/Activity.js';
import { useFeedStore } from '@/stores/Feed';
import ExpenseHeader from '@/modules/claims/components/expenses/ExpenseHeader.vue';
import DocumentsPreview from '@/modules/claims/components/documents/DocumentsPreview.vue';
import ExpenseLists from '@/modules/claims/components/expenses/ExpenseLists.vue';
import ExpenseDetails from '@/modules/claims/components/expenses/details/ExpenseDetails.vue';
import ClaimMeterReservedAmount from '@/modules/claims/components/claims/ClaimMeterReservedAmount.vue';
import ReservedAmountDialog from '@/modules/claims/components/claims/dialogs/ReservedAmountDialog.vue';

const route = useRoute();
const router = useRouter();

// Get submission id, expense id and client id from the route
let submissionId = route.params.submissionId;
let expenseId = route.params.expenseId;
let clientId = route.params.clientId;

const { setCurrentModule } = useActivityStore();
const { currentClaim } = useClaimStore();
const { getSubmissionById } = useSubmissionStore();
const { loading: submissionLoading } = getSubmissionById(
    clientId,
    submissionId
);
const { getAllFeeds, setFilter } = useFeedStore();
getAllFeeds(clientId, {
    filters: [{ field: 'feedable_type', value: 'note' }],
    scopes: [{ name: 'ForEntity', parameters: ['expense', expenseId] }]
});
const { getExpenseById } = useExpenseStore();
let expenseLoading = ref(false);

// Show Reserved Amount Dialog
const showDialog = ref(false);
const showExpenseLists = ref(false);

/**
 * Watch for route changes
 */
watch(
    () => route.params.expenseId,
    (newExpenseId) => {
        // Set current module and module ID for activities
        setCurrentModule('expense', newExpenseId);

        // Set filter for feeds
        setFilter([{ field: 'feedable_type', value: 'note' }]);

        // Fetch or update the content for the new expenseId
        const { loading } = getExpenseById(clientId, newExpenseId, true);
        expenseLoading = loading;
    },
    { immediate: true }
);
</script>

<template>
    <div v-if="!submissionLoading && !expenseLoading">
        <ExpenseHeader />
        <div class="flex">

            <DocumentsPreview class="grow" />

            <div class="h-[calc(100vh-5.6rem)] min-w-[30vw] max-w-[32rem] flex-shrink-0 pt-3 pb-12 px-8 overflow-auto">
                <ClaimMeterReservedAmount
                    v-if="currentClaim"
                    :claim="currentClaim"
                    :expenseDetail="true"
                    :minimal="true"
                    v-model:showDialog="showDialog"
                    class="mt-5"
                />

                <ReservedAmountDialog
                    v-if="currentClaim"
                    :claim="currentClaim"
                    v-model:visible="showDialog"
                />

                <ExpenseDetails
                    v-if="!showExpenseLists"
                    @showExpenseLists="
                        () => {
                            // Change showExpenseLists to the opposite value
                            showExpenseLists = !showExpenseLists;
                        }
                    "
                />

                <ExpenseLists
                    v-else
                    @showExpenseLists="
                        (payload) => {
                            showExpenseLists = false;
                            router.push({
                                name: 'Expenses',
                                params: {
                                    submissionId: submissionId,
                                    expenseId: payload
                                }
                            });
                        }
                    "
                />
            </div>
        </div>
    </div>
</template>
<style scoped>
.panel-expense {
    max-width: 30% !important;
}
</style>
