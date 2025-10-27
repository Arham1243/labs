import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { PreferredLanguageService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const usePreferredLanguageStore = defineStore(
    'PreferredLanguageStore',
    () => {
        const globalStore = useGlobalStore();
        const { t } = useI18n();

        const search = (payload, params) => {
            return globalStore.actionWrapper(async () => {
                const res = await PreferredLanguageService.search(
                    payload,
                    params
                );
                return res.data;
            });
        };

        const create = (payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await PreferredLanguageService.create(payload);
                globalStore.showSuccess(
                    t('notifications.item_created', {
                        item: t('common.language')
                    }),
                    t('notifications.item_created_detail', {
                        item: t('common.language')
                    })
                );
                return res.data;
            });
        };

        const update = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await PreferredLanguageService.update(id, payload);
                globalStore.showSuccess(
                    t('notifications.item_updated', {
                        item: t('common.language')
                    }),
                    t('notifications.item_updated_detail', {
                        item: t('common.language')
                    })
                );
                return res.data;
            });
        };

        const deleteItem = (id) => {
            return globalStore.actionWrapper(async () => {
                const res = await PreferredLanguageService.deleteItem(id);
                globalStore.showSuccess(
                    t('notifications.item_deleted', {
                        item: t('common.language')
                    }),
                    t('notifications.item_deleted_detail', {
                        item: t('common.language')
                    })
                );
                return res.data;
            });
        };

        const updateStatus = async (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await PreferredLanguageService.updateStatus(
                    id,
                    payload
                );
                globalStore.showSuccess(
                    t('notifications.item_updated', {
                        item: t('common.language')
                    }),
                    t('notifications.item_updated_detail', {
                        item: t('common.language')
                    })
                );
                return res.data;
            });
        };

        return {
            search,
            create,
            update,
            deleteItem,
            updateStatus
        };
    }
);
