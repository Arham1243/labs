import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { ClientSectorService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useClientSectorStore = defineStore('ClientSectorStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientSectorService.search(payload, params);
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientSectorService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('client_sector.title')
                }),
                t('notifications.item_created_detail', {
                    item: t('client_sector.title')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientSectorService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('client_sector.title')
                }),
                t('notifications.item_updated_detail', {
                    item: t('client_sector.title')
                })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientSectorService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('client_sector.title')
                }),
                t('notifications.item_updated_detail', {
                    item: t('client_sector.title')
                })
            );
            return res.data;
        });
    };

    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientSectorService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('client_sector.title')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('client_sector.title')
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
