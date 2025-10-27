<script setup>
import { ref, watch } from 'vue';
import { useHelpers } from '@/composables';
import { useI18n } from 'vue-i18n';

const helpers = useHelpers();
const { t } = useI18n();

const props = defineProps({
    claim: { type: Object, required: true },
    minimal: { type: Boolean, default: false },
    expenseDetail: { type: Boolean, default: false }
});

const showDialog = defineModel('showDialog');

const meter_amt = ref({
    running_total: { label: t('expenses.running_total'), color: '#1DA750' },
    declined_total: { label: t('expenses.declined_total'), color: '#FF0000' },
    expense_total: { label: t('expenses.expenses_total'), color: '#757575' },
    reserved_amount: { label: t('expenses.reserved_amt'), color: '#DEE2E6' }
});

const meter_labels = ref([
    { label: t('expenses.running_total'), key: 'running_total' },
    { label: t('expenses.declined_total'), key: 'declined_total' },
    { label: t('expenses.expenses_total'), key: 'expense_total' },
    { label: t('expenses.reserved_amt'), key: 'reserved_amount' },
    { label: t('claims.reserved_remaining'), key: 'reserved_remaining' }
]);

watch(
    () => props,
    () => {
        if (props.claim?.id) {
            Object.keys(meter_amt.value).forEach((key) => {
                let amt = props.claim;

                meter_amt.value[key].amount = amt[key];

                meter_amt.value[key].value =
                    key === 'reserved_amount' && parseFloat(amt[key])
                        ? amt[key] - amt.expense_total
                        : key === 'reserved_amount'
                          ? amt.expense_total
                          : key === 'expense_total'
                            ? amt.expense_total - amt.running_total
                            : amt[key];

                // checking if reserved amount is zero
                let reserved_amount =
                    parseFloat(amt.reserved_amount) || amt.expense_total;

                meter_amt.value[key].percent =
                    key === 'expense_total' && !parseFloat(amt.reserved_amount)
                        ? 0
                        : (100 * meter_amt.value[key].value) / reserved_amount;
            });

            meter_labels.value = meter_labels.value.map((item) => ({
                ...item,
                amount:
                    item.key === 'reserved_remaining'
                        ? meter_amt.value.reserved_amount.amount > 0
                            ? meter_amt.value.reserved_amount.amount -
                              meter_amt.value.expense_total.amount
                            : 0
                        : meter_amt.value[item.key].amount
            }));
        }
    },
    { deep: true, immediate: true }
);
</script>
<template>
    <div>
        <div class="flex my-2 justify-between" v-if="!minimal">
            <div
                v-for="item in meter_labels.slice(0, 3)"
                class="text-sm"
                :key="item.key"
            >
                <div :data-testid="'meter-text-' + item.key">
                    <b :data-testid="'meter-text-label-' + item.key">
                        {{ item.label }}:
                    </b>
                    {{ helpers.moneyFormat(item.amount) }}
                    CAD
                </div>
            </div>
        </div>

        <div
            class="flex w-full rounded-full overflow-hidden"
            data-testid="meter-reserved-amount"
        >
            <div
                v-for="amt in meter_amt"
                :key="amt.label"
                class="h-4"
                :class="{
                    'border-r-2 border-white':
                        amt.percent && amt.label !== 'Reserved Amount' && amt.label !== 'Expenses Total'
                }"
                :style="'width:' + amt.percent + '%; background:' + amt.color"
            />
        </div>
        <div class="flex my-2 justify-between" v-if="!minimal">
            <div
                v-for="item in meter_labels.slice(3, 5)"
                class="text-sm"
                :key="item.key"
            >
                <div :data-testid="'meter-text-' + item.key">
                    <b :data-testid="'meter-text-label-' + item.key">
                        {{ item.label }}:
                    </b>
                    {{ helpers.moneyFormat(item.amount) }}
                    CAD
                    <a
                        v-if="item.key === 'reserved_amount'"
                        class="pi pi-pencil text-sm"
                        @click="showDialog = true"
                        :data-testid="'meter-show-dialog'"
                    />
                </div>
            </div>
        </div>

        <div class="my-3 text-sm" v-if="expenseDetail && minimal">
            <div
                v-for="{ key, label, amount } in meter_labels"
                :key="key"
                class="flex gap-4 justify-between"
                :class="{
                    'border-top-2 border-300 pt-1': key === 'reserved_remaining'
                }"
            >
                <label
                    class="font-semibold p-0 my-1"
                    :class="{ 'pl-2': key !== 'reserved_remaining' }"
                    data-testid="dialog-label-running-total"
                    :style="`border-left: 8px solid ${meter_amt[key]?.color};`"
                >
                    {{ label }}
                </label>
                <span class="p-1">
                    <a
                        v-if="key === 'reserved_amount'"
                        class="pi pi-pencil text-sm"
                        @click="showDialog = true"
                        :data-testid="'meter-show-dialog'"
                    />
                    {{ helpers.moneyFormat(amount) }}
                    CAD
                </span>
            </div>
        </div>
    </div>
</template>
