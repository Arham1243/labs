import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import InsuredDetails from '@/modules/policies/components/insureds/Details.vue';

describe('Insured Details', () => {
    it('renders correctly', async () => {
        const wrapper = mount(InsuredDetails);

        expect(wrapper.find('h5').text()).toBe('Insured Details');
    });
});
