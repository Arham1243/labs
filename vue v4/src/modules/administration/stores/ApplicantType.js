import { defineStore } from 'pinia';
import { useGlobalStore } from '@/stores';
import { ApplicantTypeService } from '@/modules/administration/services';
import { useI18n } from 'vue-i18n';

export const useApplicantTypeStore = defineStore('ApplicantTypeStore', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();

    const search = (payload, params) => {
        return globalStore.actionWrapper(async () => {
            const res = await ApplicantTypeService.search(payload, params);
            return res.data;
        });
    };

    const create = (payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ApplicantTypeService.create(payload);
            globalStore.showSuccess(
                t('notifications.item_created', {
                    item: t('applicant_types.applicant_type')
                }),
                t('notifications.item_created_detail', {
                    item: t('applicant_types.applicant_type')
                })
            );
            return res.data;
        });
    };
    const update = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ApplicantTypeService.update(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('applicant_types.applicant_type')
                }),
                t('notifications.item_updated_detail', {
                    item: t('applicant_types.applicant_type')
                })
            );
            return res.data;
        });
    };
    const updateStatus = (id, payload) => {
        return globalStore.actionWrapper(async () => {
            const res = await ApplicantTypeService.updateStatus(id, payload);
            globalStore.showSuccess(
                t('notifications.item_updated', {
                    item: t('applicant_types.applicant_type')
                }),
                t('notifications.item_updated_detail', {
                    item: t('applicant_types.applicant_type')
                })
            );
            return res.data;
        });
    };

    const deleteItem = async (id) => {
        return globalStore.actionWrapper(async () => {
            const res = await ApplicantTypeService.deleteItem(id);
            globalStore.showSuccess(
                t('notifications.item_deleted', {
                    item: t('applicant_types.applicant_type')
                }),
                t('notifications.item_deleted_detail', {
                    item: t('applicant_types.applicant_type')
                })
            );
            return res.data;
        });
    };

    return {
        search,
        create,
        update,
        updateStatus,
        deleteItem
    };
});
