import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ClaimDetailsCard from '@/modules/claims/components/claims/ClaimDetailsCard.vue';
import {
    useClaimStoreMock,
    currentClaimMock,
    userMock
} from '@/modules/claims/tests/mocks/Claim.service.mock';

vi.mock('@/modules/claims/stores/Claim', () => ({
    useClaimStore: vi.fn(() => useClaimStoreMock())
}));

describe('ClaimDetailsCard', () => {
    let wrapper;

    beforeEach(() => {
        vi.useFakeTimers();
        wrapper = mount(ClaimDetailsCard, {
            props: {
                clientId: currentClaimMock.submissions[0].client_id,
                claimId: currentClaimMock.id
            },
            global: {
                provide: {
                    currentUser: userMock
                }
            }
        });
    });

    afterEach(async () => {
        // Run all pending timers before cleanup
        vi.runAllTimers();
        await flushPromises();

        // Unmount component
        if (wrapper) {
            wrapper.unmount();
        }

        // Restore real timers
        vi.useRealTimers();
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('text-claim-number').exists()).toBe(true);
        expect(wrapper.findByTestId('btn-toggle-claim-table').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-claim-number').text()).toBe(
            `${currentClaimMock.ref_number}`
        );
        const tabviewTitles = wrapper.findAll('.p-tab');
        expect(tabviewTitles.length).toBeGreaterThan(2);
        expect(tabviewTitles[0].text()).toBe('Submissions');
        expect(tabviewTitles[1].text()).toBe('Activities');
        expect(tabviewTitles[2].text()).toBe('Log');
    });

    //  Components

    it('component renders ClaimStatusTag', () => {
        const ClaimStatusTag = wrapper.findComponent({
            name: 'ClaimStatusTag'
        });
        expect(ClaimStatusTag.exists()).toBe(true);
    });

    it('component renders SubmissionClaimTable', async () => {
        wrapper.vm.showTable = true;
        wrapper.vm.activeTab = 0;
        await wrapper.vm.$nextTick();

        const SubmissionClaimTable = wrapper.findComponent({
            name: 'SubmissionClaimTable'
        });
        expect(SubmissionClaimTable.exists()).toBe(true);
    });

    it('component renders ReservedAmountDialog', () => {
        const ReservedAmountDialog = wrapper.findComponent({
            name: 'ReservedAmountDialog'
        });
        expect(ReservedAmountDialog.exists()).toBe(true);
    });

    it('component renders ClaimMeterReservedAmount', () => {
        const ClaimMeterReservedAmount = wrapper.findComponent({
            name: 'ClaimMeterReservedAmount'
        });
        expect(ClaimMeterReservedAmount.exists()).toBe(true);
    });
});
