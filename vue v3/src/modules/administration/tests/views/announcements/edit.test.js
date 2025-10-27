import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import EditView from '@/modules/administration/views/announcements/edit.vue';

describe('Administration > Edit Announcement view', () => {
    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    const wrapper = mount(EditView, {
        global: {
            stubs: {
                AnnouncementForm: true
            }
        }
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({
            name: 'Edit Announcement',
            params: { id: 1 }
        });

        expect(route.path).toBe('/administration/announcement/1/edit');

        const matched = route.matched.find(
            (r) => r.name === 'Edit Announcement'
        );
        const resolvedComponent = await matched?.components?.default?.();
        expect(resolvedComponent?.default?.__name).toBe(EditView.__name);
    });

    it('displays the correct page title and back button', async () => {
        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe('Announcement');
    });

    it('renders the announcement form component with correct mode prop', async () => {
        const view = mount(EditView, {
            global: {
                stubs: {
                    AnnouncementForm: true
                }
            }
        });

        const formStub = view.getComponent({ name: 'AnnouncementForm' });
        expect(formStub.props('mode')).toBe('edit');
    });
});
