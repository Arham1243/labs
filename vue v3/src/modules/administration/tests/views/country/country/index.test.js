import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/country/index.vue';
import { updateAbility } from '@/plugins/ability';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Country.service.mocks';

describe('Country index view', () => {
    beforeEach(() => {
        updateAbility(['view countries', 'view regions', 'view provinces']);
        searchItemsMock();
    });

    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Country/Regions' });

        expect(route.path).toBe('/administration/country');

        const resolvedComponent = await route.matched[1].components.default();
        expect(resolvedComponent.default.__name).toBe(IndexView.__name);
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe(
            'Country/Regions'
        );
    });

    it('renders the tabs correctly', async () => {
        const wrapper = mount(IndexView);

        const lis = wrapper.findAll('.p-tabmenuitem');
        expect(lis.length).toBe(3);
        expect(lis[0].text()).toBe('Country');
        expect(lis[1].text()).toBe('Region');
        expect(lis[2].text()).toBe('Province/State');
    });
});
