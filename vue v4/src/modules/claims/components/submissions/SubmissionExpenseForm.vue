<script setup>
import { reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import LabelField from '@/modules/claims/components/forms/LabelField.vue';
import { useRouter } from 'vue-router';
import { useHelpers } from '@/composables';
import { cfg } from '@/modules/claims/utils/submissions';
import { useGeneralStore } from '@/modules/claims/stores/General';
import { useClaimPolicyStore } from '@/modules/claims/stores/Policy';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useConfirm } from 'primevue/useconfirm';

const props = defineProps({
    Index: { type: Number, default: 0 },
    popup: { type: Boolean, default: false },
    addNew: { type: Boolean, default: false }
});

const { t } = useI18n();

const router = useRouter();
const helpers = useHelpers();

const { currentPolicy } = useClaimPolicyStore();

const { currencies, getCurrencies } = useGeneralStore();
const { loading: loadingCurrency } = getCurrencies();

// Handling Form Data
const { newSubmission, setSubmissionExpenseData } = useSubmissionStore();
const formData = reactive({});

let step = ref(cfg.claims_process.claimSteps[1]);

// Set form values from store
Object.keys(
    newSubmission.value.formData.details?.expenses?.[props.Index] || {}
).forEach((key) => {
    formData[key] =
        newSubmission.value.formData.details?.expenses?.[props.Index]?.[key];
});

if (newSubmission.value.currency?.symbol)
    step.value.fields[3].props.prefix =
        newSubmission.value.currency?.symbol + ' ';

// handle service date
if (!formData?.service_date) {
    formData.service_date = new Date();
} else {
    formData.service_date = new Date(formData.service_date);
}

// Benefits dropdown updates
watch(
    () => currentPolicy,
    () => {
        if (currentPolicy.value?.benefits?.length) {
            step.value.fields[0].props.options =
                currentPolicy.value?.benefits.map((benefit) => ({
                    id: benefit.id,
                    name: benefit.name,
                    service_codes: benefit.service_codes,
                    service_code_id: benefit.service_codes?.[0]?.id
                }));
        }
    },
    { deep: true, immediate: true }
);

// currency updates
watch(
    () => currencies,
    () => {
        if (currencies.value?.length) {
            step.value.fields[4].props.options = currencies.value.map(
                (curr) => ({
                    id: curr.id,
                    name: `${curr.id} - ${curr.name}, ${curr.symbol}`,
                    symbol: curr.symbol.replace(/\.$/, '․') // replacing period (.) with Dot leader (special period "․", U+2024, because PrimeVue InputNumber prefix doesn't work well with actual periods )
                })
            );
            // set default current as CAD
            formData.receipt_currency =
                step.value.fields[4].props.options.filter(
                    (curr) =>
                        curr.id === newSubmission.value.currency_id ?? 'CAD'
                )[0];
        }
    },
    { deep: true, immediate: true }
);

// Confirming Currency Changes
const confirm = useConfirm();

// setCurrencySymbol - newSubmission currency and Total Cost Field Currency
const setCurrencySymbol = () => {
    step.value.fields[3].props.prefix = formData.receipt_currency?.symbol + ' ';
    newSubmission.value.currency = formData.receipt_currency ?? {
        id: 'CAD',
        name: 'CAD - Canadian dollar, $',
        symbol: '$'
    };
};

const resetCurrencySymbol = () => {
    newSubmission.value.formData.details.expenses =
        newSubmission.value.formData.details.expenses.map((expense) => ({
            ...expense,
            receipt_currency: newSubmission.value.currency
        }));
    formData.receipt_currency = newSubmission.value.currency;
    setTimeout(() => confirm.close(), 100);
};

const confirmCurrency = () => {
    confirm.require({
        message: `<p>Currency of this Expense doesn't match currency with other expenses recorded in the claim.</p> <p>Do you want to have <b>${currID.value} (${formData.receipt_currency.symbol})</b> as the default currency for all expenses?</p>`,
        header: 'Duplicate Notice',
        icon: '',
        rejectClass: 'p-button-secondary p-button-outlined',
        rejectLabel: 'No',
        acceptLabel: 'Yes',
        acceptIcon: 'pi pi-check',
        accept: () => setCurrencySymbol(),
        reject: () => resetCurrencySymbol(),
        onHide: () => resetCurrencySymbol()
    });
};

