import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { ability } from '@/plugins/ability';
import { useGlobalStore } from '@/stores';
import { ClientUserService } from '@/modules/clients/services';
import ValidationException from '@/composables/validation-exception';

export const useClientUserStore = defineStore('ClientUserStore', () => {
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
            const res = await ClientUserService.search(payload, params);
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            if (payload.scopes_toggle && payload.scopes.length < 1) {
                throw new ValidationException(
                    'scopes',
                    t('clients.business_unit_is_required')
                );
            }
            const res = await ClientUserService.create(payload);
            globalStore.showSuccess(
                t('notifications.client_user_created'),
                t('notifications.client_user_created_detail')
            );
            return res.data;
        });
    };

    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            if (payload.scopes_toggle && payload.scopes.length < 1) {
                if (payload.scopes_toggle && payload.scopes.length < 1) {
                    throw new ValidationException(
                        'scopes',
                        t('clients.business_unit_is_required')
                    );
                }
            }
            const res = await ClientUserService.update(id, payload);
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
            const res = await ClientUserService.updateStatus(id, payload);
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

    const cancelWorkflow = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientUserService.cancelWorkflow(id);
            return res.data;
        });
    };

    const resendActivation = async (email) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientUserService.resendActivation(email);
            globalStore.showSuccess(
                t('notifications.email_send'),
                t('notifications.email_send_detail')
            );
            return res.data;
        });
    };

    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientUserService.deleteItem(id);
            const key = ability.can('update client approvals')
                ? 'client_user_deleted'
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
                ? 'client_users_deleted'
                : 'client_user_deleted';
            globalStore.showSuccess(
                t(`notifications.${key}`),
                t(`notifications.${key}_detail`)
            );
            const res = await ClientUserService.deleteItems(payload);
            return res.data;
        });
    };

    const saveDecision = async (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientUserService.saveDecision(id, payload);
            const successMessages = {
                user_approved: {
                    title: t('notifications.user_approved'),
                    message: t('notifications.user_approved_detail', {
                        user: t('clients.client_user')
                            .toLowerCase()
                            .replace(/^./, (str) => str.toUpperCase())
                    })
                },
                user_declined: {
                    title: t('notifications.user_declined'),
                    message: t('notifications.user_declined_detail', {
                        user: t('clients.client_user')
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
        cancelWorkflow,
        resendActivation,
        deleteItem,
        deleteItems
    };
});
