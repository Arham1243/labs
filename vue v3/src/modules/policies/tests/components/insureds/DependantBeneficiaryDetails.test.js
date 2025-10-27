import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DependentBeneficiaryDetails from '@/modules/policies/components/insureds/DependentBeneficiaryDetails.vue';

describe('Insured Dependent Beneficiary Details', () => {
    it('renders correctly', async () => {
        const wrapper = mount(DependentBeneficiaryDetails);

        expect(wrapper.find('h5').text()).toBe('Beneficiary Details');
    });
});
