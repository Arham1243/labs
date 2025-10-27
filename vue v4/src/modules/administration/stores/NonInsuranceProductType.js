import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { NonInsuranceProductTypeService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useNonInsuranceProductTypeStore = defineStore(
    'NonInsuranceProductTypeStore',
    () => {
        const globalStore = useGlobalStore();
        const { t } = useI18n();

        const search = (payload, params) => {
            return globalStore.actionWrapper(async () => {
                const res = await NonInsuranceProductTypeService.search(
                    payload,
                    params
                );
                return res.data;
            });
        };
        const create = (payload) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductTypeService.create(payload);
                globalStore.showSuccess(
                    t('notifications.item_created', {
                        item: t(
                            'non_insurance_product_type.non_insurance_product_type'
                        )
                    }),
                    t('notifications.item_created_detail', {
                        item: t(
                            'non_insurance_product_type.non_insurance_product_type'
                        )
                    })
                );
                return res.data;
            });
        };
        const update = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await NonInsuranceProductTypeService.update(
                    id,
                    payload
                );
                globalStore.showSuccess(
                    t('notifications.item_updated', {
                        item: t(
                            'non_insurance_product_type.non_insurance_product_type'
                        )
                    }),
                    t('notifications.item_updated_detail', {
                        item: t(
                            'non_insurance_product_type.non_insurance_product_type'
                        )
                    })
                );
                return res.data;
            });
        };
        const updateStatus = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await NonInsuranceProductTypeService.updateStatus(
                    id,
                    payload
                );
                globalStore.showSuccess(
                    t('notifications.item_updated', {
                        item: t(
                            'non_insurance_product_type.non_insurance_product_type'
                        )
                    }),
                    t('notifications.item_updated_detail', {
                        item: t(
                            'non_insurance_product_type.non_insurance_product_type'
                        )
                    })
                );
                return res.data;
            });
        };
        return {
            search,
            create,
            updateStatus,
            update
        };
    }
);
