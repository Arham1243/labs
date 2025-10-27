import { mount } from '@vue/test-utils';
import OrderPoliciesDialog from '@/modules/policies/components/dialogs/OrderPoliciesDialog.vue';

describe('OrderPoliciesDialog - Rendering Tests', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(OrderPoliciesDialog, {
            props: {
                modelValue: true
            }
        });
    });

    it('renders the dialog and sets the visible prop correctly', () => {
        expect(wrapper.vm.dialog).toBe(true);
    });
});
