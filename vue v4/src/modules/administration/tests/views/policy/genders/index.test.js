import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/policy/genders.vue';

describe('Genders index view', () => {
    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Genders' });

        expect(route.path).toBe('/administration/genders');

        const resolvedComponent = await route.matched[1].components.default();
        expect(resolvedComponent.default.__name).toBe(IndexView.__name);
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    GenderTable: true
                }
            }
        });

        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe('Genders');
    });

    it('renders the table component', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    GenderTable: true
                }
            }
        });

        expect(wrapper.find('gender-table-stub').exists()).toBe(true);
    });
});
