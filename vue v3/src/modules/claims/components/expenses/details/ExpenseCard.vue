<script setup>
import { inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useExpenseStore } from '@/modules/claims/stores/Expense';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import DeclineExpenseDialog from '@/modules/claims/components/expenses/dialogs/DeclineExpenseDialog.vue';
import ApproveExpenseDialog from '@/modules/claims/components/expenses/dialogs/ApproveExpenseDialog.vue';
import ExpenseDetailsCard from '@/modules/claims/components/expenses/details/card/ExpenseDetailsCard.vue';
import DiagnosisCard from '@/modules/claims/components/expenses/details/card/DiagnosisCard.vue';
import ExpenseNotesCard from '@/modules/claims/components/expenses/details/card/ExpenseNotesCard.vue';

const props = defineProps({
    currentExpenseIndex: { type: Number }
});

const { t } = useI18n();
const route = useRoute();
const user = inject('currentUser');
const { currentExpense, changeExpenseStatus: changeExpenseStatusStore } =
    useExpenseStore();
const { mutate: changeStatusMutation } = changeExpenseStatusStore();
const { currentSubmission, getSubmissionById } = useSubmissionStore();

const menu = ref();
const showEditDiagnosis = ref(false);
const showApproveExpenseDialog = ref(false);
const showDeclineExpenseDialog = ref(false);

// Action button dropdown menu items
const menuItems = ref([
    {
        label: t('submissions.send_back_action'),
        icon: 'pi pi-arrow-left',
        command: () => {}
    }
]);

/**
 * Show action button dropdown menu
 * @param event
 */
const showMenu = (event) => {
    menu.value.toggle(event);
};

/**
 * Show expense action dialog (approve/decline)
 * @param action
 */
const showExpenseActionDialog = (action) => {
    if (action === 'decline') {
        showDeclineExpenseDialog.value = true;
    } else if (action === 'approve') {
        showApproveExpenseDialog.value = true;
    }
};

/**
 * Change expense status
 * @param payload
 * @returns {Promise<void>}
 */
const updateExpenseStatus = async (payload) => {
    try {
        await changeStatusMutation({
            tenantId: route.params.clientId,
            expenseId: currentExpense.value.id,
            formData: payload
        });
    } catch (error) {
        console.log(error);
    }

    showApproveExpenseDialog.value = false;
    showDeclineExpenseDialog.value = false;
};

/**
 * Watch for the current expense changes
 */
watch(
    () => currentExpense.value,
    () => {
        getSubmissionById(
            route.params.clientId,
            currentSubmission.value.id,
            true
        );
        showEditDiagnosis.value = false;
    }
);
</script>

<template>
    <ExpenseDetailsCard :currentExpenseIndex="currentExpenseIndex" />

    <DiagnosisCard />

    <ExpenseNotesCard />

    <div class="flex justify-content-between mt-5">
        <Button
            class="cursor-pointer bg-green-500 border-0 pl-5 pr-5"
            :label="t('expenses.approve')"
            icon="pi pi-check"
            iconPos="left"
            data-testid="btn-approve-expense"
            :disabled="currentExpense.diagnosis === ''"
            @click="showExpenseActionDialog('approve')"
        />
        <Button
            class="cursor-pointer bg-red-500 border-0 pl-5 pr-5"
            :label="t('expenses.decline')"
            icon="pi pi-times"
            iconPos="left"
            data-testid="btn-decline-expense"
            :disabled="currentExpense.diagnosis === ''"
            @click="showExpenseActionDialog('decline')"
        />
        <Button
            class="cursor-pointer pl-5 pr-5"
            label="More Actions"
            outlined
            @click="showMenu"
            data-testid="btn-more-actions-on-expense"
        />
        <Menu
            ref="menu"
            id="overlay_menu"
            :model="menuItems"
            :popup="true"
            class="w-25rem"
            data-testid="menu-expense-actions"
        />
    </div>

    <ApproveExpenseDialog
        v-if="showApproveExpenseDialog"
        v-model="showApproveExpenseDialog"
        :currentExpenseIndex="props.currentExpenseIndex"
        @approveExpense="
            (payload) => {
                updateExpenseStatus({
                    ...payload,
                    user_id: user.id
                });
            }
        "
    />
    <DeclineExpenseDialog
        v-if="showDeclineExpenseDialog"
        v-model="showDeclineExpenseDialog"
        :currentExpenseIndex="props.currentExpenseIndex"
        @declineExpense="
            (payload) => {
                updateExpenseStatus({
                    ...payload,
                    user_id: user.id
                });
            }
        "
    />
</template>

<style scoped lang="scss"></style>
