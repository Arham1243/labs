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
    <div class="flex justify-between align-items-center">
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
            <Tabs :lazy="true" :value="activeTab">
                <TabList>
                    <Tab :value="0" @click="activeTab = 0" data-testid="tab-assigned-to-me">
                        <p class="m-0">
                            {{ $t('submissions.assigned_to_me') }}
                            <span>
                                <Badge
                                    v-if="activeSubmissionsLength"
                                    :value="activeSubmissionsLength"
                                    class="ml-1"
                                    :severity="activeTab === 0 ? '' : 'secondary'"
                                    data-testid="badge-active-submissions"
                                />
                            </span>
                        </p>
                    </Tab>
                    <Tab :value="1" @click="activeTab = 1" data-testid="tab-completed-today">
                        <p class="m-0">
                            {{ $t('submissions.completed') }}
                            <span>
                                <Badge
                                    v-if="completedSubmissionsLength"
                                    :value="completedSubmissionsLength"
                                    class="ml-1"
                                    :severity="activeTab === 1 ? '' : 'secondary'"
                                    data-testid="badge-completed-submissions"
                                />
                            </span>
                        </p>
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel :value="0">
                        <ClaimBaseTable
                            :module="t('submissions.title')"
                            class="mt-5"
                            :payload="[
                                { field: 'assigned_to_user_id', value: currentUser.id },
                                { field: 'status', value: 'pending' }
                            ]"
                            :storeAction="searchSubmissions"
                            :columns="getColumns('assigned')"
                            :onRowSelectAction="handleRowSelect"
                            :filterComponents="assignedSubmissionComponents"
                            @dataLength="(length) => (activeSubmissionsLength = length)"
                        />
                    </TabPanel>
                    <TabPanel :value="1">
                        <ClaimBaseTable
                            class="mt-5"
                            :payload="[
                                { field: 'assigned_to_user_id', value: currentUser.id },
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
                </TabPanels>
            </Tabs>
        </template>
    </Card>
</template>
