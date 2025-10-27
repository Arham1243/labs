import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import AddNonInsuranceProduct from '@/modules/clients/components/dialogs/AddNonInsuranceProduct.vue';

describe('AddNonInsuranceProduct', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(AddNonInsuranceProduct, {
            props: {
                modelValue: true
            }
        });

        expect(wrapper.findComponent({ name: 'Dialog' }).exists()).toBe(true);
    });
});
