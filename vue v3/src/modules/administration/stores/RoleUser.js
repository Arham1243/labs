import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { RoleUserService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useRoleUserStore = defineStore('RoleUserStore', () => {
    const globalStore = useGlobalStore();

    const { t } = useI18n();

    const searchUsers = (id, action, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await RoleUserService.searchUsers(
                id,
                action,
                payload,
                params
            );
            return res.data;
        });
    };

    const syncUsers = (id, action, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await RoleUserService.syncUsers(id, action, payload);
            const resultKey = action === 'attach' ? 'attached' : 'detached';
            const count = res?.data[resultKey]?.length || 0;

            const actionKey =
                action === 'attach' ? 'included_in_role' : 'excluded_from_role';
            const pluralPrefix = count > 1 ? 'users' : 'user';

            const titleKey = `notifications.${pluralPrefix}_${actionKey}`;
            const detailKey = `notifications.${pluralPrefix}_${actionKey}_detail`;

            globalStore.showSuccess(t(titleKey), t(detailKey));

            return res?.data;
        });
    };

    return {
        searchUsers,
        syncUsers
    };
});
