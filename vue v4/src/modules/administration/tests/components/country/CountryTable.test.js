import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/country/CountryTable.vue';
import {
    searchCurrenciesMock,
    searchRegionsMock
} from '@/../tests/mocks/Common.service.mocks';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Country.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('CountryTable', () => {
    beforeEach(() => {
        searchItemsMock();
        searchCurrenciesMock();
        searchRegionsMock();
        updateAbility(['create countries']);
    });

    it('renders the table with correct headers and elements', async () => {
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

      const searchWrapper = wrapper.findByTestId('search-input');
expect(searchWrapper.find('input').exists()).toBe(true);
expect(searchWrapper.find('input').attributes('placeholder')).toBe(
    'Search'
);
        expect(wrapper.findByTestId('add-new-country-button').text()).toBe(
            'New Country'
        );
        expect(wrapper.findByTestId('table-header-name').text()).toBe(
            'Country Name'
        );
        expect(wrapper.findByTestId('table-header-code').text()).toBe('Code');
        expect(wrapper.findByTestId('table-header-currency').text()).toBe(
            'Currency'
        );
        expect(wrapper.findByTestId('table-header-region').text()).toBe(
            'Region'
        );
        expect(wrapper.findByTestId('table-header-calling-code').text()).toBe(
            'Calling Code'
        );
        expect(wrapper.findByTestId('table-header-risk-level').text()).toBe(
            'Risk Level'
        );
        expect(wrapper.findByTestId('table-header-status').text()).toBe(
            'Status'
        );
    });

    it('hides create button without permission', async () => {
        updateAbility([]);
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('add-new-country-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No countries found.'
        );
    });

    it('renders a new country after adding to state', async () => {
        updateAbility(['update countries']);
        const wrapper = mount(TableView);

        const newItem = {
            id: 'NN',
            name: 'tokyo',
            phone_code: '+91',
            status: 'active',
            risk_level: 'LOW',
            sanctioned: false,
            created_at: '2025-02-13T14:21:33.000000Z',
            updated_at: '2025-02-13T14:22:12.000000Z',
            currency: {
                id: 'USD'
            },
            region: {
                name: 'Asia'
            }
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').text()).toBe('tokyo');
        expect(wrapper.findByTestId('code-data-table-0').text()).toBe('NN');
        expect(wrapper.findByTestId('currency-data-table-0').text()).toBe(
            'USD'
        );
        expect(wrapper.findByTestId('region-data-table-0').text()).toBe('Asia');
        expect(wrapper.findByTestId('calling-code-data-table-0').text()).toBe(
            '+91'
        );
        expect(wrapper.findByTestId('risk-level-data-table-0').text()).toBe(
            'LOW'
        );
        expect(wrapper.findByTestId('status-tag-0').text()).toBe('ACTIVE');
        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(true);
    });

    it('hides actions button without update permission', async () => {
        updateAbility([]);
        const wrapper = mount(TableView);

        const newItem = {
            id: 'NN',
            name: 'tokyo',
            phone_code: '+91',
            status: 'active',
            risk_level: 'LOW',
            sanctioned: false,
            created_at: '2025-02-13T14:21:33.000000Z',
            updated_at: '2025-02-13T14:22:12.000000Z',
            currency: {
                name: 'Test'
            },
            region: {
                name: 'Asia'
            }
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });

    it('updates the search input when searchText changes', async () => {
        const wrapper = mount(TableView);
        wrapper.vm.searchText = 'tokyo';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.find('input').element.value).toBe('tokyo');
        expect(wrapper.vm.searchText).toBe('tokyo');
    });
});
