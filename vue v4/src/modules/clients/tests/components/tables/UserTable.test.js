import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UserTable from '@/modules/clients/components/tables/UserTable.vue';
import {
    searchCountriesMock,
    searchLanguagesMock,
    searchProvincesMock
} from '@/../tests/mocks/Common.service.mocks';
import { getSettingsMock } from '@/modules/administration/tests/mocks/Setting.service.mocks';
import { searchUserMock } from '@/modules/clients/tests/mocks/ClientUser.service.mocks';
import {
    searchBusinessUnits,
    getClientMock
} from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Clients UserTable', () => {
    beforeEach(() => {
        searchBusinessUnits();
        getClientMock();
        searchUserMock();
        searchProvincesMock();
        searchCountriesMock();
        getSettingsMock();
        searchLanguagesMock();
    });

    it('component renders correctly', async () => {
        updateAbility([
            'view client users',
            'create client users',
            'update client users',
            'delete client users'
        ]);
        const wrapper = mount(UserTable, {
            props: {
                entity: 'client',
                id: '1'
            }
        });
        const addNewButton = wrapper.findByTestId('add-new-user-button');
        expect(wrapper.findComponent({ name: 'Search' }).exists()).toBe(true);
      const searchWrapper = wrapper.findByTestId('search-input');
expect(searchWrapper.find('input').exists()).toBe(true);
expect(searchWrapper.find('input').attributes('placeholder')).toBe(
    'Search'
);
        expect(addNewButton.text()).toBe('New User');
        expect(wrapper.findByTestId('bulk-actions-button').exists()).toBe(true);

        const columnTitles = wrapper.findAll('th');

        expect(columnTitles).toHaveLength(6);
        expect(columnTitles[1].text()).toBe('Name');
        expect(columnTitles[2].text()).toBe('User Role');
        expect(columnTitles[3].text()).toBe('Status');
        expect(columnTitles[4].text()).toBe('Last Login');

        expect(
            wrapper
                .find('div.p-datatable-mask.p-overlay-mask')
                .text()
        ).toBe('Loading users. Please wait.');
        expect(wrapper.find('.p-datatable-empty-message').text()).toBe(
            'No users found.'
        );

        expect(
            wrapper.findAllComponents({ name: 'Confirmation' })
        ).toHaveLength(4);
    });
});
