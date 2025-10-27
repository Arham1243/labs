<script setup>
import { ref } from 'vue';
import helpers from '@/utils/helpers';
import { useI18n } from 'vue-i18n';

const emits = defineEmits(['closeExpenseForm'], ['createExpense']);

const { t } = useI18n();

const error = ref({
    benefit: '',
    service_code: ''
});

const formData = ref({
    service_date: '',
    received_date: helpers.formatDate(new Date()),
    benefit_id: '', // ! Change this to the real value
    description: '',
    diagnosis: '',
    amount: '',
    is_payee_self: true,
    beneficiary_id: '1733416764855513846', // ! Change this to the real value
    attach_file: '',
    payment_method_id: '1733416764855512937', // ! Change this to the real value
    service_code_id: '' // ! Change this to the real value
});

/**
 * Create expense
 */
const createExpense = () => {
    const hasError = ref(false);

    if (!formData.value.benefit_id) {
        error.value.benefit = t('error.error_benefit');
        hasError.value = true;
    }

    if (!formData.value.service_code_id) {
        error.value.service_code = t('error.error_service_code');
        hasError.value = true;
    }

    if (!hasError.value) emits('createExpense', formData.value);
};

const onUpload = () => {};
</script>

<template>
    <div class="p-fluid formgrid grid mt-4">
        <div class="field col-6">
            <label for="service_date" data-testid="label-service-date">{{
                $t('expenses.service_date')
            }}</label>
            <DatePicker
                data-testid="date-picker-service-date"
                id="service_date"
                v-model="formData.service_date"
            />
        </div>
        <div class="field col-6">
            <label for="received_date" data-testid="label-received-date">{{
                $t('expenses.received_date')
            }}</label>
            <DatePicker
                data-testid="date-picker-received-date"
                id="received_date"
                v-model="formData.received_date"
            />
        </div>
        <div class="field col-12">
            <label for="benefit_code" data-testid="label-benefit-code">{{
                $t('expenses.benefit_code')
            }}</label>
            <ApiDropdown
                data-testid="dropdown-benefit-code"
                id="benefit_code"
                :items="[]"
            />
            <small
                v-if="error.service_code"
                class="mt-2 text-red-500"
                v-html="error.service_code"
                data-testid="text-error-expense-benefit"
            />
        </div>
        <div class="field col-12">
            <label for="benefit" data-testid="label-benefit">{{
                $t('common.benefit')
            }}</label>
            <InputText data-testid="input-benefit" id="benefit" disabled />
            <small
                v-if="error.benefit"
                class="mt-2 text-red-500"
                v-html="error.benefit"
                data-testid="text-error-expense-benefit"
            />
        </div>
        <div class="field col-12">
            <label for="insured_notes" data-testid="label-insured-notes">{{
                $t('insureds.insured_notes')
            }}</label>
            <Textarea
                data-testid="textarea-insured-notes"
                id="insured_notes"
                v-model="formData.description"
            />
        </div>
        <div class="field col-12">
            <label for="diagnosis" data-testid="label-diagnosis">{{
                $t('expenses.diagnosis')
            }}</label>
            <InputText
                data-testid="input-diagnosis"
                id="diagnosis"
                v-model="formData.diagnosis"
            />
        </div>
        <div class="field col-12">
            <label for="expense_amt" data-testid="label-expense-amt">{{
                $t('expenses.expense_amt')
            }}</label>
            <InputNumber
                id="expense_amt"
                currency="CAD"
                locale="en-US"
                mode="currency"
                data-testid="input-expense-amt"
                v-model="formData.amount"
            />
        </div>
        <!--        <div class="field col-12">-->
        <!--            <label for="beneficiary" data-testid="label-beneficiary">{{-->
        <!--                $t('expenses.beneficiary')-->
        <!--            }}</label>-->
        <!--            <ApiDropdown data-testid="dropdown-beneficiary" id="beneficiary" />-->
        <!--        </div>-->
        <div class="field col-12">
            <label for="attach_file" data-testid="label-attachment">{{
                $t('expenses.attach_file')
            }}</label>
            <FileUpload
                name="files[]"
                url=""
                :maxFileSize="1000000"
                @upload="onUpload"
                :pt="{
                    buttonbar: {
                        class: 'p-3 bg-white border-round',
                        style: {
                            border: '1px solid #DDD'
                        }
                    },
                    content: { class: 'hidden' }
                }"
                data-testid="upload-attachment"
            >
                <template #header="{ chooseCallback }">
                    <a
                        class="flex gap-2 align-items-center text-color-secondary"
                        @click="chooseCallback()"
                    >
                        <i class="pi pi-paperclip" />
                        choose file
                    </a>
                </template>
            </FileUpload>
        </div>
    </div>

    <div class="flex mt-2 gap-2 justify-content-end">
        <Button
            label="Cancel"
            text
            data-testid="btn-expense-form-cancel"
            @click="emits('closeExpenseForm')"
        />
        <Button
            label="Save"
            data-testid="btn-save-new-expense"
            @click="createExpense"
        />
    </div>
</template>
