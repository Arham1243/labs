<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useClaimStore } from '@/modules/claims/stores/index.js';
import { useSubmissionStore } from '@/modules/claims/stores/Submission.js';
import UnassignedSubmissionDialog from '@/modules/claims/components/claims/dialogs/UnassignedSubmissionDialog.vue';

const props = defineProps({
    moduleType: { type: String }
});

const menu = ref();
const { t } = useI18n();
const unassignedSubmissionsLength = ref(0);
const showUnSignedSubmissionInQueue = ref(false);

const menuItems = ref([
    {
        label: t('submissions.send_back_action'),
        icon: 'pi pi-arrow-left',
        command: () => {}
    },
    {
        label: t('submissions.escalate_action'),
        icon: 'pi pi-user-plus',
        command: () => {}
    },
    {
        label: t('submissions.reassign_action'),
        icon: 'pi pi-dollar',
        command: () => {}
    },
    {
        label: t('submissions.send_to_oric_action'),
        icon: 'pi pi-arrow-right-arrow-left',
        command: () => {}
    }
]);

const { currentClaim } = useClaimStore();
const { searchSubmissions } = useSubmissionStore();
const { data, mutate: loadSubmissions } = searchSubmissions();
if (props.moduleType === 'claim')
    loadSubmissions([
        { field: 'insured_id', value: currentClaim?.value?.insured.id },
        { field: 'assigned_to_user_id', value: '' }
    ]);

const showMenu = (event) => {
    menu.value.toggle(event);
};

watch(
    data,
    () => {
        if (data?.value?.length) {
            unassignedSubmissionsLength.value = data?.value?.length || 0;
        }
    },
    { immediate: true }
);
</script>

<template>
    <div v-if="props.moduleType === 'claim'">
        <Button
            :label="
                t('claims.unassigned_submissions_in_queue') +
                ' (' +
                unassignedSubmissionsLength +
                ')'
            "
            icon="pi pi-file-import"
            class="mr-2 p-button-outlined"
            iconPos="left"
            data-testid="btn-open-submission-actions-menu"
            @click="showUnSignedSubmissionInQueue = true"
        />
        <UnassignedSubmissionDialog
            v-model:visible="showUnSignedSubmissionInQueue"
            @unassignedSubmissionLength="
                (length) => (unassignedSubmissionsLength = length)
            "
        />
    </div>
    <div v-else>
        <Button
            :label="$t('submissions.action')"
            icon="pi pi-chevron-down"
            class="mr-2 p-button-outlined"
            iconPos="right"
            @click="showMenu"
            data-testid="btn-open-submission-actions-menu"
        />
        <Menu
            ref="menu"
            id="overlay_menu"
            :model="menuItems"
            :popup="true"
            class="w-25rem"
            data-testid="menu-submission-actions"
        />
        <Button
            :label="$t('submissions.complete')"
            data-testid="btn-complete-submission-action"
        />
    </div>
</template>

<style scoped lang="scss"></style>
