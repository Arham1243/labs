import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/client/tables/ClientSectorTable.vue';
import { searchClientSectorMock } from '@/modules/administration/tests/mocks/ClientSector.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('ClientSectorTable', () => {
    beforeEach(() => {
        searchClientSectorMock();
        updateAbility(['create client sectors']);
    });

    it('renders the table with correct headers and elements', async () => {
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(
            wrapper.findByTestId('search-input').attributes('placeholder')
        ).toBe('Search');
        expect(
            wrapper.findByTestId('add-new-client-sector-button').text()
        ).toBe('New Sector');

        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe(
            'Sector Name'
        );

        expect(wrapper.findByTestId('table-header-status').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-status').text()).toBe(
            'Status'
        );

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

        expect(
            wrapper.findByTestId('add-new-client-sector-button').exists()
        ).toBe(false);
    });

    it('displays empty state when no data is available', async () => {
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No client sectors found.'
        );
    });

    it('renders a new client sector after adding to state', async () => {
        updateAbility(['update client sectors']);
        const wrapper = mount(TableView);

        const newItem = {
            id: '1743776799597729206',
            name: 'Turner Runte',
            status: 'ACTIVE',
            created_at: '2025-04-04T14:26:39.000000Z',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').text()).toBe(
            newItem.name
        );
        expect(wrapper.findByTestId('status-tag-0').text()).toBe(
            newItem.status
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
            id: '1743776799597729206',
            name: 'Turner Runte',
            status: 'ACTIVE',
            created_at: '2025-04-04T14:26:39.000000Z',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });

    it('updates the search input when searchText changes', async () => {
        const wrapper = mount(TableView);
        wrapper.vm.searchText = 'healthcare';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.element.value).toBe('healthcare');
        expect(wrapper.vm.searchText).toBe('healthcare');
    });
});
