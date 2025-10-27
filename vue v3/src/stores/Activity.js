import { defineStore, storeToRefs } from 'pinia';
import { useGlobalStore } from '@/stores/Global';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { activityDisplayMode, createActivityPayload } from '@/utils/activities';
import { useMutation, useResource } from '@/modules/claims/utils';
import {
    listAllActivityTemplates,
    createActivityTemplate,
    createActivity,
    updateActivity,
    deleteActivity
} from '@/services/Activity.service';
import { useFeedStore } from '@/stores/Feed';
import helpers from '@/utils/helpers';

export const activityStore = defineStore('activity', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();
    const { refreshFeeds } = useFeedStore();

    const currentActivityTemplates = ref([]);
    const currentActivityDisplayMode = ref(activityDisplayMode[1].value);
    const currentModule = ref(null);
    const currentModuleId = ref(null);

    const setCurrentActivityDisplayMode = (mode) => {
        currentActivityDisplayMode.value = mode;
    };

    const setCurrentModule = (module, moduleId) => {
        currentModule.value = module;
        currentModuleId.value = moduleId;
    };

    const getAllActivityTemplates = (refresh = true) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await listAllActivityTemplates();

                return res.data;
            }),
            currentActivityTemplates,
            refresh
        );
    };

    const mutateActivityTemplate = () => {
        return useMutation(async (payload) => {
            return globalStore.actionWrapper(async () => {
                const res = await createActivityTemplate(payload);

                // Show success notification
                globalStore.showSuccess(
                    t('notifications.new_template_created'),
                    t('notifications.new_template_created_detail')
                );

                return res.data;
            });
        });
    };

    /**
     * Create / Update activity
     * @params ()
     * @returns Mutation elements - {loading, mutate, status}
     */
    const mutateActivity = () => {
        return useMutation(
            async ({ clientId, feedable, payload, activityId }) => {
                return globalStore.actionWrapper(async () => {
                    const { module, moduleId, ...restPayload } = payload;
                    const formData = {
                        ...restPayload
                    };
                    if (activityId) {
                        const res = await updateActivity(
                            clientId,
                            feedable,
                            formData,
                            activityId
                        );

                        // Show success notification
                        globalStore.showSuccess(
                            t('notifications.activity_edited'),
                            t('notifications.activity_edited_detail')
                        );

                        await refreshFeeds(
                            clientId,
                            payload.module,
                            payload.moduleId
                        );
                        return res.data;
                    } else {
                        const { module, moduleId, ...restPayload } = payload;
                        const formData = {
                            ...createActivityPayload(
                                feedable,
                                payload.module,
                                payload.moduleId
                            ),
                            ...restPayload
                        };

                        const res = await createActivity(
                            clientId,
                            feedable,
                            formData
                        );

                        // Show success notification
                        globalStore.showSuccess(
                            t('notifications.new_activity'),
                            t('notifications.activity_added_successfully', {
                                type: helpers.capitalizeWords(feedable)
                            })
                        );

                        await refreshFeeds(
                            clientId,
                            payload.module,
                            payload.moduleId
                        );
                        return res.data;
                    }
                });
            }
        );
    };

    const removeActivity = () => {
        return useMutation(
            async ({ clientId, feedable, payload, activityId }) => {
                return globalStore.actionWrapper(async () => {
                    const res = deleteActivity({
                        clientId,
                        feedable,
                        activityId,
                        source: payload.source
                    });

                    // Show success notification
                    globalStore.showSuccess(
                        t('notifications.activity_deleted'),
                        t('notifications.activity_deleted_detail')
                    );

                    await refreshFeeds(
                        clientId,
                        payload.module,
                        payload.moduleId
                    );
                });
            }
        );
    };

    return {
        currentActivityDisplayMode,
        currentModule,
        currentModuleId,
        currentActivityTemplates,

        setCurrentActivityDisplayMode,
        setCurrentModule,
        getAllActivityTemplates,
        mutateActivityTemplate,
        mutateActivity,
        removeActivity
    };
});

export const useActivityStore = () => {
    let store = activityStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
