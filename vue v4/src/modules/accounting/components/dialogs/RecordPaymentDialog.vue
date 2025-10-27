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

const showDepositDate = computed(
    () =>
        paymentOption.value === invoicePaymentOptions.PAYPAL.value ||
        paymentOption.value === invoicePaymentOptions.CREDIT_CARD.value ||
        paymentOption.value === invoicePaymentOptions.CHEQUE.value
);

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
    paymentDate.value = moment().format('YYYY-MM-DD');
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
    globalStore.clearErrors();
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

    if (paymentDate.value && paymentDate.value !== 'Invalid date') {
        payload.payment_date = paymentDate.value;
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

    if (depositDate.value && depositDate.value !== 'Invalid date') {
        payload.deposit_date = depositDate.value;
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
            <div class="space-y-5">
                <div>
                    <label
                        for="payment_date"
                        class="block mb-2"
                        data-testid="payment-date-label"
                    >
                        *{{ $t('invoice.record_payment.payment_date') }}
                    </label>
                    <InputField
                        variant="date"
                        id="payment_date"
                        v-model="paymentDate"
                        class="w-full"
                        inputClass="w-full"
                        :show-icon="false"
                        data-testid="payment-date-calendar"
                    />
                </div>

                <div>
                    <label
                        for="payment_method"
                        class="block mb-2"
                        data-testid="payment-method-label"
                    >
                        *{{ $t('invoice.record_payment.payment_method') }}
                    </label>
                    <InputField
                        variant="select"
                        v-model="paymentOption"
                        id="payment_method"
                        :options="paymentOptions"
                        optionLabel="display_name"
                        optionValue="value"
                        class="w-full"
                        @change="onPaymentSelectionChange"
                        data-testid="payment-method-dropdown"
                    />
                </div>

                <div>
                    <label
                        for="payment_amount"
                        class="block mb-2"
                        data-testid="payment-amount-label"
                    >
                        *{{ $t('invoice.record_payment.payment_amount') }}
                    </label>
                    <InputField
                        variant="number"
                        id="payment_amount"
                        v-model="paymentAmount"
                        class="w-full"
                        data-testid="payment-amount-input"
                        inputId="locale-user"
                        :minFractionDigits="2"
                        :maxFractionDigits="2"
                        prefix="$"
                        fluid
                    />
                    <small
                        class="block mt-1 text-gray-600"
                        data-testid="balance-due-text"
                    >
                        {{
                            $t('invoice.record_payment.current_balance_due', {
                                invoice_amount: helpers.moneyFormat(
                                    props.invoice.amount_due
                                )
                            })
                        }}
                    </small>
                </div>

                <div
                    :class="[
                        'grid gap-4',
                        showDepositDate ? 'grid-cols-2' : 'grid-cols-1'
                    ]"
                    v-if="paymentOption"
                >
                    <div v-if="paymentOption">
                        <label
                            for="payment_ref"
                            class="block mb-2"
                            data-testid="payment-ref-label"
                        >
                            *{{ $t('invoice.record_payment.ref') }}
                        </label>
                        <InputText
                            id="payment_ref"
                            type="text"
                            v-model="paymentRef"
                            class="w-full"
                            data-testid="payment-ref-input"
                        />
                        <small
                            v-if="errors?.ref_number"
                            class="p-error block mt-1"
                        >
                            {{ errors.ref_number[0] }}
                        </small>
                    </div>

                    <div v-if="showDepositDate">
                        <label
                            for="deposit_date"
                            class="block mb-2"
                            data-testid="deposit-date-label"
                        >
                            <span
                                v-if="
                                    paymentOption !=
                                    invoicePaymentOptions.CHEQUE.value
                                "
                                >*</span
                            >
                            {{ $t('invoice.record_payment.deposit_date') }}
                        </label>
                        <div class="relative">
                            <InputField
                                variant="date"
                                id="deposit_date"
                                v-model="depositDate"
                                class="w-full"
                                inputClass="w-full"
                                :show-icon="false"
                                data-testid="deposit-date-calendar"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label
                        for="memo"
                        class="block mb-2"
                        data-testid="memo-label"
                    >
                        {{ $t('invoice.record_payment.memo') }}
                    </label>
                    <InputField
                        variant="textarea"
                        id="memo"
                        v-model="memo"
                        rows="5"
                        class="w-full"
                        data-testid="memo-textarea"
                    />
                </div>

                <div v-if="shouldRequireReceipt">
                    <label class="block mb-2" data-testid="receipt-label">
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
                    <div class="relative w-full">
                        <i
                            class="pi pi-paperclip pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                        ></i>
                        <InputText
                            :placeholder="
                                $t('invoice.record_payment.choose_file')
                            "
                            @click="triggerFileInput"
                            v-model="receiptFileName"
                            class="w-full !pl-10 cursor-pointer"
                            readonly
                            data-testid="receipt-input"
                        />
                    </div>
                    <input
                        ref="fileInput"
                        type="file"
                        class="hidden"
                        @change="handleFileChange"
                        data-testid="receipt-file-input"
                    />
                    <small v-if="errors?.receipt" class="p-error block mt-1">
                        {{ errors.receipt[0] }}
                    </small>
                    <small v-if="errors?.cheque" class="p-error block mt-1">
                        {{ errors.cheque[0] }}
                    </small>
                </div>
            </div>
        </BlockUI>

        <template #footer>
            <div class="flex items-center justify-end gap-3">
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
            </div>
        </template>
    </Dialog>
</template>
