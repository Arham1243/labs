import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NonInsuranceProductView from '@/modules/plans/views/non-insurance-product/index.vue';

describe('Non-Insurance Product index View', () => {
    it('renders correctly', () => {
        const wrapper = mount(NonInsuranceProductView, {
            global: {
                mocks: {
                    $t: (msg) => msg
                },
                stubs: {
                    NonInsuranceProductTable: true
                }
            }
        });

        const button = wrapper.find(
            '[data-testid="add-new-non-insurance-product-button"]'
        );
        expect(button.exists()).toBe(true);
        expect(button.text()).toBe('non_insurance_products.create_btn_label');
    });
});
