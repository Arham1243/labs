import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { UserRoleService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useUserRoleStore = defineStore('UserRoleStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const searchRoles = (id, action, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await UserRoleService.searchRoles(
                id,
                action,
                payload,
                params
            );
            return res.data;
        });
    };

    const syncRoles = (id, action, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await UserRoleService.syncRoles(id, action, payload);
            const resultKey = action === 'attach' ? 'attached' : 'detached';
            const count = res?.data[resultKey]?.length || 0;

            const actionKey =
                action === 'attach' ? 'included_in_user' : 'excluded_from_user';
            const pluralPrefix = count > 1 ? 'roles' : 'role';

            const titleKey = `notifications.${pluralPrefix}_${actionKey}`;
            const detailKey = `notifications.${pluralPrefix}_${actionKey}_detail`;

            globalStore.showSuccess(t(titleKey), t(detailKey));

            return res?.data;
        });
    };

    return {
        searchRoles,
        syncRoles
    };
});
