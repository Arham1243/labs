import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Details from '@/modules/clients/views/business-unit/new/details.vue';
import {
    getBusinessUnitMock,
    getClientMock
} from '@/modules/clients/tests/mocks/Client.service.mocks';
import {
    searchCountriesMock,
    searchLanguagesMock,
    searchCompanyUsersMock
} from '@/../tests/mocks/Common.service.mocks';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Province.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Details', () => {
    beforeEach(() => {
        getClientMock();
        getBusinessUnitMock();
        searchCompanyUsersMock();
        searchCountriesMock();
        searchCountriesMock();
        searchLanguagesMock();
        searchItemsMock();

        updateAbility(['create business units']);
    });

    it('page renders correctly', () => {
        const wrapper = mount(Details, {
            props: {
                id: '-1',
                clientId: '-1'
            }
        });

        // Holding Details
        expect(wrapper.findByTestId('business-unit-details-title').text()).toBe(
            'Business Unit Details'
        );
        expect(
            wrapper.findComponent({ name: 'ClientDetailsForm' }).exists()
        ).toBe(true);

        // Mailing Address
        expect(wrapper.findByTestId('mailing-address-title').text()).toBe(
            'Mailing Address'
        );
        expect(wrapper.findByTestId('same-as-client-input').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('same-as-client-label').text()).toBe(
            'Same as Client'
        );
        expect(
            wrapper.findComponent({ name: 'AddressDetailsForm' }).exists()
        ).toBe(true);

        // Buttons
        expect(wrapper.findByTestId('cancel-button').text()).toBe('Cancel');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );
    });
});
