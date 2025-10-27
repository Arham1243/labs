<script setup>
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import helpers from '@/utils/helpers';
import { ref, watch } from 'vue';

// import the dialog
import ReservedAmountDialog from '@/modules/claims/components/claims/dialogs/ReservedAmountDialog.vue';
import { useClaimStore } from '@/modules/claims/stores/index.js';
import { useRoute } from 'vue-router';

const { params } = useRoute();

const { currentSubmission } = useSubmissionStore();
let { reservedAmt } = useExpenseStore();
const { currentClaim, getClaimById } = useClaimStore();

watch(
    () => currentSubmission.value?.claim?.id,
    () => {
        if (currentSubmission.value?.claim?.id)
            getClaimById(
                params.clientId,
                currentSubmission.value.claim.id,
                true
            );
    },
    { immediate: true }
);

// dialog visibility (name matches the v-model below)
const isDialogVisible = ref(false);
</script>

<template>
    <div class="mt-2 mb-3">
        <h5 class="text-center" data-testid="label-reserved-amt">
            {{ $t('expenses.reserved_amt') }}:
            <span class="font-normal" data-testid="text-reserved-amt">
                {{ helpers.moneyFormat(reservedAmt, 'cad') }} CAD
            </span>
            <span class="ml-2 cursor-pointer" @click="isDialogVisible = true">
                <i
                    data-testid="icon-edit-reserved-amt"
                    class="pi pi-pencil"
                ></i>
            </span>
        </h5>

        <ProgressBar
            class="mt-3"
            :value="
                parseFloat(
                    (
                        (currentSubmission.running_total / reservedAmt) *
                        100
                    ).toFixed(2)
                )
            "
            data-testid="progress-bar-expense-amt"
        />

        <div class="flex justify-content-between align-items-center py-3">
            <h5 class="text-base" data-testid="label-running-total">
                {{ $t('expenses.running_total') }}:
                <span class="font-normal" data-testid="text-running-total">
                    {{ helpers.moneyFormat(currentSubmission.running_total) }}
                    CAD
                </span>
            </h5>
            <h5 class="text-base mt-0" data-testid="label-expense-total">
                {{ $t('expenses.expenses_total') }}:
                <span class="font-normal" data-testid="text-expense-total">
                    {{ helpers.moneyFormat(currentSubmission.expense_total) }}
                    CAD
                </span>
            </h5>
        </div>
    </div>

    <Divider />

    <ReservedAmountDialog
        v-if="currentClaim"
        v-model:visible="isDialogVisible"
        :claim="currentClaim"
        :clientId="currentSubmission.claim.submissions[0]?.client_id"
    />
</template>
