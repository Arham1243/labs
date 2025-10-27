import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { AnnouncementService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useAnnouncementStore = defineStore('AnnouncementStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await AnnouncementService.search(payload, params);
            return res.data;
        });
    };
    const getItem = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AnnouncementService.getItem(payload);
            return res.data;
        });
    };
    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AnnouncementService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('announcements.announcement')
                }),
                t('notifications.item_created_detail', {
                    item: t('announcements.announcement')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AnnouncementService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('announcements.announcement')
                }),
                t('notifications.item_updated_detail', {
                    item: t('announcements.announcement')
                })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AnnouncementService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('announcements.announcement')
                }),
                t('notifications.item_updated_detail', {
                    item: t('announcements.announcement')
                })
            );
            return res.data;
        });
    };
    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AnnouncementService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('announcements.announcement')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('announcements.announcement')
                })
            );
            return res.data;
        });
    };
    return {
        search,
        getItem,
        create,
        update,
        updateStatus,
        deleteItem
    };
});
