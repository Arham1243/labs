import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { ability } from '@/plugins/ability';
import { useGlobalStore } from '@/stores';
import { BusinessUnitUserService } from '@/modules/clients/services';

export const useBusinessUnitUserStore = defineStore(
    'BusinessUnitUserStore',
    () => {
        const globalStore = useGlobalStore();
        const { t } = useI18n();

        const getUser = (id, params) => {
            return globalStore.actionWrapper(async () => {
                const res = await ClientUserService.getUser(id, params);
                return res.data;
            });
        };

        const search = (payload, params) => {
            return globalStore.actionWrapper(async () => {
                const res = await BusinessUnitUserService.search(
                    payload,
                    params
                );
                return res.data;
            });
        };

        const create = (payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await BusinessUnitUserService.create(payload);
                globalStore.showSuccess(
                    t('notifications.business_unit_user_created'),
                    t('notifications.business_unit_user_created_detail')
                );
                return res.data;
            });
        };

        const update = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await BusinessUnitUserService.update(id, payload);
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
                const res = await BusinessUnitUserService.updateStatus(
                    id,
                    payload
                );
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

        const deleteItem = async (id) => {
            return globalStore.actionWrapper(async () => {
                const res = await BusinessUnitUserService.deleteItem(id);
                const key = ability.can('update client approvals')
                    ? 'business_unit_user_deleted'
                    : 'request_sent';
                globalStore.showSuccess(
                    t(`notifications.${key}`),
                    t(`notifications.${key}_detail`)
                );
                return res.data;
            });
        };

        const deleteItems = async (payload) => {
            return globalStore.actionWrapper(async () => {
                const multiple = payload.resources.length > 1;
                const key = multiple
                    ? 'business_unit_users_deleted'
                    : 'business_unit_user_deleted';
                globalStore.showSuccess(
                    t(`notifications.${key}`),
                    t(`notifications.${key}_detail`)
                );
                const res = await BusinessUnitUserService.deleteItems(payload);
                return res.data;
            });
        };

        const saveDecision = async (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await BusinessUnitUserService.saveDecision(
                    id,
                    payload
                );
                const successMessages = {
                    user_approved: {
                        title: t('notifications.user_approved'),
                        message: t('notifications.user_approved_detail', {
                            user: t('clients.business_unit_user')
                                .toLowerCase()
                                .replace(/^./, (str) => str.toUpperCase())
                        })
                    },
                    user_declined: {
                        title: t('notifications.user_declined'),
                        message: t('notifications.user_declined_detail', {
                            user: t('clients.business_unit_user')
                                .toLowerCase()
                                .replace(/^./, (str) => str.toUpperCase())
                        })
                    }
                };
                if (
                    payload.action === 'approve-creation' &&
                    res.data?.status === 'unconfirmed'
                ) {
                    globalStore.showSuccess(
                        successMessages.user_approved.title,
                        successMessages.user_approved.message
                    );
                } else if (
                    payload.action === 'decline-creation' &&
                    res.data?.status === 'declined'
                ) {
                    globalStore.showSuccess(
                        successMessages.user_declined.title,
                        successMessages.user_declined.message
                    );
                } else if (
                    payload.action === 'approve-deletion' &&
                    res.data?.status === 'pending deletion'
                ) {
                    globalStore.showSuccess(
                        successMessages.user_approved.title,
                        successMessages.user_approved.message
                    );
                } else if (
                    payload.action === 'decline-deletion' &&
                    res.data?.status === 'declined'
                ) {
                    globalStore.showSuccess(
                        successMessages.user_declined.title,
                        successMessages.user_declined.message
                    );
                }
                return res.data;
            });
        };

        return {
            search,
            create,
            update,
            getUser,
            saveDecision,
            updateStatus,
            deleteItem,
            deleteItems
        };
    }
);
