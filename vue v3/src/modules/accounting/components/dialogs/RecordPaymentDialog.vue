<script setup>
import { useI18n } from 'vue-i18n';
import { ref, computed, reactive, watchEffect, defineEmits } from 'vue';
import { invoicePaymentOptions } from '@/config';
import { useInvoicesStore } from '@/modules/accounting/stores/Invoices';
import { useSessionStore } from '@/stores';
import { useGlobalStore } from '@/stores';
import Vapor from '@/services/Vapor';
import { isBlock } from 'typescript';
import { useHelpers } from '@/composables';
import moment from 'moment-timezone';

const { t } = useI18n();
const invoicesStore = useInvoicesStore();
const globalStore = useGlobalStore();
const helpers = useHelpers();

const emits = defineEmits(['update:modelValue', 'paymentRecorded']);

const paymentDate = ref();
const paymentOption = ref();
const paymentRef = ref('');
const paymentAmount = ref('');
const memo = ref('');
const depositDate = ref();
const paymentOptions = Object.values(invoicePaymentOptions);
const receiptFileName = ref(null);
const receipt = ref(null);
const vaporReceipt = ref({
    key: null,
    name: null
});
const fileInput = ref(null);
const isLoading = ref(false);
const errors = ref([]);

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    invoice: {
        type: Object,
        required: true
    }
});

const invoiceLoaded = () => {
    if (props.invoice && Object.keys(props.invoice).length) {
        paymentAmount.value = props.invoice.amount_due;
        paymentOption.value = props.invoice.payment_type || null;
    }
};

const onPaymentSelectionChange = () => {
    depositDate.value = null;
};

watchEffect(() => {
    invoiceLoaded();
});

const showDialog = computed({
    get() {
        setDefaultValues();
        return props.modelValue;
    },
    set(value) {
        invoiceLoaded();
        emits('update:modelValue', value);
    }
});

const setDefaultValues = () => {
    paymentDate.value = new Date();
};

const triggerFileInput = () => {
    fileInput.value?.click();
};

const handleFileChange = (event) => {
    isLoading.value = true;
    const file = event.target.files[0];

    const signedStorageUrl = `${
        import.meta.env.VITE_API_BASE_URL
    }/api/v1/vapor/signed-storage-url`;

    const sessionStore = useSessionStore();

    const authCookie = sessionStore.getCookie() || {};

    const { access_token } = authCookie;

    Vapor.store(file, {
        signedStorageUrl: signedStorageUrl,
        headers: {
            authorization: `Bearer ${access_token}`
        }
    })
        .then((response) => {
            vaporReceipt.value.key = response.key;
            vaporReceipt.value.name = response.name;
        })
        .finally(() => {
            isLoading.value = false;
        });

    if (file) {
        receipt.value = file;
        receiptFileName.value = file.name;
    }
};

const validatePaymentAmount = (event) => {
    const cleaned = event?.target?.value?.replace(/\D+/g, '');
    paymentAmount.value = cleaned;
};

const closeDialog = () => {
    resetToDefault();
    showDialog.value = false;
};

const resetToDefault = () => {
    paymentDate.value = null;
    paymentOption.value = null;
    paymentRef.value = '';
    paymentAmount.value = null;
    memo.value = '';
    depositDate.value = null;
    clearReceipt();
    errors.value = [];
};

const clearReceipt = () => {
    receipt.value = null;
    receiptFileName.value = null;
    vaporReceipt.value = {
        key: null,
        name: null
    };
};

const shouldRequireReceipt = computed(() => {
    return (
        paymentOption.value &&
        [
            invoicePaymentOptions.BANK_TRANSFER.value,
            invoicePaymentOptions.CHEQUE.value
        ].includes(paymentOption.value)
    );
});

const apply = async () => {
    isLoading.value = true;
    const payload = getPayload();
    try {
        await invoicesStore.recordPayment(payload, props.invoice.id);
        emits('paymentRecorded');
        closeDialog();
    } catch (e) {
        if (e?.response?.data?.errors) {
            errors.value = e.response.data.errors;
        }
    } finally {
        isLoading.value = false;
    }
};

