<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Label from '@/components/common/Label.vue';
import InvoicesTable from '@/modules/accounting/components/tables/InvoicesTable.vue';
import InvoiceDueSummary from '@/modules/accounting/components/invoices/InvoiceDueSummary.vue';
import ExportFileDialog from '@/modules/accounting/components/dialogs/ExportFileDialog.vue';
import { useInvoicesStore } from '@/modules/accounting/stores/Invoices';

const { t } = useI18n();
const invoicesStore = useInvoicesStore();

const showExportFilterDialog = ref(false);
const isOverdueSummaryLoading = ref(true);
const invoiceOverdueSummary = ref([]);

//TODO remove after API implementation
const getInvoiceSummary = () => {
    return {
        '0-30': '$9600.00',
        '31-60': '$5355.00',
        '61-90': '$920.00',
        'over-90': '$56,00.00',
        total: '12,535.45'
    };
};

const openExportFilterDialog = () => {
    showExportFilterDialog.value = true;
};

onMounted(async () => {
    const res = await invoicesStore.getInvoiceOverdueSummary();
    invoiceOverdueSummary.value = res.data;
    isOverdueSummaryLoading.value = false;
});
</script>

<template>
    <div>
        <Header hide-back>
            <template #title>
                <Label test-id="page-title"> {{ $t('invoice.title') }} </Label>
            </template>
            <template #actions>
                <div
                    class="flex justify-content-between align-items-center gap-3"
                >
                    <Button
                        class="p-button-outlined mr-2"
                        label="Export"
                        @click="openExportFilterDialog"
                        icon="pi pi-download"
                        data-testid="export-button"
                    />
                    <Button
                        v-if="$ability.can('create invoices')"
                        data-testid="order-new-policy-button"
                        :label="$t('invoice.new_invoice')"
                        icon="pi pi-plus"
                    />
                </div>
            </template>
        </Header>
        <ExportFileDialog v-model="showExportFilterDialog"></ExportFileDialog>

        <InvoiceDueSummary
            v-if="!isOverdueSummaryLoading"
            :summary="invoiceOverdueSummary"
        />

        <Card class="mt-4">
            <template #content>
                <InvoicesTable />
            </template>
        </Card>
    </div>
</template>

<style lang="scss"></style>
