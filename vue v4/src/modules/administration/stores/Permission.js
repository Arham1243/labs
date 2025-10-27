import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { PermissionService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const usePermissionStore = defineStore('PermissionStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const getPermissions = async (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PermissionService.getPermissions(payload);
            return res.data;
        });
    };
    const getRolePermissions = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await PermissionService.getRolePermissions(id);
            return res.data;
        });
    };

    const savePermissions = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PermissionService.savePermissions(id, payload);
            globalStore.showSuccess(
                t('notifications.permissions_updated'),
                t('notifications.permissions_updated_detail')
            );
            return res.data;
        });
    };

    return {
        getPermissions,
        savePermissions,
        getRolePermissions
    };
});
