import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BusinessUnitNonInsuranceProduct from '@/modules/clients/components/partials/BusinessUnitNonInsuranceProduct.vue';

describe('BusinessUnitNonInsuranceProduct', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(BusinessUnitNonInsuranceProduct, {
            props: {
                nonInsuranceProduct: {
                    id: 1,
                    name: 'non-insurance-product 1',
                    status: 'active'
                }
            }
        });

        expect(wrapper.findByTestId('name-title').exists()).toBe(true);
        expect(wrapper.findComponent({ name: 'Tag' }).exists()).toBe(true);
        expect(wrapper.findComponent({ name: 'StatusTag' }).exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('actions-button').text()).toBe('Actions');
        expect(
            wrapper.findAllComponents({ name: 'Confirmation' })
        ).toHaveLength(2);
    });
});
