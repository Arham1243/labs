import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import NewView from '@/modules/administration/views/announcements/new.vue';

describe('Administration > New Announcement view', () => {
    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    const wrapper = mount(NewView, {
        global: {
            stubs: {
                AnnouncementForm: true
            }
        }
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'New Announcement' });

        expect(route.path).toBe('/administration/announcement/new');

        const matched = route.matched.find(
            (r) => r.name === 'New Announcement'
        );
        const resolvedComponent = await matched?.components?.default?.();
        expect(resolvedComponent?.default?.__name).toBe(NewView.__name);
    });

    it('displays the correct page title and back button', async () => {
        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe('Announcement');
    });

    it('renders the announcement form component with correct mode prop', async () => {
        const view = mount(NewView, {
            global: {
                stubs: {
                    AnnouncementForm: true
                }
            }
        });

        const formStub = view.getComponent({ name: 'AnnouncementForm' });
        expect(formStub.props('mode')).toBe('new');
    });
});
