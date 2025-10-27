import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import AnnouncementMessages from '@/components/announcements/AnnouncementMessages.vue';
import { useCommonStore } from '@/stores';

// Mock the store
vi.mock('@/stores', () => {
    return {
        useCommonStore: vi.fn()
    };
});

const mockAnnouncements = [
    {
        id: 1,
        type: 'info',
        message: '<strong>Announcement 1</strong>'
    },
    {
        id: 2,
        type: 'warning',
        message: 'Announcement 2'
    },
    {
        id: 3,
        type: 'critical',
        message: 'Announcement 3'
    }
];

describe('AnnouncementMessages', () => {
    beforeEach(() => {
        useCommonStore.mockReturnValue({
            generalSettings: {
                announcements: mockAnnouncements
            }
        });
    });

    it('renders announcement list wrapper', async () => {
        const wrapper = mount(AnnouncementMessages);
        await flushPromises();

        expect(wrapper.find('[data-testid="announcement-list"]').exists()).toBe(
            true
        );
    });

    it('renders all announcement items', async () => {
        const wrapper = mount(AnnouncementMessages);
        await flushPromises();

        expect(
            wrapper.findAll('[data-testid^="announcement-item-"]').length
        ).toBe(mockAnnouncements.length);
    });

    it('renders correct announcement content', async () => {
        const wrapper = mount(AnnouncementMessages);
        await flushPromises();

        const firstItem = wrapper.find('[data-testid="announcement-item-0"]');
        expect(firstItem.html()).toContain('Announcement 1');

        const secondItem = wrapper.find('[data-testid="announcement-item-1"]');
        expect(secondItem.text()).toContain('Announcement 2');
    });
});
