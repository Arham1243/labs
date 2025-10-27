import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BusinessUnitAssociatedPlan from '@/modules/clients/components/partials/BusinessUnitAssociatedPlan.vue';

describe('BusinessUnitAssociatedPlan', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(BusinessUnitAssociatedPlan, {
            props: {
                plan: { category: 'recent_graduate' },
                id: '0cc73a81-c7b4-4319-b79d-0a8efee37c1c'
            }
        });

        expect(wrapper.findByTestId('category-title').exists()).toBe(true);
        expect(wrapper.findComponent({ name: 'StatusTag' }).exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('actions-button').text()).toBe('Actions');
        expect(wrapper.findComponent({ name: 'Menu' }).exists()).toBe(true);

        expect(wrapper.findByTestId('effective-date-label').exists()).toBe(
            true
        );

        expect(
            wrapper.findAllComponents({ name: 'Confirmation' })
        ).toHaveLength(2);
    });
});
