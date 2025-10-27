import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { SettingService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useSettingStore = defineStore('SettingStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const getSettings = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await SettingService.getSettings(payload, params);
            return res.data;
        });
    };

    const updateSettings = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await SettingService.updateSettings(payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('settings.title')
                }),
                t('notifications.item_updated_detail', {
                    item: t('settings.title')
                })
            );
            return res.data;
        });
    };

    return {
        getSettings,
        updateSettings
    };
});
