<script setup>
import helpers from '@/utils/helpers';

const props = defineProps({
    expense: { type: Object, required: true }
});
</script>

<template>
    <div>
        <div class="grid grid-cols-3 gap-4 m-1">
            <div
                class="font-semibold py-1"
                data-testid="label-approved-amount"
            >
                {{ $t('expenses.approval_amt') }}
            </div>
            <div
                class="col-span-2 py-1 p-break-word text-right"
                data-testid="text-approved-amount"
            >
                {{ helpers.moneyFormat(expense.amount_approved) }}CAD
            </div>
        </div>
        <div class="grid grid-cols-3 gap-4 m-1">
            <div
                class="font-semibold py-1"
                data-testid="label-co-pay-amt"
            >
                {{ $t('expenses.co_pay_amt') }} ({{
                    parseFloat(
                        expense.amount_co_pay /
                        expense.amount_approved
                    ).toFixed(2) * 100
                }}%)
            </div>
            <div
                class="col-span-2 py-1 p-break-word text-right"
                data-testid="text-co-pay-amt"
            >
                {{ helpers.moneyFormat(expense.amount_co_pay) }}CAD
            </div>
        </div>
        <div class="grid grid-cols-3 gap-4 m-1">
            <div
                class="font-semibold py-1"
                data-testid="label-approved-total"
            >
                {{ $t('expenses.approved_total') }}
            </div>
            <div
                class="col-span-2 py-1 p-break-word text-right"
                data-testid="text-approved-total"
            >
                {{ helpers.moneyFormat(expense.amount_approved - expense.amount_co_pay) }}CAD
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
