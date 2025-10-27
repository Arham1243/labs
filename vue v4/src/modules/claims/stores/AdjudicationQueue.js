import { defineStore, storeToRefs } from 'pinia';
import { useGlobalStore } from '@/stores';
import { ref } from 'vue';
import { useMutation, useResource } from '@/modules/claims/utils';
import { useI18n } from 'vue-i18n';
import * as AdjudicationQueueService from '@/modules/claims/services/AdjudicationQueue.service';
import { cloneObj } from '@/modules/claims/utils/helper';
import { PaginationOptions, SortFilterOptions } from '@/config';

const {
    createAdjudicationQueue,
    updateAdjudicationQueue,
    changeQueuePriority
} = AdjudicationQueueService;

const ruleCond = [
    {
        field: '',
        value: '',
        operator: ''
    }
];

export const adjudicationQueueStore = defineStore(
    'AdjudicationQueueStore',
    () => {
        const globalStore = useGlobalStore();
        const { t } = useI18n();

        const currentAdjudicationQueue = ref();
        const adjudicationQueues = ref();
        const currentAdjudicationQueueSubmissions = ref();
        const rulesData = ref([...ruleCond]);
        const queueDashboardData = ref();

        /**
         * Set current queue
         * @param queue
         */
        const setAdjudicationQueue = (queue) => {
            if (queue.length) adjudicationQueues.value = queue;
            else {
                if (queue.id !== currentAdjudicationQueue.value?.id)
                    setRulesData(ruleCond);
                currentAdjudicationQueue.value = queue;
            }
        };

        const pagination = new PaginationOptions(1, 10);
        const sortFilters = new SortFilterOptions();

        /**
         * Get adjudication queue
         * @param queueId
         * @param refresh
         * @returns Resource elements - { data, loading, error, status }
         */
        const getAdjudicationQueue = (queueId, refresh = true) => {
            return useResource(
                globalStore.actionWrapper(async () => {
                    // console.log({pagination})
                    let params = pagination.getPageParams();

                    const res =
                        await AdjudicationQueueService.getAdjudicationQueue(
                            queueId,
                            { ...params, per_page: params.limit }
                        );

                    // res.data.data.submissionScopes = !queueId
                    //     ? []
                    //     : !res.data.data.submissions.length
                    //       ? [
                    //             {
                    //                 name: 'submissions',
                    //                 parameters: []
                    //             }
                    //         ]
                    //       : [
                    //             {
                    //                 name: 'submissions',
                    //                 parameters: res.data.data.submissions.map(
                    //                     (s) => s.submission_id
                    //                 )
                    //             }
                    //         ];

                    return res.data;
                }),
                queueId ? currentAdjudicationQueue : adjudicationQueues,
                refresh
            );
        };

        /**
         * Get / Search  Queue
         * @params ()
         * @returns Mutation elements - {loading, mutate, status}
         */
        const searchAdjudicationQueue = () => {
            return useMutation(async (payload) => {
                return globalStore.actionWrapper(async () => {
                    let payloadFilter = sortFilters.getSortFilters('');
                    // pagination.resetPageParams();

                    if (payload?.search) {
                        sortFilters.updateSearch(payload.search);
                        payloadFilter = sortFilters.getSortFilters(
                            payload.search
                        );
                    } else {
                        sortFilters.updateSearch('');
                        payloadFilter = sortFilters.getSortFilters('');
                    }

                    if (payload?.event && payload?.type === 'sort') {
                        sortFilters.updateSortFilters(payload.event);

                        payloadFilter = sortFilters.getSortFilters('');
                        if (!payloadFilter?.sort?.length)
                            payloadFilter = {
                                sort: [
                                    { field: 'created_at', direction: 'desc' }
                                ]
                            };

                        if (!payload?.search) delete payloadFilter.search;
                        pagination.updatePageParams(payload.event);
                    } else if (payload?.event)
                        pagination.updatePageParams(payload.event);

                    let params = pagination.getPageParams();

                    const res =
                        await AdjudicationQueueService.getAdjudicationQueue(
                            undefined,
                            { ...params, per_page: params.limit },
                            payloadFilter
                        );

                    return res.data;
                });
            }, adjudicationQueues);
        };

        /**
         * Get adjudication queue submissions
         * @param payload
         * @param refresh
         * @returns Resource elements - { }data, loading, error, status }
         */
        const getAdjudicationQueueSubmissions = (payload, refresh = true) => {
            return useResource(
                globalStore.actionWrapper(async () => {
                    const res =
                        await AdjudicationQueueService.getAdjudicationQueueSubmissions(
                            payload
                        );
                    return res.data;
                }),
                currentAdjudicationQueueSubmissions,
                refresh
            );
        };

        /**
         * Get / Search adjudication queue submissions
         * @params ()
         * @returns Mutation elements - {loading, mutate, status}
         */
        const searchAdjudicationQueueSubmissions = () => {
            return useMutation(async (payload) => {
                // ! payload is to return sort type, event and search
                return globalStore.actionWrapper(async () => {
                    sortFilters.updateFilters(
                        'queue_id',
                        currentAdjudicationQueue.value.id
                    );
                    let payloadFilter = sortFilters.getSortFilters('');
                    // pagination.resetPageParams();

                    if (payload?.search) {
                        sortFilters.updateSearch(payload.search);
                        payloadFilter = sortFilters.getSortFilters(
                            payload.search
                        );
                    } else {
                        sortFilters.updateSearch('');
                        payloadFilter = sortFilters.getSortFilters('');
                    }

                    if (payload?.event && payload?.type === 'sort') {
                        sortFilters.updateSortFilters(payload.event);

                        payloadFilter = sortFilters.getSortFilters('');
                        if (!payloadFilter?.sort?.length)
                            payloadFilter.sort = [
                                { field: 'priority', direction: 'asc' }
                            ];

                        if (!payload?.search) delete payloadFilter.search;
                    } else if (payload?.event)
                        pagination.updatePageParams(payload.event);

                    let params = pagination.getPageParams();

                    const res =
                        await AdjudicationQueueService.searchAdjudicationQueueSubmissions(
                            payloadFilter,
                            { ...params, per_page: params.limit }
                        );

                    return res.data;
                });
            }, currentAdjudicationQueueSubmissions);
        };

        const setRulesData = (formData) => {
            rulesData.value = cloneObj(formData);
        };

        /**
         * Create / Update Queue
         * @params ()
         * @returns Mutation elements - {loading, mutate, status}
         */
        const mutateAdjudicationQueue = () => {
            return useMutation(
                async ({ payload, queueId, showMsg = false }) => {
                    return globalStore.actionWrapper(async () => {
                        const res = await (queueId
                            ? updateAdjudicationQueue(payload, queueId)
                            : createAdjudicationQueue(payload));
                        if (showMsg) {
                            // Show success notification
                            globalStore.showSuccess(
                                t('notifications.adjudication_queue_created'),
                                t(
                                    'notifications.adjudication_queue_created_message'
                                )
                            );
                        } else {
                            // Show success notification
                            globalStore.showSuccess(
                                t('notifications.queue_created'),
                                t('notifications.queue_created_message')
                            );
                        }
                        if (res.data?.data) {
                            setAdjudicationQueue(res.data.data);
                            getAdjudicationQueue();
                        }
                        return res.data;
                    });
                }
            );
        };

        /**
         * Change status of queue
         * @params ()
         * @returns Mutation elements - {loading, mutate, status}
         */
        const changeStatusAdjudicationQueue = () => {
            return useMutation(async ({ payload, queueId }) => {
                return globalStore.actionWrapper(async () => {
                    const res =
                        await AdjudicationQueueService.changeStatusAdjudicationQueue(
                            queueId,
                            payload
                        );
                    // Show success notification
                    globalStore.showSuccess(
                        t('notifications.queue_status_changed', {
                            status: payload.status + 'd'
                        }),
                        t('notifications.queue_status_changed_message', {
                            queueName: res.data?.data.name,
                            status: payload.status
                        })
                    );
                    if (res.data?.data) {
                        setAdjudicationQueue(res.data.data);
                        getAdjudicationQueue();
                    }
                    return res.data;
                });
            });
        };

        /**
         * Delete queue
         * @params ()
         * @returns Mutation elements - {loading, mutate, status}
         */
        const deleteAdjudicationQueue = () => {
            return useMutation(async ({ queueId, queueName }) => {
                return globalStore.actionWrapper(async () => {
                    const res =
                        await AdjudicationQueueService.deleteAdjudicationQueue(
                            queueId
                        );
                    // Show success notification
                    globalStore.showSuccess(
                        t('notifications.queue_deleted'),
                        t('notifications.queue_deleted_message', {
                            queueName: queueName
                        })
                    );
                    getAdjudicationQueue();
                });
            });
        };

        /**
         * Get queue dashboard data
         * @param payload
         * @param refresh
         * @returns Resource elements - { }data, loading, error, status }
         */
        const getQueueDashboard = (payload, refresh = true) => {
            return useResource(
                globalStore.actionWrapper(async () => {
                    const res =
                        await AdjudicationQueueService.getQueueDashboard(
                            payload
                        );
                    return res.data;
                }),
                queueDashboardData,
                refresh
            );
        };

        /**
         * Change Queue Priority
         * @params ()
         * @returns Mutation elements - {loading, mutate, status}
         */
        const mutateQueuePriority = () => {
            return useMutation(async (payload) => {
                return globalStore.actionWrapper(async () => {
                    const res = await changeQueuePriority(payload);

                    if (res.status === 204) {
                        globalStore.showSuccess(
                            t('notifications.queue_priority'),
                            t('notifications.queue_priority_message')
                        );

                        // Get Updated Queues
                        pagination.updatePageParams({ page: 0, rows: 10 });
                        let params = pagination.getPageParams();

                        let payloadFilter = {
                            sort: [{ field: 'priority', direction: 'asc' }]
                        };
                        const res_queues =
                            await AdjudicationQueueService.getAdjudicationQueue(
                                undefined,
                                { ...params, per_page: params.limit },
                                payloadFilter
                            );
                        if (res_queues.data?.data)
                            setAdjudicationQueue(res_queues.data.data);
                    }

                    return res.data;
                });
            });
        };

        return {
            currentAdjudicationQueue,
            adjudicationQueues,
            currentAdjudicationQueueSubmissions,
            rulesData,
            queueDashboardData,
            pagination,
            sortFilters,

            setAdjudicationQueue,
            getAdjudicationQueue,
            searchAdjudicationQueue,
            getAdjudicationQueueSubmissions,
            searchAdjudicationQueueSubmissions,
            mutateAdjudicationQueue,
            changeStatusAdjudicationQueue,
            deleteAdjudicationQueue,
            setRulesData,
            getQueueDashboard,
            mutateQueuePriority
        };
    }
);

export const useAdjudicationQueueStore = () => {
    let store = adjudicationQueueStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
