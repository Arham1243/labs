import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/policy/contact-sources.vue';

describe('Contact Sources index view', () => {
    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Contact Sources' });

        expect(route.path).toBe('/administration/contact-sources');

        const resolvedComponent = await route.matched[1].components.default();
        expect(resolvedComponent.default.__name).toBe(IndexView.__name);
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    ContactSourceTable: true
                }
            }
        });

        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe(
            'Contact Sources'
        );
    });

    it('renders the table component', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    ContactSourceTable: true
                }
            }
        });

        expect(wrapper.find('contact-source-table-stub').exists()).toBe(true);
    });
});
