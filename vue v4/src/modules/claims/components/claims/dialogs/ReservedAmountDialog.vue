<script setup>
import { inject, ref, watch } from 'vue';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useClaimStore } from '@/modules/claims/stores/Claim';

const user = inject('currentUser');
const { t } = useI18n();

const props = defineProps({
    claim: { type: Object, required: true }
});

const route = useRoute();
const helpers = useHelpers();
const visible = defineModel('visible');
const { updateReservedAmount } = useClaimStore();
const reserved_amount = ref(null);
const reason = ref('');

const { loading, mutate, status, error, showToast, showError } =
    updateReservedAmount();

const amounts = ref();
watch(
    () => props,
    () => {
        amounts.value = [
            { label: 'Running Total', amount: props.claim.running_total },
            { label: 'Expense Total', amount: props.claim.expense_total },
            { label: 'Reserved Amount', amount: props.claim.reserved_amount },
            {
                label: 'Reserved Remaining',
                amount: props.claim.reserved_remaining
            }
        ];
    },
    { immediate: true, deep: true }
);

watch(
    () => visible.value,
    (isVisible) => {
        if (isVisible) {
            reserved_amount.value =
                +props.claim.reserved_amount || props.claim.expense_total || 0;
            reason.value = ''; // reset
            error.value = null;
        }
    }
);

watch(
    () => loading,
    () => {
        if (visible.value && !loading.value && status.value === 'success') {
            visible.value = false;
            reserved_amount.value = null;
            reason.value = '';
        }
        if (status.value === 'error') {
            showError(
                t('notifications.oops'),
                error.value.errors?.reserved_amount
                    ? error.value.errors.reserved_amount[0]
                    : error.value.message
            );
        }
    },
    { deep: true }
);
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        header="Edit Reserved Amount"
    >
        <!-- Amounts display with spacing -->
        <div>
            <div class="grid grid-cols-7 gap-4 mb-4">
                <label
                    class="font-semibold col-span-3"
                    data-testid="dialog-label-running-total"
                >
                    {{ $t('expenses.running_total') }}:
                </label>
                <span class="col-span-4"
                    >{{ helpers.moneyFormat(claim.running_total) }} CAD</span
                >
            </div>

            <div class="grid grid-cols-7 gap-4 mb-4">
                <label
                    class="font-semibold col-span-3"
                    data-testid="dialog-label-expense-total"
                >
                    {{ $t('expenses.expenses_total') }}:
                </label>
                <span class="col-span-4"
                    >{{ helpers.moneyFormat(claim.expense_total) }} CAD</span
                >
            </div>

            <div class="grid grid-cols-7 gap-4 mb-4">
                <label
                    class="font-semibold col-span-3"
                    data-testid="dialog-label-reserved-amount"
                >
                    {{ $t('expenses.reserved_amt') }}:
                </label>
                <span class="col-span-4"
                    >{{ helpers.moneyFormat(claim.reserved_amount) }} CAD</span
                >
            </div>

            <div class="grid grid-cols-7 gap-4">
                <label
                    class="font-semibold col-span-3"
                    data-testid="dialog-label-reserved-remaining"
                >
                    {{ $t('claims.reserved_remaining') }}:
                </label>
                <span class="col-span-4">
                    {{
                        helpers.moneyFormat(
                            claim.reserved_amount -
                                (claim.running_total +
                                    claim.expense_total +
                                    claim.declined_total)
                        )
                    }}
                    CAD
                </span>
            </div>
        </div>

        <divider></divider>

        <!-- New Reserved Amount: label and input on the same line -->
        <div class="grid grid-cols-7 gap-4 align-items-center my-7">
            <label
                class="font-semibold col-span-3 reserved-amt-label"
            >
                {{ $t('claims.new_reserved_amount') }}:
            </label>
            <div class="col-span-4">
                <InputGroup>
                  <InputGroupAddon>
                    <Button icon="pi pi-dollar" severity="secondary" disabled/>
                  </InputGroupAddon>
                  <InputField
                      id="reserved-amount-input"
                      variant="number"
                      v-model="reserved_amount"
                      :minFractionDigits="2"
                      :maxFractionDigits="2"
                      placeholder="Reserved Amount"
                      data-testid="dialog-input-reserved-amount"
                  />
                  <InputGroupAddon>
                    <Button label="CAD" severity="secondary" disabled/>
                  </InputGroupAddon>
                </InputGroup>
                <small
                    v-if="error?.errors?.reserved_amount"
                    class="p-error mt-1 block"
                >
                    {{ error.errors.reserved_amount[0] }}
                </small>
            </div>
        </div>

        <!-- Reason textarea, stacked -->
        <div>
            <label
                for="reason-textarea"
                class="block font-semibold mb-2"
            >
                Reason:
            </label>
            <Textarea
                id="reason-textarea"
                v-model="reason"
                autoResize
                rows="4"
                placeholder="Enter reason for change"
                class="w-full"
                data-testid="dialog-input-reason"
            />
            <small v-if="error?.errors?.reason" class="p-error mt-1 block">
                {{ error.errors.reason[0] }}
            </small>
        </div>

        <!-- Action buttons -->
        <div class="flex justify-end gap-2 mt-5">
            <Button
                type="button"
                label="Cancel"
                link
                @click="visible = false"
                data-testid="dialog-btn-cancel-reserved-amount"
            />
            <Button
                type="button"
                :label="$t('buttons.confirm')"
                icon="pi pi-check"
                data-testid="dialog-btn-save-reserved-amount"
                @click="
                    mutate({
                        clientId: route.params.clientId,
                        reserved_amount,
                        user_id: user.id,
                        claimId: claim.id,
                        reason
                    })
                "
                :loading="loading"
            />
        </div>
    </Dialog>
</template>
<style>
.reserved-amt-label {
  align-content: center;
}
</style>
