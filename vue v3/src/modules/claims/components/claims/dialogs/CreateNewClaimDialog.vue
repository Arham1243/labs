<script setup>
import { inject, ref, watch } from 'vue';
import { useHelpers } from '@/composables';
import { useRoute } from 'vue-router';
import { useClaimStore } from '@/modules/claims/stores/Claim';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';

const visible = defineModel('visible');
const route = useRoute();
const helpers = useHelpers();
const user = inject('currentUser');
const { createClaim } = useClaimStore();
const { loading, mutate, status, error } = createClaim();
const { currentSubmission, getSubmissionById } = useSubmissionStore();

const reserveAmt = ref(currentSubmission.value?.amount_claimed ?? 0);

// Hide Dialog after submission
watch(
    () => loading,
    () => {
        if (visible.value && !loading.value && status.value === 'success') {
            visible.value = false;

            getSubmissionById(
                route.params.clientId,
                currentSubmission.value.id,
                true
            );
        }
    },
    { deep: true }
);

watch(
    () => visible.value,
    (isVisible) => {
        if (isVisible) {
            reserveAmt.value = currentSubmission.value?.amount_claimed ?? 0;
            error.value = null;
        }
    }
);
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="$t('claims.create_new_claim')"
        :style="{ width: '480px' }"
    >
        <div class="mt-1">
            <p data-testid="text-create-new-claim-suggestion">
                Are you sure you want to create a new claim for submission ID
                {{ currentSubmission.ref_number }}?
            </p>
        </div>

        <div class="grid mt-4">
            <div
                class="col-4 font-semibold py-1"
                data-testid="label-running-total"
            >
                {{ $t('expenses.running_total') }}:
            </div>
            <div
                class="col-8 py-1 p-break-word"
                data-testid="text-running-total"
            >
                {{ helpers.moneyFormat(currentSubmission.amount_approved) }} CAD
            </div>
        </div>

        <div class="grid mt-2">
            <div
                class="col-4 font-semibold py-1"
                data-testid="label-expense-total"
            >
                {{ $t('expenses.expenses_total') }}:
            </div>
            <div
                class="col-8 py-1 p-break-word"
                data-testid="text-expense-total"
            >
                {{ helpers.moneyFormat(currentSubmission.amount_claimed) }} CAD
            </div>
        </div>

        <div class="grid mt-2">
            <div
                class="col-4 font-semibold pt-3"
                data-testid="label-reserved-amt"
            >
                {{ $t('expenses.reserved_amt') }}:
            </div>
            <div class="col-8 py-1 p-break-word">
                <InputField
                    addon-before="pi pi-dollar"
                    variant="number"
                    addon-after="CAD"
                    v-model="reserveAmt"
                    :minFractionDigits="2"
                    :maxFractionDigits="2"
                    placeholder="Reserved Amount"
                    data-testid="input-reserved-amt"
                    class="reserved-amt-input"
                />

                <small v-if="error?.message" class="p-error mt-1 block">
                    {{ error.message }}
                </small>
            </div>
        </div>

        <template #footer>
            <Button
                :label="$t('buttons.cancel')"
                text
                data-testid="btn-cancel-create-new-claim"
                @click="visible = false"
            />
            <Button
                :label="$t('claims.create_new_claim')"
                data-testid="btn-create-new-claim"
                @click="
                    mutate({
                        clientId: route.params.clientId,
                        user_id: user.id,
                        policy_id: currentSubmission.policy.id,
                        insured_id: currentSubmission.insured.id,
                        reserved_amount: reserveAmt,
                        submission_ids: [currentSubmission.id]
                    })
                "
            />
        </template>
    </Dialog>
</template>
