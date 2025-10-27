import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { UnderwriterService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useUnderwriterStore = defineStore('UnderwriterStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const searchUnderwriters = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await UnderwriterService.searchUnderwriters(
                payload,
                params
            );
            return res.data;
        });
    };
    const createUnderwriter = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await UnderwriterService.createUnderwriter(payload);
            globalStore.showSuccess(
                t('notifications.underwriter_created'),
                t('notifications.underwriter_created_detail')
            );
            return res.data;
        });
    };
    const updateUnderwriter = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await UnderwriterService.updateUnderwriter(id, payload);
            globalStore.showSuccess(
                t('notifications.underwriter_updated'),
                t('notifications.underwriter_updated_detail')
            );
            return res.data;
        });
    };
    const updateUnderwriterStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await UnderwriterService.updateUnderwriterStatus(
                id,
                payload
            );
            globalStore.showSuccess(
                t('notifications.underwriter_updated'),
                t('notifications.underwriter_updated_detail')
            );
            return res.data;
        });
    };
    return {
        updateUnderwriterStatus,
        searchUnderwriters,
        createUnderwriter,
        updateUnderwriter
    };
});
