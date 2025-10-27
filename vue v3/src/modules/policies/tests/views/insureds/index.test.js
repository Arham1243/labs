import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import InsuredListView from '@/modules/policies/views/insureds/index.vue';

describe('Insured Overview', () => {
    it('renders correctly', async () => {
        const wrapper = mount(InsuredListView);

        expect(wrapper.findByTestId('page-title').text()).toBe(
            'Insured Overview'
        );

        expect(wrapper.findByTestId('new-policy-button').text()).toBe(
            'Order Policies'
        );
    });
});
