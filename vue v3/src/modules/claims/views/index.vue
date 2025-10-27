<script setup>
import { inject, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { createSubmissionCols } from '@/modules/claims/config/submissions.js';
import { useSubmissionStore } from '@/modules/claims/stores/Submission.js';
import { assignedSubmissionComponents } from '@/modules/claims/config/filter.js';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';

const { t } = useI18n();
const router = useRouter();
const activeTab = ref(0);
const activeSubmissionsLength = ref();
const completedSubmissionsLength = ref();
const currentUser = inject('currentUser');
const submissionColumns = createSubmissionCols(t);

const { searchSubmissions } = useSubmissionStore();
const { mutate, meta, loading, status } = searchSubmissions();

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

watch(
    () => status.value,
    () => {
        if (status.value === 'success') {
            completedSubmissionsLength.value = meta.value.total;
        }
    }
);

onMounted(() => {
    mutate([
        { field: 'assigned_to_user_id', value: currentUser?.value?.id },
        { field: 'status', value: 'completed' }
    ]);
});
</script>

<template>
    <div class="flex justify-content-between align-items-center">
        <h4>{{ $t('submissions.assigned_submissions') }}</h4>
        <div class="flex gap-3">
            <Button
                label="New Submission"
                icon="pi pi-plus"
                data-testid="btn-new-submission"
                @click="router.push('/claims/submissions/new/search')"
                outlined
            />
            <Button
                :label="$t('claims.quick_search')"
                icon="pi pi-search"
                data-testid="btn-quick-search"
                outlined
            />
        </div>
    </div>

    <Card class="mt-5">
        <template #content>
            <TabView :lazy="true" v-model:activeIndex="activeTab">
                <TabPanel>
                    <template #header>
                        <div
                            class="line-height-3"
                            data-testid="tab-assigned-to-me"
                        >
                            {{ $t('submissions.assigned_to_me') }}
                        </div>
                        <Badge
                            v-if="activeSubmissionsLength"
                            :value="activeSubmissionsLength"
                            class="ml-1"
                            :class="{
                                'p-badge-secondary': activeTab !== 0
                            }"
                            data-testid="badge-active-submissions"
                        />
                    </template>
                    <ClaimBaseTable
                        :module="t('submissions.title')"
                        class="mt-5"
                        :payload="[
                            {
                                field: 'assigned_to_user_id',
                                value: currentUser.id
                            },
                            { field: 'status', value: 'pending' }
                        ]"
                        :storeAction="searchSubmissions"
                        :columns="getColumns('assigned')"
                        :onRowSelectAction="handleRowSelect"
                        :filterComponents="assignedSubmissionComponents"
                        @dataLength="
                            (length) => (activeSubmissionsLength = length)
                        "
                    />
                </TabPanel>
                <TabPanel>
                    <template #header>
                        <div
                            class="line-height-3"
                            data-testid="tab-completed-today"
                        >
                            {{ $t('submissions.completed') }}
                        </div>
                        <Badge
                            v-if="completedSubmissionsLength"
                            :value="completedSubmissionsLength"
                            class="ml-1"
                            :class="{
                                'p-badge-secondary': activeTab !== 1
                            }"
                            data-testid="badge-completed-submissions"
                        />
                    </template>
                    <ClaimBaseTable
                        :module="t('submissions.title')"
                        class="mt-5"
                        :payload="[
                            {
                                field: 'assigned_to_user_id',
                                value: currentUser.id
                            },
                            { field: 'status', value: 'completed' }
                        ]"
                        :storeAction="searchSubmissions"
                        :columns="getColumns('assigned')"
                        :onRowSelectAction="handleRowSelect"
                        :filterComponents="assignedSubmissionComponents"
                        @dataLength="
                            (length) => (completedSubmissionsLength = length)
                        "
                    />
                </TabPanel>
            </TabView>
        </template>
    </Card>
</template>
