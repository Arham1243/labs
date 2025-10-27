import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/roles/tables/RoleTable.vue';
import { searchMock } from '@/modules/administration/tests/mocks/Role.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Roles Table View', () => {
    beforeEach(() => {
        searchMock();
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['create roles']);
        const wrapper = mount(TableView);
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('type-filter-dropdown').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(
            wrapper.findByTestId('search-input').attributes('placeholder')
        ).toBe('Search');
        expect(wrapper.findByTestId('add-new-role-button').text()).toBe(
            'New Role'
        );

        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe('Role');

        expect(wrapper.findByTestId('table-header-type').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-type').text()).toBe('Type');

        expect(wrapper.findByTestId('table-header-last-updated').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('table-header-last-updated').text()).toBe(
            'Last Updated'
        );
    });

    it('hides create button without permission', async () => {
        updateAbility([]);
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('add-new-role-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No roles found.'
        );
    });

    it('renders a new role after adding to state', async () => {
        updateAbility(['update roles']);
        const wrapper = mount(TableView);

        const newItem = {
            id: 1,
            name: 'Admin',
            type: 'Administrator',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').text()).toBe('Admin');
        expect(wrapper.findByTestId('type-data-table-0').text()).toBe(
            'Administrator'
        );
        expect(wrapper.findByTestId('last-updated-data-table-0').text()).toBe(
            wrapper.vm.helpers.formatDate(newItem.updated_at)
        );
        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(true);
    });

    it('hides actions button without update permission', async () => {
        updateAbility([]);
        const wrapper = mount(TableView);

        const newItem = {
            id: 1,
            name: 'Admin',
            type: 'Administrator',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

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
