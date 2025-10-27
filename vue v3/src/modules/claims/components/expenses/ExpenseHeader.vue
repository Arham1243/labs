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
        class="w-full fixed bg-white flex align-items-center py-3 pl-3 pr-3 shadow-3 z-4"
    >
        <a
            :href="
                '/claims/submissions/' +
                currentSubmission.id +
                '/client/' +
                route.params.clientId
            "
            class="border-1 border-gray-600 border-round p-3 cursor-pointer hover:bg-black-alpha-10"
            data-testid="btn-go-back-to-submission"
        >
            <i class="pi pi-times"></i>
        </a>

        <div class="flex flex-column flex-grow-1">
            <div class="flex flex-row align-items-center mb-1">
                <h5 class="text-xl ml-3 mr-2" data-testid="text-submission-id">
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
                    class="font-normal ml-1 cursor-pointer"
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
                    class="mr-2 ml-1 text-xs"
                    status="review"
                    icon="pi pi-search"
                    data-testid="tag-submission-status"
                />
            </div>
            <p class="ml-3 flex">
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
            </p>
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
    <div class="fixed-height" />
</template>

<style scoped lang="scss">
.fixed-height {
    height: 5.5rem;
}
</style>
