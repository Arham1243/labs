import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { GenderService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useGenderStore = defineStore('GenderStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await GenderService.search(payload, params);
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await GenderService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('genders.gender')
                }),
                t('notifications.item_created_detail', {
                    item: t('genders.gender')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await GenderService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('genders.gender')
                }),
                t('notifications.item_updated_detail', {
                    item: t('genders.gender')
                })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await GenderService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('genders.gender')
                }),
                t('notifications.item_updated_detail', {
                    item: t('genders.gender')
                })
            );
            return res.data;
        });
    };

    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await GenderService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('genders.gender')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('genders.gender')
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
