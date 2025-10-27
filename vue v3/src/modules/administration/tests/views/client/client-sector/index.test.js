import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/client/client-sector.vue';
import { searchClientSectorMock } from '@/modules/administration/tests/mocks/ClientSector.service.mocks';

describe('Client sector index view', () => {
    beforeEach(() => {
        searchClientSectorMock();
    });

    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Client Sector' });

        expect(route.path).toBe('/administration/client-sector');

        const resolvedComponent = await route.matched[1].components.default();
        expect(resolvedComponent.default.__name).toBe(IndexView.__name);
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe('Client Sector');
    });

    it('renders the table component', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    ClientSectorTable: true
                }
            }
        });

        expect(wrapper.find('client-sector-table-stub').exists()).toBe(true);
    });
});
