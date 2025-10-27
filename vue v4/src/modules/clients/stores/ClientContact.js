import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useGlobalStore } from '@/stores';
import { ClientContactService } from '@/modules/clients/services';
import ValidationException from '@/composables/validation-exception';

export const useClientContactStore = defineStore('ClientContactStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientContactService.search(payload, params);
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
            const res = await ClientContactService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('contacts.contact')
                }),
                t('notifications.item_created_detail', {
                    item: t('contacts.contact')
                })
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
            const res = await ClientContactService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('contacts.contact')
                }),
                t('notifications.item_updated_detail', {
                    item: t('contacts.contact')
                })
            );
            return res.data;
        });
    };

    const deleteItems = async (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ClientContactService.deleteItems(payload);
            globalStore.showSuccess(
                t(
                    res.data.data.length > 1
                        ? 'notifications.items_deleted'
                        : 'notifications.item_deleted',
                    {
                        item: t(
                            res.data.data.length > 1
                                ? 'contacts.contacts'
                                : 'contacts.contact'
                        )
                    }
                ),
                t(
                    res.data.data.length > 1
                        ? 'notifications.items_deleted_detail'
                        : 'notifications.item_deleted_detail',
                    {
                        item: t(
                            res.data.data.length > 1
                                ? 'contacts.contacts'
                                : 'contacts.contact'
                        )
                    }
                )
            );
        });
    };

    return {
        search,
        create,
        update,
        deleteItems
    };
});
