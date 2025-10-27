import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/teams/index.vue';
import { searchMock } from '@/modules/administration/tests/mocks/Team.service.mocks';

describe('Teams index view', () => {
    beforeEach(() => {
        searchMock();
    });

    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Teams' });

        expect(route.path).toBe('/administration/teams');
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe('Teams');
    });

    it('renders the table component', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    TeamTable: true
                }
            }
        });

        expect(wrapper.find('team-table-stub').exists()).toBe(true);
    });
});
