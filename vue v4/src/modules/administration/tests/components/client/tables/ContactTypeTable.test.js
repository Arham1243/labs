import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/client/tables/ContactTypeTable.vue';
import { searchContactTypeMock } from '@/modules/administration/tests/mocks/ContactType.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('ContactTypeTable', () => {
    beforeEach(() => {
        searchContactTypeMock();
        updateAbility(['create contact types']);
    });

    it('renders the table with correct headers and elements', async () => {
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

      const searchWrapper = wrapper.findByTestId('search-input');
expect(searchWrapper.find('input').exists()).toBe(true);
expect(searchWrapper.find('input').attributes('placeholder')).toBe(
    'Search'
);
        expect(wrapper.findByTestId('add-new-contact-type-button').text()).toBe(
            'New Contact Type'
        );

        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe(
            'Contact Type Name'
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
            wrapper.findByTestId('add-new-contact-type-button').exists()
        ).toBe(false);
    });

    it('displays empty state when no data is available', async () => {
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No contact types found.'
        );
    });

    it('renders a new contact type after adding to state', async () => {
        updateAbility(['update contact types']);
        const wrapper = mount(TableView);

        const newItem = {
            id: 1,
            name: 'Support',
            status: 'ACTIVE',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').text()).toBe(
            'Support'
        );
        expect(wrapper.findByTestId('status-tag-0').text()).toBe('ACTIVE');
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
            name: 'Support',
            status: 'ACTIVE',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });

    it('updates the search input when searchText changes', async () => {
        const wrapper = mount(TableView);
        wrapper.vm.searchText = 'support';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.find('input').element.value).toBe('support');
        expect(wrapper.vm.searchText).toBe('support');
    });
});
