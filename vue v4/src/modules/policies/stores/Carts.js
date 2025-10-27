import { defineStore } from 'pinia';

import { useGlobalStore } from '@/stores';
import * as CartsService from '@/modules/policies/services/Carts.service';
import { usePoliciesStore } from '@/modules/policies/stores/Policies.js';

export const useCartsStore = defineStore('CartsStore', () => {
    const globalStore = useGlobalStore();
    const policyStore = usePoliciesStore();

    const getCarts = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CartsService.getCarts(params);
            return res.data;
        });
    };

    const searchCarts = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CartsService.searchCarts(payload, params);
            return res.data;
        });
    };

    const getCheckout = (cartId) => {
        const _cartId = cartId || policyStore.cart?.id;
        if (!_cartId) return;

        return globalStore.actionWrapper(async () => {
            const res = await CartsService.getCheckout(_cartId);
            return res.data;
        });
    };

    const processCheckout = (payload, cartId) => {
        const _cartId = cartId || policyStore.cart?.id;

        if (!_cartId) return;

        return globalStore.actionWrapper(async () => {
            const res = await CartsService.processCheckout(_cartId, payload);
            return res.data;
        });
    };

    return {
        searchCarts,
        getCarts,
        getCheckout,
        processCheckout
    };
});