const getPayload = () => {
    const payload = {};

    if (paymentDate.value) {
        payload.payment_date = moment(paymentDate.value, 'YYYY-MM-DD').format(
            'YYYY-MM-DD'
        );
    }

    if (paymentOption.value) {
        payload.payment_method = paymentOption.value;
    }

    if (paymentAmount.value) {
        payload.payment_amount = paymentAmount.value;
    }

    if (paymentRef.value) {
        payload.ref_number = paymentRef.value;
    }

    if (memo.value) {
        payload.memo = memo.value;
    }

    if (depositDate.value) {
        payload.deposit_date = new Date(depositDate.value)
            .toISOString()
            .slice(0, 10);
    }

    if (shouldRequireReceipt.value) {
        if (paymentOption.value === invoicePaymentOptions.CHEQUE.value) {
            payload.cheque = {
                key: vaporReceipt.value.key,
                name: vaporReceipt.value.name
            };
        } else {
            payload.receipt = {
                key: vaporReceipt.value.key,
                name: vaporReceipt.value.name
            };
        }
    }
    return payload;
};
</script>

<template>
    <Dialog
        v-model:visible="showDialog"
        @hide="closeDialog"
        :closable="!isLoading"
        modal
        :header="$t('invoice.record_payment.title')"
        :style="{ width: '600px' }"
        data-testid="record-payment-dialog"
    >
        <BlockUI :blocked="isLoading">
            <div class="container mx-auto space-y-4 max-w-md p-fluid">
                <!-- Payment Date -->
                <div class="pb-4">
                    <label
                        for="date"
                        class="block text-md font-medium text-gray-700 mb-1"
                        data-testid="payment-date-label"
                    >
                        *{{ $t('invoice.record_payment.payment_date') }}
                    </label>
                    <Calendar
                        v-model="paymentDate"
                        class="w-full"
                        dateFormat="dd-M-yy"
                        data-testid="payment-date-calendar"
                    />
                    <small v-if="errors?.payment_date" class="p-error">{{
                        errors.payment_date[0]
                    }}</small>
                </div>

                <!-- Payment Method -->
                <div class="pb-4 field">
                    <label
                        for="payment_method"
                        class="block text-md font-medium text-gray-700 mb-1"
                        data-testid="payment-method-label"
                    >
                        *{{ $t('invoice.record_payment.payment_method') }}
                    </label>
                    <Dropdown
                        v-model="paymentOption"
                        id="payment_method"
                        :options="paymentOptions"
                        optionLabel="display_name"
                        optionValue="value"
                        class="w-full"
                        @change="onPaymentSelectionChange"
                        data-testid="payment-method-dropdown"
                    />
                    <small v-if="errors?.payment_method" class="p-error">{{
                        errors.payment_method[0]
                    }}</small>
                </div>

                <!-- Payment Amount -->
                <div class="pb-4">
                    <label
                        for="date"
                        class="block text-md font-medium text-gray-700 mb-1"
                        data-testid="payment-amount-label"
                    >
                        *{{ $t('invoice.record_payment.payment_amount') }}
                    </label>
                    <span
                        class="p-input-icon-left w-full"
                        style="cursor: pointer"
                    >
                        <i class="pi pi-dollar" />
                        <InputNumber
                            class="payment-amount-input-number"
                            v-model="paymentAmount"
                            data-testid="payment-amount-input"
                            inputId="locale-user"
                            :minFractionDigits="2"
                            :maxFractionDigits="2"
                        />
                    </span>
                    <small data-testid="balance-due-text">
                        {{
                            $t('invoice.record_payment.current_balance_due', {
                                invoice_amount: helpers.moneyFormat(
                                    props.invoice.amount_due
                                )
                            })
                        }}
                    </small>
                    <br />
                    <small v-if="errors?.payment_amount" class="p-error">{{
                        errors.payment_amount[0]
                    }}</small>
                </div>

                <div class="flex gap-2 pb-4">
                    <div class="flex-1" v-if="paymentOption">
                        <div class="w-full">
                            <!-- Payment Reference -->
                            <div class="pb-4">
                                <label
                                    for="date"
                                    class="block text-md font-medium text-gray-700 mb-1"
                                    data-testid="payment-ref-label"
                                >
                                    *{{ $t('invoice.record_payment.ref') }}
                                </label>
                                <InputText
                                    type="text"
                                    v-model="paymentRef"
                                    class="w-full"
                                    data-testid="payment-ref-input"
                                />
                                <small
                                    v-if="errors?.ref_number"
                                    class="p-error"
                                    >{{ errors.ref_number[0] }}</small
                                >
                            </div>
                        </div>
                    </div>
                    <div
                        class="flex-1"
                        v-if="
                            (paymentOption &&
                                paymentOption ===
                                    invoicePaymentOptions.PAYPAL.value) ||
                            paymentOption ===
                                invoicePaymentOptions.CREDIT_CARD.value ||
                            paymentOption === invoicePaymentOptions.CHEQUE.value
                        "
                    >
                        <!-- Deposit Date -->
                        <div class="w-full">
                            <label
                                for="date"
                                class="block text-md font-medium text-gray-700 mb-1"
                                data-testid="deposit-date-label"
                            >
                                <span
                                    v-if="
                                        paymentOption !=
                                        invoicePaymentOptions.CHEQUE.value
                                    "
                                    >*</span
                                >{{ $t('invoice.record_payment.deposit_date') }}
                            </label>
                            <span
                                class="p-input-icon-right w-full pb-1"
                                style="cursor: pointer"
                            >
                                <i class="pi pi-calendar" />
                                <Calendar
                                    v-model="depositDate"
                                    class="w-full"
                                    dateFormat="dd-M-yy"
                                    data-testid="deposit-date-calendar"
                                />
                            </span>
                            <small
                                v-if="errors?.deposit_date"
                                class="p-error"
                                >{{ errors.deposit_date[0] }}</small
                            >
                        </div>
                    </div>
                </div>

                <!-- Memo -->
                <div class="pb-4">
                    <label
                        for="date"
                        class="block text-md font-medium text-gray-700 mb-1"
                        data-testid="memo-label"
                    >
                        {{ $t('invoice.record_payment.memo') }}
                    </label>
                    <Textarea
                        v-model="memo"
                        rows="5"
                        cols="30"
                        class="w-full"
                        data-testid="memo-textarea"
                    />
                    <small v-if="errors?.memo" class="p-error">{{
                        errors.memo[0]
                    }}</small>
                </div>

                <!-- Attach Receipt -->
                <div class="pb-4" v-if="shouldRequireReceipt">
                    <label
                        for="date"
                        class="block text-md font-medium text-gray-700 mb-1"
                        data-testid="receipt-label"
                    >
                        <span
                            v-if="
                                paymentOption &&
                                paymentOption ===
                                    invoicePaymentOptions.CHEQUE.value
                            "
                        >
                            *{{ $t('invoice.record_payment.attach_cheque') }}
                        </span>
                        <span v-else>
                            *{{ $t('invoice.record_payment.attach_receipt') }}
                        </span>
                    </label>
                    <span
                        class="p-input-icon-left w-full"
                        style="cursor: pointer"
                    >
                        <i class="pi pi-paperclip" />
                        <InputText
                            :placeholder="
                                $t('invoice.record_payment.choose_file')
                            "
                            @click="triggerFileInput"
                            v-model="receiptFileName"
                            class="w-full"
                            readonly
                            data-testid="receipt-input"
                        />
                        <input
                            ref="fileInput"
                            type="file"
                            class="hidden"
                            @change="handleFileChange"
                            data-testid="receipt-file-input"
                        />
                    </span>
                    <small v-if="errors?.receipt" class="p-error">{{
                        errors.receipt[0]
                    }}</small>
                    <small v-if="errors?.cheque" class="p-error">{{
                        errors.cheque[0]
                    }}</small>
                </div>
            </div>
        </BlockUI>

        <!-- Footer Buttons -->
        <template #footer>
            <Button
                v-if="!isLoading"
                text
                :label="$t('buttons.cancel')"
                @click="closeDialog"
                data-testid="record-payment-cancel-button"
            />
            <Button
                type="button"
                :loading="isLoading"
                :label="$t('buttons.save')"
                @click="apply"
                data-testid="record-payment-save-button"
            />
        </template>
    </Dialog>
</template>

<style lang="scss" scoped>
::v-deep(.payment-amount-input-number input) {
    padding-left: 25px;
    margin-bottom: 1px;
}
</style>
