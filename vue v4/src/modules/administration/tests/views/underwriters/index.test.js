import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/underwriters/index.vue';
import { searchUnderwritersMock } from '@/modules/administration/tests/mocks/Underwriter.service.mocks';

describe('Underwriters index view', () => {
    beforeEach(() => {
        searchUnderwritersMock();
    });
    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Underwriters' });

        expect(route.path).toBe('/administration/underwriters');

        const resolvedComponent = await route.matched[1].components.default();
        expect(resolvedComponent.default.__name).toBe(IndexView.__name);
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe('Underwriters');
    });

    it('renders the table component', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    UnderwritersTable: true
                }
            }
        });

        expect(wrapper.find('underwriters-table-stub').exists()).toBe(true);
    });
});
