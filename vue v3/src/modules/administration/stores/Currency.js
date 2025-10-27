import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { CurrencyService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useCurrencyStore = defineStore('CurrencyStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CurrencyService.search(payload, params);
            return res.data;
        });
    };
    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CurrencyService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('common.currency')
                }),
                t('notifications.item_created_detail', {
                    item: t('common.currency')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CurrencyService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.currency')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.currency')
                })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CurrencyService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.currency')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.currency')
                })
            );
            return res.data;
        });
    };
    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await CurrencyService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('common.currency')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('common.currency')
                })
            );
            return res.data;
        });
    };
    return {
        updateStatus,
        search,
        create,
        update,
        deleteItem
    };
});
