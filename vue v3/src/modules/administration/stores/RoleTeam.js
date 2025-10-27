import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { RoleTeamService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useRoleTeamStore = defineStore('RoleTeamStore', () => {
    const globalStore = useGlobalStore();

    const { t } = useI18n();

    const searchTeams = (id, action, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await RoleTeamService.searchTeams(
                id,
                action,
                payload,
                params
            );
            return res.data;
        });
    };

    const syncTeams = (id, action, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await RoleTeamService.syncTeams(id, action, payload);
            const resultKey = action === 'attach' ? 'attached' : 'detached';
            const count = res?.data[resultKey]?.length || 0;

            const actionKey =
                action === 'attach' ? 'included_in_role' : 'excluded_from_role';
            const pluralPrefix = count > 1 ? 'teams' : 'team';

            const titleKey = `notifications.${pluralPrefix}_${actionKey}`;
            const detailKey = `notifications.${pluralPrefix}_${actionKey}_detail`;

            globalStore.showSuccess(t(titleKey), t(detailKey));

            return res?.data;
        });
    };

    return {
        searchTeams,
        syncTeams
    };
});
