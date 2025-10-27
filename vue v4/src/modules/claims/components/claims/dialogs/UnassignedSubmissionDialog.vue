<script setup>
import { computed, inject, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useClaimStore } from '@/modules/claims/stores/index.js';
import { useSubmissionStore } from '@/modules/claims/stores/Submission.js';
import { createSubmissionCols } from '@/modules/claims/config/submissions.js';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const currentUser = inject('currentUser');

const tableRef = ref(null);
const showButtons = ref(false);
const selectedSubmission = ref({});
const showMoveSubmission = ref(false);
const showClearSelection = ref(false);
const visible = defineModel('visible');
const submissionColumns = createSubmissionCols(t);
const emit = defineEmits(['unassignedSubmissionLength']);

const { currentClaim } = useClaimStore();
const { searchSubmissions, moveSubmissionToClaim } = useSubmissionStore();

const {
    loading: moveSubmissionLoading,
    mutate,
    status: moveSubmissionStatus
} = moveSubmissionToClaim();

const getColumns = (type) => {
    return submissionColumns[type]?.() || [];
};

const moveSubmissionContent = computed(() => {
    return t('submissions.move_submission_to_claim_content');
});

const clearSelectionContent = computed(() => {
    return t('submissions.clear_selection_content');
});

const clearSelection = () => {
    if (tableRef.value) {
        tableRef.value.selectedData = null;
        showButtons.value = false;
    }
};

const handleSelectedData = (selectedData) => {
    if (selectedData?.id) {
        selectedSubmission.value = selectedData;
        showButtons.value = true;
    }
};

watch(
    () => moveSubmissionLoading,
    () => {
        if (
            !moveSubmissionLoading.value &&
            moveSubmissionStatus.value === 'success'
        ) {
            // Close the dialog
            showMoveSubmission.value = false;

            router
                .push({
                    name: 'Claim Details',
                    params: {
                        claimId: currentClaim.value.id,
                        clientId: route.params.clientId
                    }
                })
                .then(() => {
                    // ! Due to the elastic search is not refresh, has to reload the page after navigation,
                    location.reload();
                });
        }
    },
    { deep: true }
);
</script>

<template>
    <Dialog
        v-model:visible="visible"
        modal
        :header="t('claims.unassigned_submissions_in_queue')"
        :style="{ width: '1380px' }"
        data-testid="dialog-unassigned-submission-in-queue"
    >
        <div class="submission-table-actions p-3" v-if="showButtons">
            <Confirmation
                v-if="showMoveSubmission"
                show-alert-icon
                v-model="showMoveSubmission"
                :header="t('submissions.move_submission_to_current_claim')"
                :content="moveSubmissionContent"
                @confirm="
                    mutate({
                        client_id: route.params.clientId,
                        claim_id: currentClaim.id,
                        user_id: currentUser?.id,
                        submission_id: selectedSubmission.id
                    })
                "
                :confirmButtonIcon="'pi pi-check'"
                :cancelButtonIcon="'pi pi-times'"
                data-testid="dialog-move-submission-confirmation"
            />
            <Button
                :label="t('submissions.move_submission_to_current_claim')"
                icon="pi pi-arrow-right"
                @click="showMoveSubmission = true"
                class="p-button-outlined mr-2"
                data-testid="btn-move-submission-to-current-claim"
            />
            <Confirmation
                v-if="showClearSelection"
                v-model="showClearSelection"
                :header="t('common.clear_selection')"
                :content="clearSelectionContent"
                @confirm="clearSelection"
                :confirmButtonText="t('common.yes')"
                :cancelButtonText="t('common.no')"
                data-testid="dialog-clear-selection"
            />
            <Button
                :label="t('submissions.clear')"
                icon="pi pi-times"
                @click="showClearSelection = true"
                class="p-button-outlined mr-2"
                data-testid="btn-clear-selection"
            />
        </div>
        <ClaimBaseTable
            class="mt-5"
            ref="tableRef"
            :module="t('submissions.title')"
            :payload="[
                { field: 'insured_id', value: currentClaim.insured.id },
                { field: 'assigned_to_user_id', value: '' }
            ]"
            :storeAction="searchSubmissions"
            :columns="getColumns('unassignedSubmissionInQueue')"
            :onRowSelectionMode="'single'"
            @dataLength="(length) => emit('unassignedSubmissionLength', length)"
            @selectedData="(selectedData) => handleSelectedData(selectedData)"
        />
    </Dialog>
</template>

<style scoped lang="scss"></style>
