import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BeneficiaryDetails from '@/modules/policies/components/insureds/BeneficiaryDetails.vue';

describe('Insured Add Dependent Dialog', () => {
    it('renders correctly default', async () => {
        const wrapper = mount(BeneficiaryDetails, {
            props: {
                insured: {
                    id: '10001'
                }
            }
        });

        const type = wrapper.findByTestId('type');
        const fullName = wrapper.findByTestId('full-name-input');
        const phone = wrapper.findByTestId('phone-number-input');
        const pay = wrapper.findByTestId('payment-type-input');

        expect(type.exists()).toBe(true);
        expect(fullName.exists()).toBe(true);
        expect(phone.exists()).toBe(true);
        expect(pay.exists()).toBe(true);
    });
});
