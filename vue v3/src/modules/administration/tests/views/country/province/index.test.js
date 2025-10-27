import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/country/province/index.vue';
import { updateAbility } from '@/plugins/ability';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Province.service.mocks';

describe('Province index view', () => {
    beforeEach(() => {
        updateAbility(['view provinces']);
        searchItemsMock();
    });

    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Province' });

        expect(route.path).toBe('/administration/country/province');

        const resolvedComponent = await route.matched[1].components.default();
        expect(resolvedComponent.default.__name).toBe(IndexView.__name);
    });

    it('renders without errors', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    ProvinceTable: true,
                    Card: true
                }
            }
        });

        expect(wrapper.exists()).toBe(true);
    });
});
