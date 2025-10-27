<script setup>
import { onMounted, ref, defineExpose } from 'vue';
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
const insuredId = ref('');

const selectedTab = ref(t('claims.title')); // Default to "Claims"
const showContent = ref(true);
const { currentClaim } = useClaimStore();
const { currentSubmission } = useSubmissionStore();
const { currentInsured, getInsuredById } = useClaimInsuredStore();

/**
 * Function to set the active tab
 */
const setActiveTab = (tab) => {
    selectedTab.value = tab;
};

// Expose the function so the parent can call it
defineExpose({ setActiveTab });

/**
 * On Mounted
 */
onMounted(async () => {
    insuredId.value = currentSubmission.value
        ? currentSubmission.value.insured.id
        : currentClaim.value?.insured?.id;

    if (!currentInsured.value)
        getInsuredById(route.params.clientId, insuredId?.value);
});
</script>

<template>
    <Card :class="{ 'shadow-none p-0': popup }">
        <template #content>
            <div :class="{ '-mt-3': popup }">
                <div class="flex justify-content-between align-items-center">
                    <div
                        class="flex justify-content-between align-items-center gap-2"
                        v-if="!popup"
                    >
                        <Button
                            text
                            :icon="
                                'pi ' +
                                (showContent
                                    ? 'pi-chevron-down'
                                    : 'pi-chevron-right')
                            "
                            @click="showContent = !showContent"
                            data-testid="btn-toggle-expenses-table"
                        />
                        <div>
                            <h5 class="mb-2">
                                <span data-testid="text-submission-number">
                                    {{ $t('claims.insured_claim_history') }}
                                </span>
                            </h5>
                        </div>
                    </div>

                    <div class="flex gap-2">
                        <div class="button-group">
                            <button
                                v-for="(tab, index) in tabs"
                                :key="index"
                                :class="[
                                    'button',
                                    { active: selectedTab === tab }
                                ]"
                                @click="setActiveTab(tab)"
                            >
                                {{ tab }}
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    v-if="
                        showContent &&
                        currentSubmission?.claim_id === '' &&
                        !popup
                    "
                >
                    <MoveToClaimRecommendationMsg :clientId="props.clientId" />
                </div>

                <!-- Only render BenefitHistoryCard if 'Benefits' tab is active -->
                <BenefitHistoryCard
                    class="mt-3"
                    v-if="selectedTab === t('common.benefits') && showContent"
                    :insuredId="insuredId"
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
                    :insuredId="insuredId"
                />
            </div>
        </template>
    </Card>
</template>
