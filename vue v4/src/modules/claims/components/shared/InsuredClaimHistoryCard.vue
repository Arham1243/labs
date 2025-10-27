<script setup>
import { ref, defineExpose } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useClaimStore } from '@/modules/claims/stores/Claim';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import { useClaimInsuredStore } from '@/modules/claims/stores/Insured.js';
import ClaimHistoryCard from '@/modules/claims/components/claims/ClaimHistoryCard.vue';
import ExpenseHistoryCard from '@/modules/claims/components/expenses/ExpenseHistoryCard.vue';
import BenefitHistoryCard from '@/modules/claims/components/benefits/BenefitHistoryCard.vue';
import MoveToClaimRecommendationMsg from '@/modules/claims/components/claims/MoveToClaimRecommendationMsg.vue';

const props = defineProps({
    isFromClaim: { type: Boolean },
    popup: { type: Boolean, default: false }
});

const route = useRoute();
const { t } = useI18n();
const tabs = ref([
    t('common.benefits'),
    t('claims.title'),
    t('expenses.title')
]);

const selectedTab = ref(t('claims.title')); // Default to "Claims"
const showContent = ref(true);
const { currentClaim } = useClaimStore();
const { currentSubmission } = useSubmissionStore();
const { getInsuredById } = useClaimInsuredStore();
getInsuredById(
    route.params.clientId,
    currentSubmission.value
        ? currentSubmission.value.insured.id
        : currentClaim.value?.insured?.id
);

/**
 * Function to set the active tab
 */
const setActiveTab = (tab) => {
    selectedTab.value = tab;
};

// Expose the function so the parent can call it
defineExpose({ setActiveTab });
</script>

<template>
    <Card :class="{ 'shadow-none p-0': popup }">
        <template #title>
            <div class="flex justify-between">
                <div class="flex justify-between items-center gap-2" v-if="!popup">
                    <Button
                        text
                        :icon="'pi ' + (showContent
                            ? 'pi-chevron-down'
                            : 'pi-chevron-right')"
                        @click="showContent = !showContent"
                        data-testid="btn-toggle-expenses-table"
                    />
                    <h5 class="mb-2">
                        <span data-testid="text-submission-number">
                            {{ $t('claims.insured_claim_history') }}
                        </span>
                    </h5>
                </div>
                <div class="flex gap-2">
                    <ButtonGroup>
                        <Button
                            variant="outlined"
                            v-for="(tab, index) in tabs"
                            :key="index"
                            class="button-group-item"
                            :class="['button', { active: selectedTab === tab }]"
                            @click="setActiveTab(tab)"
                        >
                            {{ tab }}
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        </template>
        <template #content>
            <div>
                <MoveToClaimRecommendationMsg
                    v-if="
                        showContent
                        && currentSubmission?.claim_id === ''
                        && !popup
                    "
                />

                <!-- Only render BenefitHistoryCard if 'Benefits' tab is active -->
                <BenefitHistoryCard
                    class="mt-3"
                    v-if="selectedTab === t('common.benefits') && showContent"
                    :insuredId="currentSubmission
                        ? currentSubmission.insured.id
                        : currentClaim?.insured?.id"
                />

                <!-- Only render ClaimHistoryCard if 'Claims' tab is active -->
                <ClaimHistoryCard
                    class="mt-3"
                    v-if="selectedTab === t('claims.title') && showContent"
                    :currentClaimId="
                        props.isFromClaim
                            ? currentClaim?.id
                            : currentSubmission?.claim_id
                    "
                    :isFromClaim="props.isFromClaim"
                />

                <!-- Only render ExpenseHistoryCard if 'Expenses' tab is active -->
                <ExpenseHistoryCard
                    class="mt-3"
                    v-if="selectedTab === t('expenses.title') && showContent"
                    :insuredId="currentSubmission
                        ? currentSubmission.insured.id
                        : currentClaim?.insured?.id"
                />
            </div>
        </template>
    </Card>
</template>

<style>
.button-group-item {
    border-color: #CED4DA !important;
    color: black !important;
}

.button-group-item.active {
    color: white !important;
    outline: 0;
}
</style>