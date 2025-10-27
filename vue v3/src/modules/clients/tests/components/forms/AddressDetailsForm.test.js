import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AddressDetailsForm from '@/modules/clients/components/forms/AddressDetailsForm.vue';
import { searchCountriesMock } from '@/../tests/mocks/Common.service.mocks';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Province.service.mocks';

describe('AddressDetailsForm', () => {
    beforeEach(() => {
        searchCountriesMock();
        searchItemsMock();
    });

    it('component renders correctly', async () => {
        const wrapper = mount(AddressDetailsForm, {
            props: {
                modelValue: {}
            }
        });

        expect(wrapper.findByTestId('address-label').text()).toBe('Address');
        expect(wrapper.findByTestId('address-input').exists()).toBe(true);

        expect(wrapper.findByTestId('address2-label').text()).toBe('Address 2');
        expect(wrapper.findByTestId('address2-input').exists()).toBe(true);

        expect(wrapper.findByTestId('country-label').text()).toBe('Country');
        expect(wrapper.findByTestId('country-input').exists()).toBe(true);
        expect(wrapper.find('[data-testid="country-input"]>span').text()).toBe(
            'Select'
        );

        expect(wrapper.findByTestId('city-label').text()).toBe('City');
        expect(wrapper.findByTestId('city-input').exists()).toBe(true);

        expect(wrapper.findByTestId('postal-code-label').text()).toBe(
            'Postal/Zip Code'
        );
        expect(wrapper.findByTestId('postal-code-input').exists()).toBe(true);

        expect(wrapper.findByTestId('province-state-input').exists()).toBe(
            true
        );
    });
});
