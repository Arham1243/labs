import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { VendorService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useVendorStore = defineStore('VendorStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await VendorService.search(payload, params);
            return res.data;
        });
    };
    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await VendorService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('common.vendor')
                }),
                t('notifications.item_created_detail', {
                    item: t('common.vendor')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await VendorService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.vendor')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.vendor')
                })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await VendorService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.vendor')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.vendor')
                })
            );
            return res.data;
        });
    };
    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await VendorService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('common.vendor')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('common.vendor')
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