//
//
if (!newSubmission.value.formData.details)
    newSubmission.value.formData.details = {};
if (!newSubmission.value.formData.details?.expenses)
    newSubmission.value.formData.details.expenses = [];

// Track formData changes & update newSubmission in the process
let currency = ref({});
let currDialog = ref(null);
let currID = ref(null);

watch(
    () => formData,
    () => {
        // Service code dropdown update
        if (formData.medical_service_type?.id) {
            step.value.fields[1].props.options =
                formData.medical_service_type?.service_codes;
        }

        // Form currency changes prefix in total cost with confirmation dialog
        if (
            formData.receipt_currency?.id &&
            formData.receipt_currency?.id !== currID.value &&
            !currDialog?.value?.visible
        ) {
            currID.value = formData.receipt_currency.id;
            if (newSubmission.value.formData.details?.expenses?.length > 1)
                confirmCurrency(formData.receipt_currency.symbol);
            else setCurrencySymbol();
        }

        // handle date format for service date
        if (!(formData.service_date instanceof Date)) {
            formData.service_date = new Date();
        }
    },
    { deep: true, immediate: true }
);

// Props
if (props.popup) {
    newSubmission.value.formData.popup_expense = {
        ...formData
    };
}
// disable currency when adding new expense
let currIndex = step.value.fields.findIndex(
    (field) => field.label === 'Currency'
);
step.value.fields[currIndex].props.disabled = props.addNew;

// to update specific expense by index without immediate trigger
watch(
    () => formData,
    () => {
        let expenseIndex =
            newSubmission.value.formData?.details?.expenses[props.Index];
        expenseIndex = expenseIndex
            ? JSON.parse(JSON.stringify(expenseIndex))
            : {};

        // Clear Service Code if medical_service_type changes
        if (
            (formData.medical_service_type?.id !==
                newSubmission.value.formData.details?.expenses?.[props.Index]
                    ?.medical_service_type?.id &&
                !props.popup) ||
            (formData.medical_service_type?.id !==
                newSubmission.value.formData.popup_expense?.medical_service_type
                    ?.id &&
                props.popup)
        ) {
            formData.service_code = {};
        }

        if (props.popup) {
            newSubmission.value.formData.popup_expense = {
                ...expenseIndex,
                ...formData
            };
        } else {
            newSubmission.value.formData.details.expenses[props.Index] = {
                ...expenseIndex,
                ...formData
            };
            setSubmissionExpenseData(formData, props.Index);
        }
    },
    { deep: true }
);

// Managing Uploads
const uploadPath = (field_name, file_name) => {
    return 's3/' + field_name.split('[]')[0] + '_' + file_name;
};
const onUpload = (e) => {
    let attachments = formData.expense_attachments ?? [];
    e?.formData.forEach((value, key) => {
        // console.log({key, value});
        attachments.push({
            path: uploadPath(key, value.name),
            type: 'claim_form'
        });
    });
    formData.expense_attachments = attachments;
    // console.log({e}, attachments, 'Upload Code Here...');
};

const removeUploadedFile = (e) => {
    formData.expense_attachments = formData.expense_attachments.filter(
        (attachment) => attachment.path !== uploadPath(e.field, e.file.name)
    );
    // console.log({e}, 'Remove Upload Code Here...');
};
</script>
<template>
    <Message
        v-if="Index"
        severity="warn"
        icon="-"
        :closable="false"
        class="p-6 mb-6"
        data-testid="message-expense-currency"
        v-html="$t('midnight_sun.expense_payee_message')"
    />
    <div class="grid grid-cols-12 gap-x-6 gap-y-2">
      <template v-for="field in step.fields" :key="field.label">
          <template v-if="field.type !== 'RadioGroup'">
              <LabelField
                  :field="field"
                  v-model="formData[field.props.name]"
                  v-if="field.depends_on ? formData[field.depends_on] : 1"
                  @beforeSend="onUpload($event)"
                  @removeUploadedFile="removeUploadedFile($event)"
              />
          </template>
      </template>
    </div>
    <ConfirmDialog
        ref="currDialog"
        :style="{ width: '30rem' }"
        data-testid="dialog-confirm-expense-currency"
    >
        <template #message="{ message }">
            <div class="x" v-html="message.message" />
        </template>
    </ConfirmDialog>
</template>
