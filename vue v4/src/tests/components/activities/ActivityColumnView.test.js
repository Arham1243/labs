import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ActivityColumnView from '@/components/activities/ActivityColumnView.vue';
import { useActivityStore } from '@/stores/Activity';
import { useFeedStore } from '@/stores/Feed';
import { activityDisplayModes } from '@/config';

vi.mock('@/stores/Activity', () => ({
    useActivityStore: vi.fn()
}));

vi.mock('@/stores/Feed', () => ({
    useFeedStore: vi.fn()
}));

vi.mock('@/composables', () => ({
    useHelpers: () => ({
        formatDate: (date) => `Formatted: ${date}`
    })
}));

describe('ActivityColumnView', () => {
    let activityStoreMock;
    let feedStoreMock;

    beforeEach(() => {
        activityStoreMock = {
            currentActivityDisplayMode: activityDisplayModes.two_column
        };
        feedStoreMock = {
            currentFeeds: {
                value: {
                    pinned: [],
                    today: [],
                    others: []
                }
            }
        };

        useActivityStore.mockReturnValue(activityStoreMock);
        useFeedStore.mockReturnValue(feedStoreMock);
    });

    it('renders two-column layout if display mode is two_column', () => {
        feedStoreMock.currentFeeds.value.today.push({
            id: 1,
            created_at: '2024-01-01'
        });

        const wrapper = mount(ActivityColumnView, {
            props: { clientId: 1 },
            global: {
                mocks: {
                    $t: (key, params) => `Translated: ${params.activity}`
                }
            }
        });

        expect(wrapper.findComponent({ name: 'Splitter' }).exists()).toBe(true);
    });

    it('renders one-column layout if display mode is not two_column', () => {
        activityStoreMock.currentActivityDisplayMode =
            activityDisplayModes.one_column;
        feedStoreMock.currentFeeds.value.today.push({
            id: 1,
            created_at: '2024-01-01'
        });

        const wrapper = mount(ActivityColumnView, {
            props: { clientId: 1 },
            global: {
                mocks: {
                    $t: (key, params) => `Translated: ${params.activity}`
                }
            }
        });

        expect(wrapper.findComponent({ name: 'Splitter' }).exists()).toBe(
            false
        );
    });

    it('expands and collapses sections on click', async () => {
        feedStoreMock.currentFeeds.value.pinned.push({
            id: 1,
            created_at: '2024-01-01'
        });

        const wrapper = mount(ActivityColumnView, {
            props: { clientId: 1 },
            global: {
                mocks: {
                    $t: (key, params) => `Translated: ${params.activity}`
                }
            }
        });

        const toggle = wrapper.find('.pi-chevron-down');
        expect(toggle.exists()).toBe(true);

        await toggle.trigger('click');

        expect(wrapper.vm.sections[0].collapsed).toBe(true);
    });
});
