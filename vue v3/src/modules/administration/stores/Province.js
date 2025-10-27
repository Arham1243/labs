import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { ProvinceService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useProvinceStore = defineStore('ProvinceStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const searchItems = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ProvinceService.searchItems(payload, params);
            return res.data;
        });
    };
    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ProvinceService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('common.province')
                }),
                t('notifications.item_created_detail', {
                    item: t('common.province')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ProvinceService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.province')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.province')
                })
            );
            return res.data;
        });
    };
    const updateStatus = async (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ProvinceService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.province')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.province')
                })
            );
            return res.data;
        });
    };
    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ProvinceService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('common.province')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('common.province')
                })
            );
            return res.data;
        });
    };

    const processProvincesForDropDown = (provinces) => {
        return provinces?.map((provinces) => ({
            id: provinces.id,
            name: provinces.name
        }));
    };

    return {
        updateStatus,
        searchItems,
        create,
        update,
        deleteItem,
        processProvincesForDropDown
    };
});
