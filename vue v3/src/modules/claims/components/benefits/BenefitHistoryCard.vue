<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import { createExpenseCols } from '@/modules/claims/config/expenses.js';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';

const props = defineProps({
    insuredId: { type: [Number, String] }
});

const route = useRoute();
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
            :module="t('common.benefits')"
            :columns="getColumns('benefitExpense')"
            :payload="[
                { field: 'insured_id', value: insuredId },
                { field: 'clientId', value: route.params.clientId }
            ]"
            :storeAction="searchExpenses"
            searchableField="benefits"
            :hasFilterComponents="false"
        />
    </div>
</template>

<style scoped lang="scss"></style>
