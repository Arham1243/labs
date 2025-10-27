import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import PolicyView from '@/modules/policies/views/policy/index.vue';

describe('Policies > Policy Details', () => {
    it('page renders correctly', async () => {
        const wrapper = mount(PolicyView);

        wrapper.vm.loading = false;
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button').exists()).toBe(true);
        expect(wrapper.findByTestId('policy-user-name').exists()).toBe(true);
        expect(wrapper.findComponent({ name: 'TabView' }).exists()).toBe(true);
    });
});
