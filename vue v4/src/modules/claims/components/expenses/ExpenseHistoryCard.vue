<script setup>
import { useI18n } from 'vue-i18n';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import { createExpenseCols } from '@/modules/claims/config/expenses.js';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';

const props = defineProps({
    insuredId: {
        type: [Number, String]
    }
});

const { t } = useI18n();
const expenseColumns = createExpenseCols(t);
const { searchExpenses } = useExpenseStore();

const getColumns = (type) => {
    return expenseColumns[type]?.() || [];
};
</script>

<template>
    <div>
        <ClaimBaseTable
            :module="t('expenses.title')"
            :payload="[{ field: 'insured_id', value: props.insuredId }]"
            :storeAction="searchExpenses"
            :columns="getColumns('historyExpense')"
            :showExportButton="true"
            searchableField="expenses"
            :hasFilterComponents="false"
        />
    </div>
</template>

<style scoped lang="scss"></style>
