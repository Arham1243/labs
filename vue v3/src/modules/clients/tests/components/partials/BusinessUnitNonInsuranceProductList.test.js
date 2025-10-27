import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BusinessUnitNonInsuranceProductList from '@/modules/clients/components/partials/BusinessUnitNonInsuranceProductList.vue';

describe('BusinessUnitNonInsuranceProductList', () => {
    beforeEach(() => {
        vi.mock('@/modules/clients/stores', () => ({
            useClientStore: () => ({
                currentBusinessUnit: {
                    non_insurance_products: [
                        {
                            id: 1,
                            name: 'non-insurance-product 1',
                            status: 'active'
                        },
                        {
                            id: 2,
                            name: 'non-insurance-product 2',
                            status: 'active'
                        }
                    ]
                }
            })
        }));
    });

    it('component renders correctly', async () => {
        const wrapper = mount(BusinessUnitNonInsuranceProductList);

        await wrapper.vm.$nextTick();

        expect(
            wrapper.findAllComponents({
                name: 'BusinessUnitNonInsuranceProduct'
            })
        ).toHaveLength(2);
    });
});
