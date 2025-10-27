import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CartListView from '@/modules/policies/views/carts/index.vue';

describe('Carts', () => {
    it('renders correctly', async () => {
        const wrapper = mount(CartListView);

        expect(wrapper.findByTestId('page-title').text()).toBe('Carts');

        expect(wrapper.findByTestId('total_cart_num').exists()).toBe(true);
        expect(wrapper.findByTestId('num_of_items').exists()).toBe(true);
        expect(wrapper.findByTestId('total_amount').exists()).toBe(true);
        expect(wrapper.findByTestId('carts_table').exists()).toBe(true);
    });
});
