<script setup>
import { useRoute, useRouter } from 'vue-router';
import { useClaimStore } from '@/modules/claims/stores/Claim';
import { ref, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import DetailsViewHeader from '@/modules/claims/components/shared/details/DetailsViewHeader.vue';
import DetailsViewHeaderActions from '@/modules/claims/components/shared/details/DetailsViewHeaderActions.vue';
import ClaimDetailsCard from '@/modules/claims/components/claims/ClaimDetailsCard.vue';
import InsuredClaimHistoryCard from '@/modules/claims/components/shared/InsuredClaimHistoryCard.vue';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

// Get claim id and client id from the route
const claimId = route.params.claimId;
const clientId = route.params.clientId;

const { getClaimById, currentClaim, setCurrentClaim } = useClaimStore();

// // Clear any stale claim data first to prevent cache issues
// if (currentClaim.value?.id !== claimId) {
//     setCurrentClaim(null);
// }

const { loading } = getClaimById(clientId, claimId, true);

// watch(
//     () => currentClaim,
//     () => {
//         if (currentClaim?.value?.id !== claimId)
//             getClaimById(clientId, claimId, true);
//     },
//     { immediate: true, deep: true }
// );

watch(
    () => route.params.claimId,
    (newClaimId) => {
        if (newClaimId && currentClaim.value?.id !== newClaimId) {
            getClaimById(clientId, newClaimId, true);
        }
    }
);

const historySection = ref(null);
const scrollToClaimsTab = () => {
    if (historySection.value) {
        // Change the tab
        historySection.value.setActiveTab(t('claims.title')); // Set to "Claims" dynamically

        // Wait for DOM updates, then scroll
        nextTick(() => {
            historySection.value.$el.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        });
    }
};
</script>

<template>
    <Loader v-if="loading" />
    <div v-else class="grid grid-cols-12 gap-6">
        <div class="col-span-12">
            <Header @goBack="router.go(-1)">
                <template #title>
                    <DetailsViewHeader :moduleType="'claim'" />
                </template>
                <template #actions>
                    <DetailsViewHeaderActions
                        :moduleType="'claim'"
                        @viewClaimHistory="scrollToClaimsTab"
                    />
                </template>
            </Header>

            <ClaimDetailsCard @scrollToClaimsTab="scrollToClaimsTab" />

            <InsuredClaimHistoryCard
                ref="historySection"
                :isFromClaim="true"
                class="mt-12"
            />
        </div>
    </div>
</template>

<style scoped lang="scss"></style>
