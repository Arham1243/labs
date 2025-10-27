import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ClaimsOverview from '@/modules/policies/components/insureds/ClaimsOverview.vue';

describe('Insured Claims Overview', () => {
    it('renders correctly', async () => {
        const wrapper = mount(ClaimsOverview);

        expect(wrapper.findByTestId('tab-claims').exists()).toBe(true);
        expect(wrapper.findByTestId('tab-submissions').exists()).toBe(true);
    });
});
