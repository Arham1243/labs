<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSubmissionStore } from '@/modules/claims/stores/Submission.js';
import { createSubmissionCols } from '@/modules/claims/config/submissions.js';
import { submissionComponents } from '@/modules/claims/config/filter.js';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';

const { t } = useI18n();
const router = useRouter();
const { searchSubmissions, exportSubmissions } = useSubmissionStore();
const submissionColumns = createSubmissionCols(t);

const getColumns = (type) => {
    return submissionColumns[type]?.() || [];
};

const handleRowSelect = (event) => {
    if (
        !event.originalEvent.target?.classList?.contains('p-radiobutton-box') &&
        !event.originalEvent.target?.parentElement?.classList?.contains(
            'p-radiobutton-icon'
        ) &&
        !event.originalEvent.target?.classList?.contains('p-radiobutton-icon')
    ) {
        router.push(
            `/claims/submissions/${event.data.id}/client/${event.data.client_id}`
        );
    }
};
</script>
<template>
    <h4>{{ t('submissions.submission_list') }}</h4>
    <Card class="mt-5">
        <template #content>
            <ClaimBaseTable
                :module="t('submissions.title')"
                :storeAction="searchSubmissions"
                :exportAction="exportSubmissions"
                :columns="getColumns('allSubmission')"
                :onRowSelectAction="handleRowSelect"
                :showExportButton="true"
                :filterComponents="submissionComponents"
            />
        </template>
    </Card>
</template>
