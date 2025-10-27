import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/roles/index.vue';
import { searchMock } from '@/modules/administration/tests/mocks/Role.service.mocks';

describe('Roles index view', () => {
    beforeEach(() => {
        searchMock();
    });

    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Roles' });

        expect(route.path).toBe('/administration/roles');
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe('Roles');
    });

    it('renders the table component', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    RoleTable: true
                }
            }
        });

        expect(wrapper.find('role-table-stub').exists()).toBe(true);
    });
});
