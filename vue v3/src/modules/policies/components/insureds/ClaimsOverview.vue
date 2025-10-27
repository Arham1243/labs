<script setup>
import { onMounted, ref, watch } from 'vue';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';
import { createClaimsCols } from '@/modules/claims/config/claims.js';
import { createSubmissionCols } from '@/modules/claims/config/submissions.js';
import { useSubmissionStore } from '@/modules/claims/stores/Submission.js';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useClaimStore } from '@/modules/claims/stores/index.js';

const props = defineProps({
    insured: {
        type: Object,
        default: () => ({})
    }
});

const { t } = useI18n();
const router = useRouter();
const { searchSubmissions, exportSubmissions } = useSubmissionStore();
const { mutate, meta, loading, status } = searchSubmissions();
const { searchClaims_, exportClaims } = useClaimStore();

const activeTab = ref(0);
const submissionsLength = ref();
const claimsLength = ref();
const claimColumns = createClaimsCols(t);
const submissionColumns = createSubmissionCols(t);

const getClaimsColumns = (type) => {
    return claimColumns[type]?.() || [];
};

const getSubmissionsColumns = (type) => {
    return submissionColumns[type]?.() || [];
};

const handleSubmissionsRowSelect = (event) => {
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

const handleClaimsRowSelect = (event) => {
    if (
        !event.originalEvent.target?.classList?.contains('p-radiobutton-box') &&
        !event.originalEvent.target?.parentElement?.classList?.contains(
            'p-radiobutton-icon'
        ) &&
        !event.originalEvent.target?.classList?.contains('p-radiobutton-icon')
    ) {
        router.push(`/claims/${event.data.id}/client/${event.data.client_id}`);
    }
};

watch(
    () => status.value,
    () => {
        if (status.value === 'success') {
            submissionsLength.value = meta.value.total;
        }
    }
);

onMounted(() => {
    mutate([{ field: 'insured_id', value: props.insured.id }]);
});

const emits = defineEmits(['refresh']);
</script>

<template>
    <Card>
        <template #content>
            <TabView :lazy="true" v-model:activeIndex="activeTab">
                <TabPanel>
                    <template #header>
                        <div class="line-height-3" data-testid="tab-claims">
                            {{ $t('insured_overview.headers.claims') }}
                        </div>
                        <Badge
                            v-if="claimsLength"
                            :value="claimsLength"
                            class="ml-1"
                            :class="{
                                'p-badge-secondary': activeTab !== 0
                            }"
                            data-testid="badge-claims"
                        />
                    </template>
                    <ClaimBaseTable
                        class="mt-5"
                        :payload="[
                            { field: 'insured_id', value: props.insured.id }
                        ]"
                        @dataLength="(length) => (claimsLength = length)"
                        :module="t('claims.title')"
                        :storeAction="searchClaims_"
                        :columns="getClaimsColumns('insuredClaimsCols')"
                        :showExportButton="true"
                        :exportAction="exportClaims"
                        :onRowSelectAction="handleClaimsRowSelect"
                    />
                </TabPanel>
                <TabPanel>
                    <template #header>
                        <div
                            class="line-height-3"
                            data-testid="tab-submissions"
                        >
                            {{ $t('submissions.title') }}
                        </div>
                        <Badge
                            v-if="submissionsLength"
                            :value="submissionsLength"
                            class="ml-1"
                            :class="{
                                'p-badge-secondary': activeTab !== 1
                            }"
                            data-testid="badge-submissions"
                        />
                    </template>
                    <ClaimBaseTable
                        class="mt-5"
                        :payload="[
                            { field: 'insured_id', value: props.insured.id }
                        ]"
                        @dataLength="(length) => (submissionsLength = length)"
                        :module="t('submissions.title')"
                        :storeAction="searchSubmissions"
                        :columns="getSubmissionsColumns('insuredClaimsCols')"
                        :showExportButton="true"
                        :exportAction="exportSubmissions"
                        :onRowSelectAction="handleSubmissionsRowSelect"
                    />
                </TabPanel>
            </TabView>
        </template>
    </Card>
</template>
