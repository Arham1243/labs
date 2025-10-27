import { defineStore } from 'pinia';
import { DocumentService } from '@/services';
import { useI18n } from 'vue-i18n';
import { useGlobalStore } from '@/stores';
import { moveBulkDocument } from '@/services/Document.service.js';

export const useDocumentStore = defineStore('DocumentStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const listDocuments = (type, id, locale = 'en') => {
        return globalStore.actionWrapper(async () => {
            return (await DocumentService.listDocuments(type, id, locale)).data;
        });
    };

    const storeDocument = (type, id, data) => {
        return globalStore.actionWrapper(async () => {
            const res = await DocumentService.storeDocument(type, id, data);
            globalStore.showSuccess(
                t('notifications.document_created'),
                t('notifications.document_created_detail')
            );

            return res.data;
        });
    };

    const renameDocument = (type, id, data) => {
        return globalStore.actionWrapper(async () => {
            const res = await DocumentService.renameDocument(type, id, data);
            globalStore.showSuccess(
                t('notifications.document_renamed'),
                t('notifications.document_renamed_detail')
            );

            return res.data;
        });
    };

    const moveDocument = (type, id, data) => {
        return globalStore.actionWrapper(async () => {
            const res = await DocumentService.moveDocument(type, id, data);
            globalStore.showSuccess(
                t('notifications.document_moved'),
                t('notifications.document_moved_detail')
            );

            return res.data;
        });
    };

    const moveBulk = (type, id, data) => {
        return globalStore.actionWrapper(async () => {
            const res = await DocumentService.moveBulkDocument(type, id, data);
            globalStore.showSuccess(
                t('notifications.document_moved'),
                t('notifications.document_moved_detail')
            );

            return res.data;
        });
    };

    const deleteDocument = async (type, id, data) => {
        return globalStore.actionWrapper(async () => {
            const res = await DocumentService.deleteDocument(type, id, data);
            globalStore.showSuccess(
                t('notifications.document_deleted'),
                t('notifications.document_deleted_details')
            );

            return res.data;
        });
    };

    const deleteMultiple = async (type, id, data) => {
        return globalStore.actionWrapper(async () => {
            const res = await DocumentService.deleteMultiple(type, id, data);
            globalStore.showSuccess(
                t('notifications.document_deleted'),
                t('notifications.document_deleted_details')
            );

            return res.data;
        });
    };

    const duplicateDocument = async (type, id, data) => {
        return globalStore.actionWrapper(async () => {
            const res = await DocumentService.duplicateDocument(type, id, data);
            globalStore.showSuccess(
                t('notifications.document_duplicated'),
                t('notifications.document_duplicated_details')
            );

            return res.data;
        });
    };

    return {
        listDocuments,
        storeDocument,
        renameDocument,
        moveDocument,
        moveBulk,
        deleteDocument,
        deleteMultiple,
        duplicateDocument
    };
});
