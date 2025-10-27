import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/administration/components/country/RegionTable.vue';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Region.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Region Table', () => {
    beforeEach(() => {
        searchItemsMock();
        updateAbility(['create regions']);
    });

    it('renders the table with correct headers and elements', async () => {
        const wrapper = mount(IndexView);
        await wrapper.vm.$nextTick();

      const searchWrapper = wrapper.findByTestId('search-input');
expect(searchWrapper.find('input').exists()).toBe(true);
expect(searchWrapper.find('input').attributes('placeholder')).toBe(
    'Search'
);

        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe(
            'Region Name'
        );

        expect(wrapper.findByTestId('table-header-code').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-code').text()).toBe('Code');

        expect(wrapper.findByTestId('table-header-status').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-status').text()).toBe(
            'Status'
        );

        expect(wrapper.findByTestId('table-header-updated-at').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('table-header-updated-at').text()).toBe(
            'Last Updated'
        );
    });

    it('hides create button without permission', async () => {
        updateAbility([]);
        const wrapper = mount(IndexView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('add-new-region-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        const wrapper = mount(IndexView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No regions found.'
        );
    });

    it('renders a new region after adding to state', async () => {
        updateAbility(['update regions']);
        const wrapper = mount(IndexView);

        const newItem = {
            id: 'NR',
            name: 'North Region',
            country: 'Canada',
            code: 'NR',
            status: 'ACTIVE',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').text()).toBe(
            'North Region'
        );
        expect(wrapper.findByTestId('code-data-table-0').text()).toBe('NR');
        expect(wrapper.findByTestId('status-tag-0').text()).toBe('ACTIVE');
        expect(wrapper.findByTestId('last-updated-data-table-0').text()).toBe(
            wrapper.vm.helpers.formatDate(newItem.updated_at)
        );
        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(true);
    });

    it('hides actions button without update permission', async () => {
        updateAbility([]);
        const wrapper = mount(IndexView);

        const newItem = {
            id: 1,
            name: 'North Region',
            country: 'Canada',
            code: 'NR',
            status: 'ACTIVE',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });

    it('updates the search input when searchText changes', async () => {
        const wrapper = mount(IndexView);
        wrapper.vm.searchText = 'north region';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.find('input').element.value).toBe('north region');
        expect(wrapper.vm.searchText).toBe('north region');
    });
});
