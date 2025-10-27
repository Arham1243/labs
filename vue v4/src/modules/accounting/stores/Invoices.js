import { ref, computed } from 'vue';
import { defineStore, storeToRefs } from 'pinia';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';

import * as InvoicesService from '../services/Invoice.service';

export const useInvoicesStore = defineStore('InvoicesStore', () => {
    const globalStore = useGlobalStore();
    const { t, locale } = useI18n();

    const getInvoices = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            try {
                const res = await InvoicesService.searchInvoices(
                    payload,
                    params
                );
                return res.data;
            } catch (e) {
                throw e;
            }
        });
    };

    const getInvoiceItems = (id, params) => {
        return globalStore.actionWrapper(async () => {
            try {
                const res = await InvoicesService.getInvoiceItems(id, params);
                return res.data;
            } catch (e) {
                throw e;
            }
        });
    };

    const getInvoiceDetails = (id) => {
        return globalStore.actionWrapper(async () => {
            try {
                const res = await InvoicesService.getInvoiceDetails(id);
                return res.data;
            } catch (e) {
                throw e;
            }
        });
    };

    const getInvoiceOverdueSummary = () => {
        return globalStore.actionWrapper(async () => {
            try {
                const res = await InvoicesService.getInvoiceOverdueSummary();
                return res.data;
            } catch (e) {
                throw e;
            }
        });
    };

    const getInvoiceStatusCounts = () => {
        return globalStore.actionWrapper(async () => {
            try {
                const res = await InvoicesService.getInvoiceStatusCounts();
                return res.data;
            } catch (e) {
                throw e;
            }
        });
    };

    const getAllClients = () => {
        return globalStore.actionWrapper(async () => {
            try {
                const res = await InvoicesService.getAllClients();
                return res.data;
            } catch (e) {
                throw e;
            }
        });
    };

    /**
     * voidInvoice
     * @payload { invoiceId, void_reason }
     * @returns invoice data
     */
    const voidInvoice = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await InvoicesService.voidInvoice(payload);
            if (res.status === 200) {
                globalStore.showSuccess(
                    t('invoice.notifications.void_title'),
                    t('invoice.notifications.void_message')
                );
            }
            return res.data;
        });
    };

    const recordPayment = (payload, invoiceId) => {
        return globalStore.actionWrapper(async () => {
            const res = await InvoicesService.recordPayment(payload, invoiceId);
            globalStore.showSuccess(
                t('invoice.notification.record_payment.title'),
                t('invoice.notification.record_payment.message')
            );
            return res.data;
        });
    };

    const getInvoiceTabFilterKey = (userId) => {
        return `invoice-tab-${userId}`;
    };

    const saveToLocal = (key, data) => {
        try {
            localStorage.setItem(key, data);
        } catch (error) {
            console.error('Failed to save locally', error);
        }
    };

    const getFromLocal = (key) => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to retrieve from local storage', error);
            return [];
        }
    };

    const exportInvoices = (payload) => {
        return globalStore.actionWrapper(async () => {
            try {
                const res = await InvoicesService.exportInvoices(payload);
                globalStore.showSuccess(
                    t('invoice.export.success'),
                    t('invoice.export.success_message')
                );
                return res.data;
            } catch (e) {
                throw e;
            }
        });
    };

    return {
        getInvoices,
        getInvoiceDetails,
        getInvoiceItems,
        getInvoiceStatusCounts,
        getInvoiceOverdueSummary,
        getAllClients,
        voidInvoice,
        recordPayment,
        getInvoiceTabFilterKey,
        saveToLocal,
        getFromLocal,
        exportInvoices
    };
});
