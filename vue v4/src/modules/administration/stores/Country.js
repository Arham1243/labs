import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { CountryService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useCountryStore = defineStore('CountryStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const searchItems = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CountryService.searchItems(payload, params);
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CountryService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('common.country')
                }),
                t('notifications.item_created_detail', {
                    item: t('common.country')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CountryService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.country')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.country')
                })
            );
            return res.data;
        });
    };

    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CountryService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.country')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.country')
                })
            );
            return res.data;
        });
    };

    return {
        searchItems,
        updateStatus,
        create,
        update
    };
});
