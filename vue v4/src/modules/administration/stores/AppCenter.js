import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { AppCenterService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useAppCenterStore = defineStore('AppCenterStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const getApps = () => {
        return globalStore.actionWrapper(async () => {
            const res = await AppCenterService.getApps();
            return res.data;
        });
    };

    const activateApp = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AppCenterService.activateApp(id, payload);
            globalStore.showSuccess(
                t('notifications.item_activated', {
                    item: t('app_center.payment_provider')
                }),
                t('notifications.item_activated_detail', {
                    item: t('app_center.payment_provider')
                })
            );
            return res.data;
        });
    };

    const configureApp = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await AppCenterService.configureApp(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('app_center.payment_provider')
                }),
                t('notifications.item_updated_detail', {
                    item: t('app_center.payment_provider')
                })
            );
            return res.data;
        });
    };

    const deactivateApp = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await AppCenterService.deactivateApp(id);
            globalStore.showSuccess(
                t('notifications.item_deactivated', {
                    item: t('app_center.payment_provider')
                }),
                t('notifications.item_deactivated_detail', {
                    item: t('app_center.payment_provider')
                })
            );
            return res.data;
        });
    };

    return {
        getApps,
        activateApp,
        deactivateApp,
        configureApp
    };
});
