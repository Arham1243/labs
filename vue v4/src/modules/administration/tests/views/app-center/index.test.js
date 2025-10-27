import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/app-center/index.vue';
import { getAppsMock } from '@/modules/administration/tests/mocks/AppCenter.service.mocks';

describe('App Center index view', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        getAppsMock();
    });

    afterEach(() => {
        vi.runAllTimers();
        vi.useRealTimers();
    });

    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'App Center' });

        expect(route.path).toBe('/administration/app-center');

        const resolvedComponent = await route.matched[1].components.default();
        expect(resolvedComponent.default.__name).toBe(IndexView.__name);
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('page-title').text()).toBe('App Center');
        expect(wrapper.findByTestId('back-button')).toBeTruthy();
    });

    it('renders the Tabs component', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    AppCenter: true,
                    Tabs: true
                }
            }
        });

        wrapper.vm.loading = false;
        await wrapper.vm.$nextTick();

        expect(wrapper.find('tabs-stub').exists()).toBe(true);
    });
});
