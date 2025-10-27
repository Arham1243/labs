<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import InsuredClaimHistoryCard from '@/modules/claims/components/shared/InsuredClaimHistoryCard.vue';

const props = defineProps({
    expenseId: {
        type: [Number, String]
    },
    clientId: {
        type: [Number, String]
    }
});

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const { currentSubmission } = useSubmissionStore();

const policyMenu = ref();
const submissionMenu = ref();
const showClaimHistoryDialog = ref(false);

const policyMenuItems = ref([
    {
        label: 'Policy Wording',
        command: () => showPolicyWordingDialog()
    },
    {
        label: 'Policy Summary',
        command: () => showPolicySummaryDialog()
    }
]);

const showPolicyWordingDialog = () => {};
const showPolicySummaryDialog = () => {};

const showMenu = (type, event) => {
    switch (type) {
        case 'policy':
            policyMenu.value.toggle(event);
            break;

        case 'submission':
            submissionMenu.value.toggle(event);
            break;
    }
};

const documentBody = ref();
onMounted(() => (documentBody.value = document.body));
</script>

<template>
    <div
        class="w-full fixed bg-white flex items-center justify-between p-3 py-5 shadow-xl z-10"
    >
        <div class="flex gap-4">
          <Button
              icon="pi pi-angle-left"
              variant="outlined"
              @click="router.back()"
              size="large"
              data-testid="btn-expence-go-back"
          />
          <div>
            <div class="flex flex-wrap items-center gap-2">
                <h5 class="text-xl" data-testid="text-submission-id">
                    {{ t('submissions.submission_id') }}
                    {{ currentSubmission.ref_number }}
                </h5>
                <span
                    v-if="currentSubmission.claim_id === ''"
                    class="font-normal"
                >
                    ({{ t('submissions.not_attached') }})
                </span>
                <span
                    v-else
                    class="cursor-pointer"
                    @click="
                        router.push({
                            name: 'Claim Details',
                            params: {
                                claimId: currentSubmission.claim_id,
                                clientId: route.params.clientId
                            }
                        })
                    "
                >
                    (<span class="underline"
                >{{ t('claims.claim') }}:
                        {{ currentSubmission.claim.ref_number }}</span
                >)
                </span>
                <ClaimStatusTag
                    class="text-xs"
                    status="review"
                    icon="pi pi-search"
                    data-testid="tag-submission-status"
                />
            </div>
            <div class="flex mt-1">
                <span data-testid="text-insured-name">
                    {{ currentSubmission.policy.holder }} • Policy #&nbsp;
                </span>
                    <span
                        class="cursor-pointer underline text-blue-600"
                        data-testid="link-open-policy-dropdown"
                        @click="showMenu('policy', $event)"
                    >
                    {{ currentSubmission.policy.number }}
                </span>
                <Menu
                        ref="policyMenu"
                        id="overlay_menu"
                        :model="policyMenuItems"
                        :popup="true"
                        class="w-15rem"
                        data-testid="menu-submission-actions"
                    />
            </div>
            </div>
        </div>

        <div class="flex gap-2">
            <Button
                class="border-1 border-gray-600 border-round p-3 cursor-pointer hover:bg-black-alpha-10"
                :label="t('expenses.expense_table')"
                icon="pi pi-list"
                outlined
                data-testid="btn-open-expenses-table-dialog"
            />
            <Button
                class="border-1 border-gray-600 border-round p-3 cursor-pointer hover:bg-black-alpha-10"
                :label="t('activities.activities')"
                icon="pi pi-folder"
                outlined
                data-testid="btn-open-activities-dialog"
            />
            <Button
                class="border-1 border-gray-600 border-round p-3 cursor-pointer hover:bg-black-alpha-10"
                :label="t('logs.title')"
                icon="pi pi-history"
                outlined
                data-testid="btn-open-logs-dialog"
            />
            <Button
                class="border-1 border-gray-600 border-round p-3 cursor-pointer hover:bg-black-alpha-10"
                :label="t('claims.claim_history')"
                icon="pi pi-calendar"
                outlined
                data-testid="btn-open-claim-history-dialog"
                @click="showClaimHistoryDialog = true"
            />
            <Dialog
                v-model:visible="showClaimHistoryDialog"
                modal
                header="Insured Claim History"
                style="width: 80%"
                @click="documentBody.classList.add('p-overflow-hidden')"
            >
                <InsuredClaimHistoryCard
                    ref="historySection"
                    :popup="true"
                    :isFromClaim="true"
                    class="mt-3"
                />
            </Dialog>
        </div>
    </div>
    <div class="h-[5.6rem]" />
</template>
