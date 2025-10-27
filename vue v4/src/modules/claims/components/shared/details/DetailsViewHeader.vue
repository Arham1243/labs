<script setup>
import { ref } from 'vue';
import { useHelpers } from '@/composables';
import { calculateAge } from '@/modules/claims/utils/helper';
import { useClaimPolicyStore } from '@/modules/claims/stores/Policy';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useClaimStore } from '@/modules/claims/stores/Claim';
import ClaimStatusTag from '@/modules/claims/components/shared/ClaimStatusTag.vue';
import InsureSummarySidebar from '@/modules/claims/components/shared/InsuredSummarySidebar.vue';

const props = defineProps({
    moduleType: { type: String, required: true }
});

const helpers = useHelpers();
const currentItem = ref({});
if (props.moduleType === 'submission') {
    const { currentSubmission } = useSubmissionStore();
    currentItem.value = currentSubmission.value;
} else {
    const { currentClaim } = useClaimStore();
    currentItem.value = currentClaim.value;
}

const showInsuredSummarySidebar = ref(false);
const activeInsuredSummarySidebarTab = ref();

const { currentPolicy } = useClaimPolicyStore();
</script>

<template>
    <div>
        <div class="p-break-word pb-2">
            <a
                class="cursor-pointer underline"
                @click="
                    showInsuredSummarySidebar = true;
                    activeInsuredSummarySidebarTab = 0;
                "
                data-testid="link-open-insured-sidebar"
            >
                {{ currentItem?.insured?.name || 'testtest' }}
            </a>
        </div>
        <div class="flex justify-between gap-2">
            <h5
                class="header-subtitle"
                data-testid="text-insured-birth-and-age"
            >
                {{ helpers.formatDate(currentItem?.insured.dob) }} ({{
                    calculateAge(currentItem?.insured.dob)
                }}
                Years Old) • Policy #
                <a
                    class="cursor-pointer underline"
                    @click="
                        showInsuredSummarySidebar = true;
                        activeInsuredSummarySidebarTab = 1;
                    "
                    data-testid="link-open-policy-sidebar"
                >
                    {{
                        (currentPolicy?.id === currentItem?.policy?.id &&
                            currentPolicy?.number) ||
                        currentItem?.policy?.number ||
                        '123456'
                    }}
                </a>
                <span>
                    ({{
                        helpers.formatDate(
                            (currentPolicy?.id === currentItem?.policy?.id &&
                                currentPolicy?.start_date) ||
                                currentItem?.policy?.start_date
                        )
                    }}
                    to
                    {{
                        helpers.formatDate(
                            (currentPolicy?.id === currentItem?.policy?.id &&
                                currentPolicy?.end_date) ||
                                currentItem?.policy?.end_date
                        )
                    }})
                </span>
            </h5>
            <ClaimStatusTag
                v-if="currentItem?.policy?.status"
                :status="
                    currentItem.policy.status.replace(/_/g, ' ').toUpperCase()
                "
                data-testid="tag-submission-status"
            />
        </div>
    </div>
    <Drawer
        v-model:visible="showInsuredSummarySidebar"
        header=" "
        position="right"
        class="insured-summary-sidebar"
        data-testid="sidebar-information"
    >
        <InsureSummarySidebar
            :insuredId="currentItem.insured.id"
            :activeSideBarTab="activeInsuredSummarySidebarTab"
        />
    </Drawer>
</template>
