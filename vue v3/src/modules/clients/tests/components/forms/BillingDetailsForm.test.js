import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BillingDetailsForm from '@/modules/clients/components/forms/BillingDetailsForm.vue';

describe('BillingDetailsForm', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(BillingDetailsForm, {
            props: {
                modelValue: {}
            }
        });

        expect(wrapper.findByTestId('enrollment-types-label').text()).toBe(
            'Enrolment Types *'
        );
        expect(wrapper.findByTestId('enrollment-types-label').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('payment-type-label').text()).toBe(
            'Payment Type *'
        );
        expect(wrapper.findByTestId('payment-type-dropdown').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('payment-method-label').text()).toBe(
            'Payment Methods *'
        );
        expect(wrapper.findByTestId('payment-method-dropdown').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('invoice-frequency-label').text()).toBe(
            'Invoice Frequency *'
        );
        expect(
            wrapper.findByTestId('invoice-frequency-dropdown').exists()
        ).toBe(true);
        expect(
            wrapper
                .find('[data-testid="invoice-frequency-dropdown"]>span')
                .text()
        ).toBe('Select');

        expect(wrapper.findByTestId('payment-terms-label').text()).toBe(
            'Payment Terms *'
        );
        expect(wrapper.findByTestId('payment-terms-dropdown').exists()).toBe(
            true
        );
        expect(
            wrapper.find('[data-testid="payment-terms-dropdown"]>span').text()
        ).toBe('Select');

        expect(
            wrapper.findByTestId('preferred-invoice-name-label').text()
        ).toBe('Preferred Invoice Name');
        expect(
            wrapper.findByTestId('preferred-invoice-name-input').exists()
        ).toBe(true);

        expect(wrapper.findByTestId('quickbooks-id-label').text()).toBe(
            'Quickbooks ID'
        );
        expect(wrapper.findByTestId('quickbooks-id-input').exists()).toBe(true);
    });
});
