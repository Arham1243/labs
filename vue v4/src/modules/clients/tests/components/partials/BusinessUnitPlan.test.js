import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BusinessUnitPlan from '@/modules/clients/components/partials/BusinessUnitPlan.vue';

describe('BusinessUnitPlan', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(BusinessUnitPlan, {
            props: {
                plan: {
                    associated_plans: [],
                    bound: 'out',
                    type: 'domestic',
                    effective_date: new Date(
                        Date.now() + 86400000
                    ).toISOString()
                }
            }
        });

        expect(wrapper.findByTestId('name-title').exists()).toBe(true);

        expect(wrapper.findByTestId('status-tag').exists()).toBe(true);
        expect(wrapper.findByTestId('not-started-status-tag').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('actions-button').text()).toBe('Actions');
        expect(wrapper.findComponent({ name: 'Menu' }).exists()).toBe(true);

        expect(wrapper.findByTestId('plan-details-label').exists()).toBe(true);
        expect(wrapper.findByTestId('effective-date-label').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('view-associated-plans-label').text()).toBe(
            'View Associated Plans (0)'
        );
        expect(
            wrapper.findByTestId('create-associated-plan-button').text()
        ).toBe('Create Associated Plan');

        expect(
            wrapper.findAllComponents({ name: 'Confirmation' })
        ).toHaveLength(2);
    });
});
