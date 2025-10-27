import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NonInsuranceProductIndexView from '@/modules/plans/views/non-insurance-product/index.vue';

describe('NonInsuranceProductIndexView - Simple Mount Test', () => {
    it('should mount the component without crashing', () => {
        const wrapper = mount(NonInsuranceProductIndexView, {
            global: {
                stubs: {
                    NonInsuranceProductable: true,
                    Button: true,
                    RouterLink: true
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        // If mount() fails, this test will fail.
        expect(wrapper.exists()).toBe(true);
    });
});
