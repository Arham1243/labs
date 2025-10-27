import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import * as OrdersService from '../services/Orders.service';

export const useOrdersStore = defineStore('OrdersStore', () => {
    const globalStore = useGlobalStore();

    const searchOrders = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await OrdersService.searchOrders(payload, params);
            return res.data;
        });
    };

    const updateOrder = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await OrdersService.updateOrder(payload, params);
            return res.data;
        });
    };

    const getOverview = (clientId, orderId) => {
        return globalStore.actionWrapper(async () => {
            const res = await OrdersService.getOverview(clientId, orderId);
            return res.data;
        });
    };

    const searchEnrollments = (clientId, orderId, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await OrdersService.searchEnrollments(
                clientId,
                orderId,
                payload,
                params
            );
            return res.data;
        });
    };

    return {
        searchOrders,
        updateOrder,
        getOverview,
        searchEnrollments
    };
});
