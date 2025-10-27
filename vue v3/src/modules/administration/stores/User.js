import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { UserService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

export const useUserStore = defineStore('UserStore', () => {
    const globalStore = useGlobalStore();
    const currentUser = ref(null);
    const { t } = useI18n();

    const setCurrentUser = (user) => {
        currentUser.value = user;
    };

    const getUser = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await UserService.getUser(id);
            return res.data;
        });
    };

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await UserService.search(payload, params);
            return res.data;
        });
    };

    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await UserService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('common.user')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('common.user')
                })
            );
            return res.data;
        });
    };

    const resendActivation = async (email) => {
        return globalStore.actionWrapper(async () => {
            const res = await UserService.resendActivation(email);
            globalStore.showSuccess(
                t('notifications.email_send'),
                t('notifications.email_send_detail')
            );
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await UserService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('common.user')
                }),
                t('notifications.item_created_detail', {
                    item: t('common.user')
                })
            );
            return res.data;
        });
    };

    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await UserService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.user')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.user')
                })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await UserService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('common.user')
                }),
                t('notifications.item_updated_detail', {
                    item: t('common.user')
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
        updateStatus,
        resendActivation,
        currentUser,
        setCurrentUser,
        getUser
    };
});
