import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/users/tables/UserTable.vue';
import {
    searchCountriesMock,
    searchLanguagesMock,
    searchProvincesMock
} from '@/../tests/mocks/Common.service.mocks';
import { getSettingsMock } from '@/modules/administration/tests/mocks/Setting.service.mocks';
import { searchMock as searchUserMock } from '@/modules/administration/tests/mocks/User.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Users Table View', () => {
    beforeEach(() => {
        getSettingsMock();
        searchUserMock();
        searchProvincesMock();
        searchCountriesMock();
        searchLanguagesMock();
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['create users']);
        const wrapper = mount(TableView);
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(
            wrapper.findByTestId('search-input').attributes('placeholder')
        ).toBe('Search');
        expect(wrapper.findByTestId('add-new-user-button').text()).toBe(
            'New User'
        );

        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe('Name');

        expect(wrapper.findByTestId('table-header-status').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-status').text()).toBe(
            'Status'
        );
    });

    it('hides create button without permission', async () => {
        updateAbility([]);
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('add-new-user-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No users found.'
        );
    });

    it('renders a new user after adding to state', async () => {
        updateAbility(['update users']);
        const wrapper = mount(TableView);

        const newItem = {
            id: 1,
            name: 'Admin',
            systemic: 1,
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.users.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').text()).toBe('Admin');

        expect(wrapper.findByTestId('systemic-data-table-0').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(true);
    });

    it('hides actions button without update permission', async () => {
        updateAbility([]);
        const wrapper = mount(TableView);

        const newItem = {
            id: 1,
            name: 'Admin',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.users.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });

    it('updates the search input when searchText changes', async () => {
        const wrapper = mount(TableView);
        wrapper.vm.searchText = 'admin';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.element.value).toBe('admin');
        expect(wrapper.vm.searchText).toBe('admin');
    });
});
