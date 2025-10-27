import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { TeamRoleService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useTeamRoleStore = defineStore('TeamRoleStore', () => {
    const globalStore = useGlobalStore();

    const { t } = useI18n();

    const searchRoles = (id, action, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await TeamRoleService.searchRoles(
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
            const res = await TeamRoleService.syncRoles(id, action, payload);
            const resultKey = action === 'attach' ? 'attached' : 'detached';
            const count = res?.data[resultKey]?.length || 0;

            const actionKey =
                action === 'attach' ? 'included_in_team' : 'excluded_from_team';
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
