import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import ListView from '@/modules/administration/views/announcements/list.vue';
import { searchAnnouncementMock } from '@/modules/administration/tests/mocks/Announcement.service.mocks';

describe('Administration > Announcement list view', () => {
    beforeEach(() => {
        searchAnnouncementMock();
    });
    const router = createRouter({
        history: createWebHistory(),
        routes
    });
    const wrapper = mount(ListView, {
        global: {
            stubs: {
                AnnouncementTable: true
            }
        }
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Announcement' });

        expect(route.path).toBe('/administration/announcement');

        const matched = route.matched.find((r) => r.name === 'Announcement');
        const resolvedComponent = await matched?.components?.default?.();
        expect(resolvedComponent?.default?.__name).toBe(ListView.__name);
    });

    it('displays the correct page title and back button', async () => {
        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe('Announcement');
    });

    it('renders the announcement table component', async () => {
        expect(wrapper.find('announcement-table-stub').exists()).toBe(true);
    });
});
