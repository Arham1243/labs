<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import ScheduledJobTable from '@/modules/administration/components/scheduled-jobs/ScheduledJobTable.vue';
const { t } = useI18n();
const router = useRouter();

const goBack = () => {
    router.push({ name: 'Administration' });
};
</script>

<template>
    <div>
        <div class="flex items-center gap-6 custom-button-header-action">
            <Button
                data-testid="back-button"
                @click="goBack"
                icon="pi text-sm pi-chevron-left"
                class="mb-2"
                variant="outlined"
            />
            <Header hide-back>
                <template #title
                    ><span data-testid="page-title">{{
                        t('scheduled_jobs.title')
                    }}</span></template
                >
            </Header>
        </div>
             <Card class="mt-6">
            <template #content>
                <ScheduledJobTable />
            </template>
        </Card>
    </div>
</template>
