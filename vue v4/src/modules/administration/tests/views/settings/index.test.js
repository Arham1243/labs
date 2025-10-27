import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/settings/index.vue';

describe('Settings index view', () => {
    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Settings' });

        expect(route.path).toBe('/administration/settings/date-time');

        const resolvedComponent = await route.matched[1].components.default();
        expect(resolvedComponent.default.__name).toBe(IndexView.__name);
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe('Settings');
    });

    it('renders the Tabs component', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    Tabs: true
                }
            }
        });

        expect(wrapper.find('tabs-stub').exists()).toBe(true);
    });
});
