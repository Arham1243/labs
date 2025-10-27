import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { MenuService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useMenuStore = defineStore('MenuStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const getMenus = () => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.getMenus();
            return res.data;
        });
    };
    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.search(payload, params);
            return res.data;
        });
    };
    const getIcons = () => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.getIcons();
            return res;
        });
    };
    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.create(payload);
            const itemLabel = payload.parent_id
                ? t('menu.sub_menu_item_label')
                : t('menu.menu_item');

            globalStore.showSuccess(
                t('notifications.item_created', { item: itemLabel }),
                t('notifications.item_created_detail', { item: itemLabel })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.update(id, payload);
            const itemLabel = payload.parent_id
                ? t('menu.sub_menu_item_label')
                : t('menu.menu_item');

            globalStore.showSuccess(
                t('notifications.item_updated', { item: itemLabel }),
                t('notifications.item_updated_detail', { item: itemLabel })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.updateStatus(id, payload);
            const itemLabel = payload.parent_id
                ? t('menu.sub_menu_item_label')
                : t('menu.menu_item');
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: itemLabel
                }),
                t('notifications.item_updated_detail', {
                    item: itemLabel
                })
            );
            return res.data;
        });
    };
    const updateOrder = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.updateOrder(id, payload);
            globalStore.showSuccess(
                t('notifications.menu_order_updated'),
                t('notifications.menu_order_updated_detail')
            );
            return res.data;
        });
    };
    const deleteItem = async (id, isParent) => {
        return globalStore.actionWrapper(async () => {
            const res = await MenuService.deleteItem(id);
            const itemLabel = isParent
                ? t('menu.sub_menu_item_label')
                : t('menu.menu_item');
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: itemLabel
                }),
                t('notifications.item_deleted_detail', {
                    item: itemLabel
                })
            );
            return res.data;
        });
    };
    return {
        getIcons,
        getMenus,
        updateStatus,
        updateOrder,
        search,
        create,
        update,
        deleteItem
    };
});
