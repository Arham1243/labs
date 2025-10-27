<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useInvoicesStore } from '@/modules/accounting/stores/Invoices.js';

const { t } = useI18n();

const props = defineProps({
    invoice: {
        type: Object,
        require: true
    },
    reload: {
        type: Function
    }
});

const visible = defineModel('visible');
const void_reason = ref('');
const loading = ref(false);
const error = ref(null);

const { voidInvoice } = useInvoicesStore();

const submit = async () => {
    try {
        loading.value = true;
        let res = await voidInvoice({
            invoiceId: props.invoice.id,
            void_reason: void_reason.value
        });
        if (res.data.id) {
            visible.value = false;
            props.reload();
        }
    } catch (err) {
        error.value = err.response?.data;
    } finally {
        loading.value = false;
    }
};

watch(
    () => visible.value,
    () => {
        void_reason.value = '';
        error.value = null;
    }
);
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="$t('invoice.void_invoice.dialog.title')"
        :style="{ maxWidth: '480px' }"
        data-testid="void-invoice-dialog"
    >
        <div class="mb-4" data-testid="dialog-message">
            {{
                $t('invoice.void_invoice.dialog.message', {
                    invoice_number: invoice.invoice_number,
                    client_name: invoice.client.name.en
                })
            }}
        </div>

        <div class="mb-4">
            <label
                for="void_reason"
                class="block text-md font-medium text-gray-700 mb-1"
                data-testid="reason-label"
                v-text="$t('invoice.void_invoice.dialog.reason')"
            />
            <Textarea
                autofocus
                id="void_reason"
                class="w-full"
                :class="{ 'border-red-500': error?.message }"
                autoResize
                data-testid="reason-textarea"
                v-model="void_reason"
                rows="5"
                @keyup="error ? (error.message = '') : ''"
            />
            <small
                v-if="error"
                v-text="error?.message"
                class="text-red-500"
                data-testid="text-error-reason"
            />
        </div>

        <div class="flex justify-content-end">
            <Button
                data-testid="save-filter-dialog-cancel"
                text
                :label="$t('buttons.cancel')"
                @click="visible = false"
            />
            <Button
                severity="danger"
                class="font-bold"
                data-testid="save-filter-dialog-save"
                :label="$t('invoice.void_invoice.dialog.confirm_button')"
                :loading="loading"
                @click="submit"
            />
        </div>
    </Dialog>
</template>
