<script setup>
import { computed, ref } from 'vue';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false
    },
    currentExpenseIndex: {
        type: Number
    }
});

const emits = defineEmits(['update:modelValue'], ['declineExpense']);
const globalStore = useGlobalStore();
const { t } = useI18n();
const { currentSubmission } = useSubmissionStore();
const { currentExpense } = useExpenseStore();

const declineExpenseTemplates = [
    { id: 1, name: 'Template 1' },
    { id: 2, name: 'Template 2' }
];

// V-Model
const template = ref();
const declineExpenseReason = ref();

const dialog = computed({
    get() {
        return props.modelValue;
    },
    set(value) {
        emits('update:modelValue', value);
    }
});

const declineExpense = async () => {
    // check if the expense service code is missing
    if (!currentExpense.value.service_code) {
        // Show success notification
        globalStore.showError(
            t('notifications.expense_changed'),
            t('notifications.service_code_required')
        );
    } else {
        const payload = {
            status: 'declined',
            amount_approved: 0,
            amount_co_pay: 0,
            amount_refund: 0,
            amount_declined: currentExpense.value.amount_claimed,
            decline_reason: declineExpenseReason.value
        };
        emits('declineExpense', payload);
    }
};
</script>

<template>
    <Dialog
        v-model:visible="dialog"
        modal
        :header="$t('expenses.decline') + ' ' + $t('expenses.expense')"
        :style="{ width: '580px' }"
    >
        <div class="flex justify-between items-center">
            <h6 data-testid="text-expense-title">
                Submission ID: {{ currentSubmission.ref_number }}
                <br />
                Expense # {{ props.currentExpenseIndex + 1 }}
            </h6>
            <ClaimStatusTag
                data-testid="tag-expense-status"
                :status="currentExpense.status"
                :icon="'pi pi-eye'"
            />
        </div>
        <divider class="mb-20 mt-20" />
        <div class="flex flex-col gap-2 mt-3">
            <label
                for="template"
                data-testid="label-expense-decline-template"
            >
                {{ $t('common.template') }}
            </label>
            <Select
                name="template"
                v-model="template"
                :options="declineExpenseTemplates"
                optionLabel="name"
                placeholder="Select"
                data-testid="select-decline-expense-template"
            />

            <Editor
                class="mt-3"
                v-model="declineExpenseReason"
                editorStyle="height: 160px"
                :pt="{
                        formats: { class: 'mr-1' },
                        color: { class: 'hidden' },
                        background: { class: 'hidden' },
                        clean: { class: 'hidden' },
                        select: { class: 'hidden' }
                    }"
                data-testid="editor-decline-expense-reason"
            />
        </div>

        <template #footer>
            <Button
                :label="$t('buttons.cancel')"
                text
                data-testid="btn-decline-expense-cancel"
                @click="dialog = false"
            />
            <Button
                :label="$t('buttons.confirm')"
                data-testid="btn-decline-expense-confirm"
                @click="declineExpense"
            />
        </template>
    </Dialog>
</template>

<style scoped lang="scss"></style>
