import { ref } from 'vue';
import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { TeamService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useTeamStore = defineStore('TeamStore', () => {
    const globalStore = useGlobalStore();
    const currentTeam = ref(null);
    const { t } = useI18n();

    const getTeam = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await TeamService.getTeam(id);
            return res.data;
        });
    };

    const setCurrentTeam = (team) => {
        currentTeam.value = team;
    };

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await TeamService.search(payload, params);
            return res.data;
        });
    };

    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await TeamService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.team_deleted'),
                t('notifications.team_deleted_detail', {
                    name: res.data.data.name
                })
            );
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await TeamService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('common.team')
                }),
                t('notifications.item_created_detail', {
                    item: t('common.team')
                })
            );
            return res.data;
        });
    };

    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await TeamService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.team')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.team')
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
        currentTeam,
        setCurrentTeam,
        getTeam
    };
});
