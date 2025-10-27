import { defineStore } from 'pinia';

import { useGlobalStore } from '@/stores';
import * as NonInsuranceProductService from '../services/NonInsuranceProduct.service';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';

export const useNonInsuranceProductStore = defineStore(
    'NonInsuranceProductStore',
    () => {
        const globalStore = useGlobalStore();
        const { t, locale } = useI18n();

        const currentNonInsuranceProduct = ref();
        const currentNonInsuranceProductable = ref();

        const setCurrentNonInsuranceProduct = (value) => {
            currentNonInsuranceProduct.value = value;
        };

        const clearCurrentNonInsuranceProduct = () => {
            currentNonInsuranceProduct.value = null;
        };

        const searchNonInsuranceProduct = (payload, params) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.searchNonInsuranceProduct(
                        payload,
                        params
                    );
                return res.data;
            });
        };

        const getNonInsuranceProduct = (id, params) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.getNonInsuranceProduct(
                        id,
                        {
                            ...params,
                            include: 'authorized'
                        }
                    );
                return res.data;
            });
        };

        const createNonInsuranceProduct = (payload) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.createNonInsuranceProduct(
                        payload
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_created'),
                    t('notifications.non_insurance_product_created_detail')
                );
                return res.data;
            });
        };

        const updateNonInsuranceProduct = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.updateNonInsuranceProduct(
                        id,
                        payload
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_updated'),
                    t('notifications.non_insurance_product_updated_detail')
                );
                return res.data;
            });
        };

        const updateNonInsuranceProductStatus = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.updateNonInsuranceProductStatus(
                        id,
                        payload
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_updated'),
                    t('notifications.non_insurance_product_updated_detail')
                );
                return res.data;
            });
        };

        const deleteNonInsuranceProduct = (id) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.deleteNonInsuranceProduct(
                        id
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_deleted'),
                    t('notifications.non_insurance_product_deleted_details')
                );
                return res.data;
            });
        };

        const publishNonInsuranceProduct = (id) => {
            const data = { status: 'active' };
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.changeNonInsuranceProductStatus(
                        id,
                        data
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_published'),
                    t('notifications.non_insurance_product_published_detail')
                );
                return res.data;
            });
        };

        const detachNonInsuranceProductWithPrices = (id, resources) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.detachNonInsuranceProductWithPrices(
                        id,
                        resources
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_price_deleted'),
                    t(
                        'notifications.non_insurance_product_price_deleted_detail'
                    )
                );
                return res.data;
            });
        };

        const nonInsuranceProductPricesDelete = (id, priceId) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.nonInsuranceProductPricesDelete(
                        id,
                        priceId
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_price_deleted'),
                    t(
                        'notifications.non_insurance_product_price_deleted_detail'
                    )
                );
                return res.data;
            });
        };

        const nonInsuranceProductPricesUpdate = (id, priceId, payload) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.nonInsuranceProductPricesUpdate(
                        id,
                        priceId,
                        payload
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_price_updated'),
                    t(
                        'notifications.non_insurance_product_price_updated_detail'
                    )
                );
                return res.data;
            });
        };

        const nonInsuranceProductPricesStore = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.nonInsuranceProductPricesStore(
                        id,
                        payload
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_price_created'),
                    t(
                        'notifications.non_insurance_product_price_created_detail'
                    )
                );
                return res.data;
            });
        };

        const searchNonInsuranceProductPrices = (id, payload, params) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.searchNonInsuranceProductPrices(
                        id,
                        payload,
                        params
                    );
                return res.data;
            });
        };

        /*NON INSURANCE PRODUCT TABLE - UPDATE ADD AND RESET PRICES FROM BUSINESS UNIT NON INSURANCE PRODUCTS*/

        const setCurrentNonInsuranceProductable = (value) => {
            currentNonInsuranceProductable.value = value;
        };

        const clearCurrentNonInsuranceProductable = () => {
            currentNonInsuranceProductable.value = null;
        };

        const detachNonInsuranceProductableWithPrices = (id, resources) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.detachNonInsuranceProductableWithPrices(
                        id,
                        resources
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_price_deleted'),
                    t(
                        'notifications.non_insurance_product_price_deleted_detail'
                    )
                );
                return res.data;
            });
        };

        const nonInsuranceProductablePricesDelete = (id, priceId) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.nonInsuranceProductablePricesDelete(
                        id,
                        priceId
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_price_deleted'),
                    t(
                        'notifications.non_insurance_product_price_deleted_detail'
                    )
                );
                return res.data;
            });
        };

        const nonInsuranceProductablePricesUpdate = (id, priceId, payload) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.nonInsuranceProductablePricesUpdate(
                        id,
                        priceId,
                        payload
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_price_updated'),
                    t(
                        'notifications.non_insurance_product_price_updated_detail'
                    )
                );
                return res.data;
            });
        };

        const nonInsuranceProductablePricesStore = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.nonInsuranceProductablePricesStore(
                        id,
                        payload
                    );
                globalStore.showSuccess(
                    t('notifications.non_insurance_product_price_created'),
                    t(
                        'notifications.non_insurance_product_price_created_detail'
                    )
                );
                return res.data;
            });
        };

        const revertToDefaultNonInsuranceProductablePrices = (id, payload) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.revertToDefaultNonInsuranceProductablePrices(
                        id,
                        payload
                    );
                return res.data;
            });
        };

        const searchNonInsuranceProductablePrices = (id, payload, params) => {
            return globalStore.actionWrapper(async () => {
                const res =
                    await NonInsuranceProductService.searchNonInsuranceProductablePrices(
                        id,
                        payload,
                        params
                    );
                return res.data;
            });
        };

        return {
            currentNonInsuranceProduct,
            searchNonInsuranceProduct,
            getNonInsuranceProduct,
            setCurrentNonInsuranceProduct,
            createNonInsuranceProduct,
            updateNonInsuranceProduct,
            updateNonInsuranceProductStatus,
            deleteNonInsuranceProduct,
            detachNonInsuranceProductWithPrices,
            nonInsuranceProductPricesDelete,
            nonInsuranceProductPricesUpdate,
            nonInsuranceProductPricesStore,
            searchNonInsuranceProductPrices,
            publishNonInsuranceProduct,
            clearCurrentNonInsuranceProduct,
            currentNonInsuranceProductable,
            setCurrentNonInsuranceProductable,
            clearCurrentNonInsuranceProductable,
            detachNonInsuranceProductableWithPrices,
            nonInsuranceProductablePricesDelete,
            nonInsuranceProductablePricesUpdate,
            nonInsuranceProductablePricesStore,
            searchNonInsuranceProductablePrices,
            revertToDefaultNonInsuranceProductablePrices
        };
    }
);
