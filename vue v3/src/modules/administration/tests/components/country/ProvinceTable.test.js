import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/administration/components/country/ProvinceTable.vue';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Province.service.mocks';
import {
    searchCountriesMock,
    getTaxTypesMock
} from '@/../tests/mocks/Common.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Province Table', () => {
    beforeEach(() => {
        searchItemsMock();
        searchCountriesMock();
        getTaxTypesMock();
        updateAbility(['create provinces']);
    });

    it('renders the table with correct headers and elements', async () => {
        const wrapper = mount(IndexView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(
            wrapper.findByTestId('search-input').attributes('placeholder')
        ).toBe('Search');
        expect(wrapper.findByTestId('add-new-province-button').text()).toBe(
            'New Province or State'
        );

        // Assertions for header texts using your naming convention
        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe(
            'Province/State Name'
        );

        expect(wrapper.findByTestId('table-header-country').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('table-header-country').text()).toBe(
            'Country'
        );

        expect(wrapper.findByTestId('table-header-code').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-code').text()).toBe('Code');

        // expect(wrapper.findByTestId('table-header-tax-type').exists()).toBe(
        //     true
        // );
        // expect(wrapper.findByTestId('table-header-tax-type').text()).toBe(
        //     'Tax Type'
        // );

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

        expect(wrapper.findByTestId('add-new-province-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        const wrapper = mount(IndexView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No provinces found.'
        );
    });

    it('renders a new province after adding to state', async () => {
        updateAbility(['update provinces']);
        const wrapper = mount(IndexView);

        const newItem = {
            id: 1,
            name: 'Ontario',
            country: { name: 'Canada' },
            code: 'ON',
            status: 'ACTIVE',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').text()).toBe(
            'Ontario'
        );
        expect(wrapper.findByTestId('country-data-table-0').text()).toBe(
            'Canada'
        );
        expect(wrapper.findByTestId('code-data-table-0').text()).toBe('ON');
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
            name: 'Ontario',
            country: { name: 'Canada' },
            code: 'ON',
            status: 'ACTIVE',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });

    it('updates the search input when searchText changes', async () => {
        const wrapper = mount(IndexView);
        wrapper.vm.searchText = 'ontario';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.element.value).toBe('ontario');
        expect(wrapper.vm.searchText).toBe('ontario');
    });
});
