import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DependentDetails from '@/modules/policies/components/insureds/DependentDetails.vue';

describe('Insured Dependent Beneficiary Details', () => {
    it('renders correctly', async () => {
        const wrapper = mount(DependentDetails);

        expect(wrapper.find('h5').text()).toBe('Dependant Details');
    });
});
