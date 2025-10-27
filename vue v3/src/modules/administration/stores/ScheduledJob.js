import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useGlobalStore } from '@/stores';
import { ScheduledJobService } from '@/modules/administration/services';

export const useScheduledJobStore = defineStore('ScheduledJobStore', () => {
    const { t } = useI18n();
    const globalStore = useGlobalStore();

    const getJobs = () => {
        return globalStore.actionWrapper(async () => {
            const res = await ScheduledJobService.getJobs();
            return res.data;
        });
    };

    const getJobLogs = (jobName, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ScheduledJobService.getJobLogs(jobName, params);
            return res.data;
        });
    };

    const updateJobFrequency = (jobName, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ScheduledJobService.updateJobFrequency(
                jobName,
                payload
            );
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('scheduled_jobs.frequency')
                }),
                t('notifications.item_updated_detail', {
                    item: t('scheduled_jobs.frequency')
                })
            );
            return res.data;
        });
    };

    return {
        getJobs,
        getJobLogs,
        updateJobFrequency
    };
});
