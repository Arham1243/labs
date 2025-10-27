import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DependentAddress from '@/modules/policies/components/insureds/DependentAddress.vue';

describe('Insured Dependent Details', () => {
    it('renders correctly', async () => {
        const wrapper = mount(DependentAddress);

        expect(wrapper.find('h5').text()).toBe('Dependant Address');
    });
});
