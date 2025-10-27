import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { ContactTypeService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useContactTypeStore = defineStore('ContactTypeStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ContactTypeService.search(payload, params);
            return res.data;
        });
    };
    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ContactTypeService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('contact_type.contact_type')
                }),
                t('notifications.item_created_detail', {
                    item: t('contact_type.contact_type')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ContactTypeService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('contact_type.contact_type')
                }),
                t('notifications.item_updated_detail', {
                    item: t('contact_type.contact_type')
                })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ContactTypeService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('contact_type.contact_type')
                }),
                t('notifications.item_updated_detail', {
                    item: t('contact_type.contact_type')
                })
            );
            return res.data;
        });
    };
    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ContactTypeService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('contact_type.contact_type')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('contact_type.contact_type')
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
