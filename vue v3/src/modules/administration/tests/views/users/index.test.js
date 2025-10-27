import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import routes from '@/routes/routes';
import { createRouter, createWebHistory } from 'vue-router';
import IndexView from '@/modules/administration/views/users/index.vue';
import { searchMock } from '@/modules/administration/tests/mocks/User.service.mocks';
import { getSettingsMock } from '@/modules/administration/tests/mocks/Setting.service.mocks';
import {
    searchLanguagesMock,
    searchCountriesMock
} from '@/../tests/mocks/Common.service.mocks';

describe('Users index view', () => {
    beforeEach(() => {
        searchMock();
        getSettingsMock();
        searchLanguagesMock();
        searchCountriesMock();
    });

    const router = createRouter({
        history: createWebHistory(),
        routes
    });

    it('has a valid route configuration', async () => {
        const route = router.resolve({ name: 'Users' });

        expect(route.path).toBe('/administration/users');
    });

    it('displays the correct page title and back button', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('back-button')).toBeTruthy();
        expect(wrapper.findByTestId('page-title').text()).toBe('Users');
    });

    it('renders the table component', async () => {
        const wrapper = mount(IndexView, {
            global: {
                stubs: {
                    UserTable: true
                }
            }
        });

        expect(wrapper.find('user-table-stub').exists()).toBe(true);
    });
});
