import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import PolicySidebarTab from '@/modules/claims/components/insureds/PolicySidebarTab.vue';
import { useGeneralStoreMock } from '@/modules/claims/tests/mocks/General.service.mock';

vi.mock('@/modules/claims/stores/General', () => ({
    useGeneralStore: vi.fn(() => useGeneralStoreMock())
}));

describe('PolicySidebarTab', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(PolicySidebarTab, {
            props: {
                policies: [
                    {
                        policy_number: '1520000',
                        start_date: '2024-12-01',
                        end_date: '2024-12-31',
                        duration: 30,
                        status: 'active'
                    }
                ]
            }
        });

        // * Get the policy items
        const policyItems = wrapper.findAll('.policy-items');

        // ! TEST the number of policy items
        expect(policyItems).toHaveLength(1);

        // ! TEST the first policy item
        expect(policyItems[0].findComponent({ name: 'Menu' }).exists()).toBe(
            true
        );
        expect(
            policyItems[0].findComponent({ name: 'ClaimStatusTag' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('text-policy-title-0').text()).toBe(
            'GuardMe Policy'
        );
        expect(wrapper.findByTestId('text-policy-date-0').text()).toBe(
            '01-Dec-2024 - 31-Dec-2024'
        );
        expect(wrapper.findByTestId('text-policy-terms-0').text()).toBe(
            'Policy Term: 30 days'
        );
    });
});
