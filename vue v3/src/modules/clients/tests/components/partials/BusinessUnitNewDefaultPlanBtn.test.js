import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BusinessUnitNewDefaultPlanBtn from '@/modules/clients/components/partials/BusinessUnitNewDefaultPlanBtn.vue';

describe('BusinessUnitNewDefaultPlanBtn', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(BusinessUnitNewDefaultPlanBtn, {
            props: {
                id: 'a',
                clientId: 'b'
            }
        });

        // wrapper.findByTestId does not work in this case since the component being tested only contains a simple button.
        // It works when the button is wrapped in a div or any arbitrary element. This is because of how the findByTestId plugin works (in setup.js).
        expect(
            wrapper.find('[data-testid="new-default-plan-button"]').text()
        ).toBe('New Default Plan');
    });
});
