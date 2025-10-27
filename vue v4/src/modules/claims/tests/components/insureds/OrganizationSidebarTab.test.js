import { describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import OrganizationSidebarTab from '@/modules/claims/components/insureds/OrganizationSidebarTab.vue';
import { useClaimPolicyStoreMock } from '@/modules/claims/tests/mocks/Policy.service.mock';
import { useGeneralStoreMock } from '@/modules/claims/tests/mocks/General.service.mock';

vi.mock('@/modules/claims/stores/Policy', () => ({
    useClaimPolicyStore: vi.fn(() => useClaimPolicyStoreMock())
}));

vi.mock('@/modules/claims/stores/General', () => ({
    useGeneralStore: vi.fn(() => useGeneralStoreMock())
}));

describe('OrganizationSidebarTab', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(OrganizationSidebarTab, {});

        await flushPromises();

        // ! TEST if organization school details div are rendered correctly
        expect(wrapper.findByTestId('label-school-details').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('label-organization-name').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-organization-name').text()).toBe(
            'Cape Brenton University'
        );

        expect(
            wrapper.findByTestId('label-organization-department').exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('text-organization-department').text()
        ).toBe('Cape Brenton University');

        expect(wrapper.findByTestId('label-organization-phone').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-organization-phone').text()).toBe(
            '+1 (416) 123 - 4567'
        );

        expect(wrapper.findByTestId('label-organization-fax').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-organization-fax').text()).toBe('-');

        expect(wrapper.findByTestId('label-organization-email').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-organization-email').text()).toBe(
            'teswtets@test.com'
        );

        // ! TEST if organization address div are rendered correctly
        expect(
            wrapper.findByTestId('label-organization-current-address').exists()
        ).toBe(true);

        expect(
            wrapper.findByTestId('label-organization-address').exists()
        ).toBe(true);
        expect(wrapper.findByTestId('text-organization-address').text()).toBe(
            '4 Chatworn St'
        );

        expect(
            wrapper.findByTestId('label-organization-address-2').exists()
        ).toBe(true);
        expect(wrapper.findByTestId('text-organization-address-2').text()).toBe(
            '-'
        );

        expect(wrapper.findByTestId('label-organization-city').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-organization-city').text()).toBe(
            'Markham'
        );

        expect(
            wrapper.findByTestId('label-organization-postal-code').exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('text-organization-postal-code').text()
        ).toBe('L1E 2L3');
    });
});
