import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BusinessUnitPlans from '@/modules/clients/components/BusinessUnitPlans.vue';
import { searchPlanByBusinessUnitUuidsMock } from '@/modules/plans/tests/mocks/Plan.service.mocks';

describe('BusinessUnitPlans', () => {
    beforeEach(() => {
        searchPlanByBusinessUnitUuidsMock();
    });

    it('component renders correctly', async () => {
        const wrapper = mount(BusinessUnitPlans, {
            props: {
                id: '0cc73a81-c7b4-4319-b79d-0a8efee37c1c',
                clientId: '0cc73a81-c7b4-4319-b79d-0a8efee37c1c'
            }
        });

        expect(
            wrapper.findComponent({ name: 'BusinessUnitPlanList' }).exists()
        ).toBe(true);
        expect(
            wrapper
                .findComponent({ name: 'BusinessUnitNonInsuranceProductList' })
                .exists()
        ).toBe(true);
        expect(
            wrapper
                .findComponent({ name: 'BusinessUnitNewDefaultPlanBtn' })
                .exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('add-non-insurance-product-button').exists()
        ).toBe(true);
    });
});
