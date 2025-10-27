import { defineStore, storeToRefs } from 'pinia';
import { useGlobalStore } from '@/stores/Global';
import { ref } from 'vue';
import { useMutation, useResource } from '@/modules/claims/utils';
import * as FeedService from '@/services/Feed.service';
import { useI18n } from 'vue-i18n';
import { PaginationOptions, SortFilterOptions } from '@/config/index.js';

export const feedStore = defineStore('feed', () => {
    const globalStore = useGlobalStore();
    const { t } = useI18n();
    const filter = ref();

    const currentFeeds = ref({
        pinned: [],
        today: [],
        others: []
    });

    const setFilter = (value) => {
        filter.value = value;
    };

    const formatFeedsData = (feeds) => {
        const formattedFeeds = {
            data: {
                pinned: [],
                today: [],
                others: []
            }
        };

        // Get today's date string in YYYY-MM-DD format
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];

        feeds.data.forEach((note) => {
            const createdAtStr = new Date(note.created_at)
                .toISOString()
                .split('T')[0];

            if (note.is_pinned) {
                formattedFeeds.data.pinned.push(note);
            } else if (createdAtStr === todayStr) {
                formattedFeeds.data.today.push(note);
            } else {
                formattedFeeds.data.others.push(note);
            }
        });

        return formattedFeeds;
    };

    /**
     * Refresh feeds after a delay
     * @param clientId
     * @param module
     * @param moduleId
     * @returns {Promise<void>}
     */
    const refreshFeeds = async (clientId, module, moduleId) => {
        setTimeout(async () => {
            const feeds = await FeedService.getAllFeeds(clientId, {
                filters: filter.value,
                scopes: [{ name: 'ForEntity', parameters: [module, moduleId] }],
                sort: [
                    { field: 'is_pinned', direction: 'desc' },
                    { field: 'created_at', direction: 'desc' }
                ],
                includes: ['entities']
            });

            currentFeeds.value =
                filter.value.find((f) => f.field === 'feedable_type')?.value ===
                'note'
                    ? feeds.data.data
                    : formatFeedsData(feeds.data).data;
        }, 2000);
    };

    /**
     * Get all feeds
     * @params ()
     * @returns Resource elements - { }data, loading, error, status }
     **/
    const getAllFeeds = (clientId, payload, refresh = true) => {
        return useResource(
            globalStore.actionWrapper(async () => {
                const res = await FeedService.getAllFeeds(clientId, payload);

                // Format and set current feeds
                if (
                    payload.filters.find((f) => f.field === 'feedable_type')
                        ?.value === 'note'
                )
                    return res.data;
                else return formatFeedsData(res.data);
            }),
            currentFeeds,
            refresh
        );
    };

    /**
     * Search feeds
     * @returns Mutation elements - {loading, data, meta, error, status, mutate}
     */
    const searchFeeds = () => {
        const pagination = new PaginationOptions(1, 3);

        return useMutation(
            async ({ clientId, filters, scopes }) => {
                let params = pagination.getPageParams();

                const res = await FeedService.searchFeeds(
                    clientId,
                    {
                        filters: filters || [],
                        scopes: scopes || [],
                        sort: [{ field: 'created_at', direction: 'desc' }]
                    },
                    {
                        ...params,
                        per_page: params.limit
                    }
                );
                return res.data;
            },
            null,
            pagination
        );
    };

    /**
     * Update a feed
     * @params ()
     * @returns Mutation elements - {loading, mutate, status}
     */
    const mutateFeed = () => {
        return useMutation(async ({ clientId, feedId, payload }) => {
            return globalStore.actionWrapper(async () => {
                const res = await FeedService.updateFeed(
                    clientId,
                    feedId,
                    payload
                );

                if (payload.is_pinned) {
                    // Show success notification
                    globalStore.showSuccess(
                        t('notifications.activity_pinned'),
                        t('notifications.activity_pinned_detail')
                    );
                } else {
                    // Show success notification
                    globalStore.showSuccess(
                        t('notifications.activity_unpinned'),
                        t('notifications.activity_unpinned_detail')
                    );
                }

                // Refresh feeds after updating
                await refreshFeeds(clientId, payload.module, payload.moduleId);

                return res.data;
            });
        });
    };

    return {
        currentFeeds,

        setFilter,
        getAllFeeds,
        searchFeeds,
        mutateFeed,
        refreshFeeds
    };
});

export const useFeedStore = () => {
    let store = feedStore();
    let state = storeToRefs(store);
    return { ...store, ...state };
};
