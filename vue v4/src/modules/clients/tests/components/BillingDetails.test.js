import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import BillingDetails from '@/modules/clients/components/BillingDetails.vue';
import { ref } from 'vue';

vi.mock('@/modules/clients/composables/useEditState', () => ({
    useEditState: () => ({
        activeEditComponent: ref(null),
        showUnsavedDialog: ref(false),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn(),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        registerCancelCallback: vi.fn(),
        unregisterCancelCallback: vi.fn()
    })
}));

describe('BillingDetails', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(BillingDetails, {
            props: {
                data: {}
            }
        });

        expect(wrapper.findByTestId('billing-details-title').text()).toBe(
            'Billing Details'
        );

        expect(wrapper.findByTestId('enrollment-types-label').text()).toBe(
            'Enrolment Types:'
        );
        expect(wrapper.findByTestId('payment-type-label').text()).toBe(
            'Payment Type:'
        );
        expect(wrapper.findByTestId('payment-method-label').text()).toBe(
            'Payment Methods:'
        );
        expect(wrapper.findByTestId('invoice-frequency-label').text()).toBe(
            'Invoice Frequency:'
        );
        expect(wrapper.findByTestId('payment-terms-label').text()).toBe(
            'Payment Terms:'
        );
        expect(
            wrapper.findByTestId('preferred-invoice-name-label').text()
        ).toBe('Preferred Invoice Name:');
        expect(wrapper.findByTestId('quickbooks-id-label').text()).toBe(
            'Quickbooks ID:'
        );

        expect(wrapper.findByTestId('edit-button').text()).toBe('Edit');

        expect(wrapper.findByTestId('billing-address-title').text()).toBe(
            'Billing Address'
        );

        expect(wrapper.findByTestId('address-label').text()).toBe('Address:');
        expect(wrapper.findByTestId('address2-label').text()).toBe(
            'Address 2:'
        );
        expect(wrapper.findByTestId('country-label').text()).toBe('Country:');
        expect(wrapper.findByTestId('city-label').text()).toBe('City:');
        expect(wrapper.findByTestId('postal-code-label').text()).toBe(
            'Postal/Zip Code:'
        );
    });
});
