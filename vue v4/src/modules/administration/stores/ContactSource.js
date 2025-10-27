import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { ContactSourceService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useContactSourceStore = defineStore('ContactSourceStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ContactSourceService.search(payload, params);
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ContactSourceService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('contact_sources.contact_source')
                }),
                t('notifications.item_created_detail', {
                    item: t('contact_sources.contact_source')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ContactSourceService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('contact_sources.contact_source')
                }),
                t('notifications.item_updated_detail', {
                    item: t('contact_sources.contact_source')
                })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ContactSourceService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('contact_sources.contact_source')
                }),
                t('notifications.item_updated_detail', {
                    item: t('contact_sources.contact_source')
                })
            );
            return res.data;
        });
    };

    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ContactSourceService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('contact_sources.contact_source')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('contact_sources.contact_source')
                })
            );
            return res.data;
        });
    };

    return {
        search,
        create,
        update,
        updateStatus,
        deleteItem
    };
});
