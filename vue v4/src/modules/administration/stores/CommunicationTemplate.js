import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { CommunicationTemplateService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useCommunicationTemplateStore = defineStore(
    'CommunicationTemplateStore',
    () => {
        const globalStore = useGlobalStore();
        const { t } = useI18n();

        const search = (payload, params) => {
            return globalStore.actionWrapper(async () => {
                const res = await CommunicationTemplateService.search(
                    payload,
                    params
                );
                return res.data;
            });
        };
        const getItem = (payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await CommunicationTemplateService.getItem(payload);
                return res.data;
            });
        };

        const getConfigs = (params) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await CommunicationTemplateService.getConfigs(params);
                return res.data;
            });
        };

        const create = (payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await CommunicationTemplateService.create(payload);
                globalStore.showSuccess(
                    t('notifications.item_created', {
                        item: t(
                            'communication_templates.communication_template'
                        )
                    }),
                    t('notifications.item_created_detail', {
                        item: t(
                            'communication_templates.communication_template'
                        )
                    })
                );
                return res.data;
            });
        };
        const update = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await CommunicationTemplateService.update(
                    id,
                    payload
                );
                globalStore.showSuccess(
                    t('notifications.item_updated', {
                        item: t(
                            'communication_templates.communication_template'
                        )
                    }),
                    t('notifications.item_updated_detail', {
                        item: t(
                            'communication_templates.communication_template'
                        )
                    })
                );
                return res.data;
            });
        };
        const updateStatus = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await CommunicationTemplateService.updateStatus(
                    id,
                    payload
                );

                const count = payload.resources?.length ?? 1;
                const keyPrefix =
                    count > 1 ? 'notifications.items_' : 'notifications.item_';

                globalStore.showSuccess(
                    t(`${keyPrefix}updated`, {
                        item: t(
                            'communication_templates.communication_template'
                        )
                    }),
                    t(`${keyPrefix}updated_detail`, {
                        item: t(
                            'communication_templates.communication_template'
                        )
                    })
                );
                return res.data;
            });
        };
        return {
            search,
            getItem,
            create,
            update,
            updateStatus,
            getConfigs
        };
    }
);
