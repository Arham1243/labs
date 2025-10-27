<script setup>
import '../assets/styles/style.css';
import { watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useSubmissionStore } from '@/modules/claims/stores/Submission';
import DetailsViewHeader from '@/modules/claims/components/shared/details/DetailsViewHeader.vue';
import DetailsViewHeaderActions from '@/modules/claims/components/shared/details/DetailsViewHeaderActions.vue';
import SubmissionDetailsCard from '@/modules/claims/components/submissions/SubmissionDetailsCard.vue';
import InsuredClaimHistoryCard from '../components/shared/InsuredClaimHistoryCard.vue';

const router = useRouter();
const route = useRoute();

// Get submission id and client id from the route
const submissionId = route.params.submissionId;
const clientId = route.params.clientId;

const { getSubmissionById } = useSubmissionStore();
const { loading } = getSubmissionById(clientId, submissionId, true);

/**
 * Go back to the previous page
 */
const goBack = () => {
    router.push({ name: 'Claims' });
};

watch(
    () => route.params.submissionId,
    (newSubmissionId) => {
        if (newSubmissionId) {
            getSubmissionById(clientId, newSubmissionId, true);
        }
    },
    { immediate: true }
);
</script>

<template>
    <Loader v-if="loading" />
    <div v-else class="grid">
        <div class="col-12">
            <Header @goBack="goBack">
                <template #title>
                    <DetailsViewHeader :moduleType="'submission'" />
                </template>
                <template #actions>
                    <DetailsViewHeaderActions :moduleType="'submission'" />
                </template>
            </Header>

            <SubmissionDetailsCard />

            <InsuredClaimHistoryCard class="mt-3" />
        </div>
    </div>
</template>
