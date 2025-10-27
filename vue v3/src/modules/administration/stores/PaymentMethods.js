import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { PaymentMethodsService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const usePaymentMethodsStore = defineStore('PaymentMethodsStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PaymentMethodsService.search(payload, params);
            return res.data;
        });
    };

    const list = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await PaymentMethodsService.list(payload, params);
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PaymentMethodsService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('payment_methods.payment_method')
                }),
                t('notifications.item_created_detail', {
                    item: t('payment_methods.payment_method')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PaymentMethodsService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('payment_methods.payment_method')
                }),
                t('notifications.item_updated_detail', {
                    item: t('payment_methods.payment_method')
                })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await PaymentMethodsService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('payment_methods.payment_method')
                }),
                t('notifications.item_updated_detail', {
                    item: t('payment_methods.payment_method')
                })
            );
            return res.data;
        });
    };
    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await PaymentMethodsService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('payment_methods.payment_method')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('payment_methods.payment_method')
                })
            );
            return res.data;
        });
    };
    return {
        updateStatus,
        search,
        list,
        create,
        update,
        deleteItem
    };
});
