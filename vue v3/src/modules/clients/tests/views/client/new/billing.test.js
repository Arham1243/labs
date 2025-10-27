import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import Billing from '@/modules/clients/views/client/new/billing.vue';
import { getClientMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { searchCountriesMock } from '@/../tests/mocks/Common.service.mocks';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Province.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Billing', () => {
    beforeEach(() => {
        getClientMock();
        searchCountriesMock();
        searchItemsMock();

        updateAbility(['update clients']);
    });

    it('page renders correctly', async () => {
        const wrapper = mount(Billing, {
            props: {
                id: '0cc73a81-c7b4-4319-b79d-0a8efee37c1c'
            }
        });

        // Billing Details
        expect(wrapper.findByTestId('billing-details-title').text()).toBe(
            'Billing Details'
        );
        expect(
            wrapper.findComponent({ name: 'BillingDetailsForm' }).exists()
        ).toBe(true);

        // Billing Address
        expect(wrapper.findByTestId('billing-address-title').text()).toBe(
            'Billing Address'
        );
        expect(
            wrapper.findComponent({ name: 'AddressDetailsForm' }).exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('same-as-mailing-address-checkbox').exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('same-as-mailing-address-label').text()
        ).toBe('Same as Mailing Address');

        // Buttons
        expect(wrapper.findByTestId('button-back').text()).toBe('Back');
        expect(wrapper.findByTestId('button-save-continue').text()).toBe(
            'Save & Continue'
        );
    });
});
