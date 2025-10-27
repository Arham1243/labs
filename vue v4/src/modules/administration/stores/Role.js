import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { RoleService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useRoleStore = defineStore('RoleStore', () => {
    const globalStore = useGlobalStore();
    const currentRole = ref(null);
    const { t } = useI18n();

    const setCurrentRole = (role) => {
        currentRole.value = role;
    };

    const getRole = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await RoleService.getRole(id);
            return res.data;
        });
    };
    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await RoleService.search(payload, params);
            return res.data;
        });
    };

    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await RoleService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.role_deleted'),
                t('notifications.role_deleted_detail')
            );
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await RoleService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('common.role')
                }),
                t('notifications.item_created_detail', {
                    item: t('common.role')
                })
            );
            return res.data;
        });
    };

    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await RoleService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.role')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.role')
                })
            );
            return res.data;
        });
    };

    return {
        update,
        deleteItem,
        create,
        search,
        currentRole,
        setCurrentRole,
        getRole
    };
});
