import { vi } from 'vitest';
import { ref } from 'vue';

export const currentFeedsMock = [
    {
        id: '775622981897232384',
        feedable_type: 'Horus\\Core\\Models\\Note',
        feedable_id: '775622799526273024',
        title: 'test title',
        body: '<p>test content</p>',
        is_pinned: true,
        created_by: '761464805796036608',
        entities: [
            {
                entity_id: '766568964730941440',
                entity_type: 'Horus\\ClaimModule\\Models\\Submission',
                is_primary: true
            },
            {
                entity_id: '761464889199771648',
                entity_type: 'Horus\\ClientModule\\Models\\Client',
                is_primary: false
            },
            {
                entity_id: '761465756614197248',
                entity_type: 'Horus\\PolicyModule\\Models\\Insured',
                is_primary: false
            },
            {
                entity_id: '761465756828106754',
                entity_type: 'Horus\\PolicyModule\\Models\\Policy',
                is_primary: false
            }
        ],
        created_at: '2025-06-17T19:36:57.000000Z',
        updated_at: '2025-06-17T19:36:57.000000Z'
    },
    {
        id: '775622981897219823',
        feedable_type: 'Horus\\Core\\Models\\Note',
        feedable_id: '775622799526228734',
        title: 'test title 1',
        body: '<p>test content </p>',
        is_pinned: true,
        created_by: '761464805796036608',
        entities: [
            {
                entity_id: '766568964730941440',
                entity_type: 'Horus\\ClaimModule\\Models\\Submission',
                is_primary: true
            },
            {
                entity_id: '761464889199771648',
                entity_type: 'Horus\\ClientModule\\Models\\Client',
                is_primary: false
            },
            {
                entity_id: '761465756614197248',
                entity_type: 'Horus\\PolicyModule\\Models\\Insured',
                is_primary: false
            },
            {
                entity_id: '761465756828106754',
                entity_type: 'Horus\\PolicyModule\\Models\\Policy',
                is_primary: false
            }
        ],
        created_at: '2025-06-18T19:36:57.000000Z',
        updated_at: '2025-06-18T19:36:57.000000Z'
    }
];

export const getAllFeedsMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        data: currentFeedsMock,
        status: 'success'
    }));

const mutateFeedMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        data: currentFeedsMock,
        status: 'success'
    }));

export const useFeedStoreMock = () => ({
    currentFeeds: ref(currentFeedsMock),

    refreshFeeds: () => {
        setTimeout(() => {
            // Simulate a refresh by resetting the feeds
            currentFeedsMock.value = [
                ...currentFeedsMock.value,
                {
                    id: '775622981897232385',
                    feedable_type: 'Horus\\Core\\Models\\Note',
                    feedable_id: '775622799526273025',
                    title: 'refreshed title',
                    body: '<p>refreshed content</p>',
                    is_pinned: false,
                    created_by: '761464805796036608',
                    entities: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            ];
        }, 2000);
    },

    getAllFeeds: getAllFeedsMock(),
    mutateFeed: mutateFeedMock()
});
