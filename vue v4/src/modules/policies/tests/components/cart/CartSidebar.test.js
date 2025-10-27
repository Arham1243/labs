import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import CartSidebar from '@/modules/policies/components/cart/CartSidebar.vue';

describe('Cart side bar', () => {
    it('renders correctly default', async () => {
        const wrapper = mount(CartSidebar, {
            global: {
                stubs: {
                    Drawer: {
                        template:
                            '<div><slot name="header"></slot><slot /><slot name="footer"></slot></div>',
                        props: []
                    }
                }
            }
        });

        expect(wrapper.findByTestId('cart-sidebar-title').text()).toBe('Cart');
        expect(wrapper.findByTestId('cart-sidebar-list-panel').exists()).toBe(
            true
        );
    });
});
