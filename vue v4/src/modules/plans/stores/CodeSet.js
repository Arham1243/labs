import { defineStore } from 'pinia';
import { ref } from 'vue';
import { useGlobalStore } from '@/stores';
import { useI18n } from 'vue-i18n';
import * as CodeSetService from '../services/CodeSet.service';

export const useCodeSetStore = defineStore('CodeSetStore', () => {
    const globalStore = useGlobalStore();
    const { t, locale } = useI18n();

    const currentCodeSet = ref();
    const currentCodeGroup = ref();

    const setCurrentCodeSet = (value) => {
        currentCodeSet.value = value;
    };

    const setCurrentCodeGroup = (value) => {
        currentCodeGroup.value = value;
    };

    // Code Sets

    const searchCodeSets = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.searchCodeSets(payload, params);
            return res.data;
        });
    };

    const getCodeSets = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.getCodeSets(params);
            return res.data;
        });
    };

    const getCodeSet = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.getCodeSet(id);
            return res.data;
        });
    };

    const createCodeSet = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.createCodeSet(payload);
            globalStore.showSuccess(
                t('notifications.code_set_created'),
                t('notifications.code_set_created_detail')
            );
            return res.data;
        });
    };

    const updateCodeSet = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.updateCodeSet(id, payload);
            globalStore.showSuccess(
                t('notifications.code_set_updated'),
                t('notifications.code_set_updated_detail')
            );
            setCurrentCodeSet(res.data?.data);
            return res.data;
        });
    };

    const publishCodeSet = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const data = { ...currentCodeSet.value, status: 'active' };
            const res = await CodeSetService.updateCodeSet(id, data);
            globalStore.showSuccess(
                t('notifications.code_set_published'),
                t('notifications.code_set_published_detail', {
                    item: payload.name[locale.value]
                })
            );
            return res.data;
        });
    };

    const checkImportLogStatus = (import_log_id) => {
        return globalStore.actionWrapper(async () => {
            const importLog = (
                await CodeSetService.checkImportLogStatus(import_log_id)
            ).data.data;

            if (importLog.imported_at != null) {
                globalStore.showSuccess(
                    t('notifications.file_imported'),
                    t('notifications.count_codes_imported', {
                        count: importLog.payload.count
                    })
                );
            }

            return importLog;
        });
    };

    const deleteCodeSet = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.deleteCodeSet(id);
            globalStore.showSuccess(
                t('notifications.code_set_deleted'),
                t('notifications.code_set_deleted_detail')
            );
            return res.data;
        });
    };

    const getCodeSetTags = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.getCodeSetTags(id);
            return res.data;
        });
    };

    // Code Groups

    const searchCodeGroups = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.searchCodeGroups(payload, params);
            return res.data;
        });
    };

    const searchCodeGroupsExclude = (id, serviceCodeId, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.searchCodeGroupsExclude(
                id,
                serviceCodeId,
                payload,
                params
            );
            return res.data;
        });
    };

    const getCodeGroups = (params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.getCodeGroups(params);
            return res.data;
        });
    };

    const getCodeGroup = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.getCodeGroup(id);
            return res.data;
        });
    };

    const createCodeGroup = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.createCodeGroup(payload);
            globalStore.showSuccess(
                t('notifications.code_group_created'),
                t('notifications.code_group_created_detail')
            );
            return res.data;
        });
    };

    const updateCodeGroup = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.updateCodeGroup(id, payload);
            globalStore.showSuccess(
                t('notifications.code_group_updated'),
                t('notifications.code_group_updated_detail')
            );
            setCurrentCodeGroup(res.data?.data);
            return res.data;
        });
    };

    const publishCodeGroup = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const data = { ...currentCodeGroup.value, status: 'active' };
            const res = await CodeSetService.updateCodeGroup(id, data);
            globalStore.showSuccess(
                t('notifications.code_group_published'),
                t('notifications.code_group_published_detail', {
                    item: payload.name[locale.value]
                })
            );
            return res.data;
        });
    };

    const deleteCodeGroup = (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.deleteCodeGroup(id);
            globalStore.showSuccess(
                t('notifications.code_group_deleted'),
                t('notifications.code_group_deleted_detail')
            );
            return res.data;
        });
    };

    const syncCodeGroupByTags = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.syncCodeGroupByTags(id, payload);
            globalStore.showSuccess(
                t('notifications.code_group_updated'),
                t('notifications.code_group_updated_detail')
            );
            return res.data;
        });
    };

    // Service Codes

    const getEntityServiceCodes = (entity, id, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.getEntityServiceCodes(
                entity,
                id,
                params
            );
            return res.data;
        });
    };

    const getExcludedServiceCodes = (entity, id, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.getExcludedServiceCodes(
                entity,
                id,
                params
            );
            return res.data;
        });
    };

    const searchEntityServiceCodes = (entity, id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.searchEntityServiceCodes(
                entity,
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const searchExcludedServicesCodes = (entity, id, payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.searchExcludedServicesCodes(
                entity,
                id,
                payload,
                params
            );
            return res.data;
        });
    };

    const getExcludedServicesCodesForBenefit = (
        id,
        service_code_set,
        payload,
        params
    ) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.getExcludedServicesCodesForBenefit(
                id,
                service_code_set,
                payload,
                params
            );
            return res.data;
        });
    };

    const searchServiceCodes = (value) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.searchServiceCodes(value);
            return res.data;
        });
    };

    const createServiceCode = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.createServiceCode(payload);
            return res.data;
        });
    };

    const updateServiceCode = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.updateServiceCode(id, payload);
            globalStore.showSuccess(
                t('notifications.service_code_updated'),
                t('notifications.service_code_updated_detail')
            );
            return res.data;
        });
    };

    const syncServiceCodes = (entity, id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.syncServiceCodes(
                entity,
                id,
                payload
            );
            return res.data;
        });
    };

    const attachServiceCodes = (entity, id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.attachServiceCodes(
                entity,
                id,
                payload
            );
            globalStore.showSuccess(
                t('notifications.service_code_added'),
                t('notifications.service_code_added_detail', {
                    count: payload?.resources.length
                })
            );
            return res.data;
        });
    };

    const detachServiceCodes = (entity, id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.detachServiceCodes(
                entity,
                id,
                payload
            );
            globalStore.showSuccess(
                t('notifications.service_code_removed'),
                t('notifications.service_code_removed_detail', {
                    count: payload?.resources.length,
                    s: payload?.resources.length > 1 ? 's' : ''
                })
            );
            return res.data;
        });
    };

    const importServiceCodes = (payload, config) => {
        return globalStore.actionWrapper(async () => {
            const res = await CodeSetService.importServiceCodes(
                payload,
                config
            );

            globalStore.showSuccess(
                t('notifications.csv_file_processing_has_begun')
            );

            return res.data;
        });
    };

    return {
        currentCodeSet,
        currentCodeGroup,
        setCurrentCodeSet,
        setCurrentCodeGroup,

        searchCodeSets,
        getCodeSets,
        getCodeSet,
        createCodeSet,
        updateCodeSet,
        publishCodeSet,
        deleteCodeSet,
        getCodeSetTags,

        searchCodeGroupsExclude,
        searchCodeGroups,
        getCodeGroups,
        getCodeGroup,
        createCodeGroup,
        updateCodeGroup,
        publishCodeGroup,
        deleteCodeGroup,
        syncCodeGroupByTags,

        getEntityServiceCodes,
        getExcludedServiceCodes,
        searchEntityServiceCodes,
        searchExcludedServicesCodes,
        getExcludedServicesCodesForBenefit,

        searchServiceCodes,
        createServiceCode,
        updateServiceCode,
        syncServiceCodes,
        attachServiceCodes,
        detachServiceCodes,
        importServiceCodes,
        checkImportLogStatus
    };
});
