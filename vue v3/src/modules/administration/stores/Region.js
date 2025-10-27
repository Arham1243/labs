import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { RegionService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useRegionStore = defineStore('RegionStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const searchItems = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await RegionService.searchItems(payload, params);
            return res.data;
        });
    };
    const updateStatus = async (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await RegionService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.region')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.region')
                })
            );
            return res.data;
        });
    };
    return {
        updateStatus,
        searchItems
    };
});
