import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ClaimDetailsCard from '@/modules/claims/components/claims/ClaimDetailsCard.vue';
import {
    useClaimStoreMock,
    currentClaimMock,
    userMock
} from '@/modules/claims/tests/mocks/Claim.service.mock';

// Correct the mock to return expected structure
vi.mock('@/modules/claims/stores/Claim', () => ({
    useClaimStore: vi.fn(() => useClaimStoreMock())
}));

describe('ClaimDetailsCard', () => {
    let wrapper;

    beforeEach(() => {
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

        // console.log(wrapper.html());
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('text-claim-number').exists()).toBe(true);
        expect(wrapper.findByTestId('btn-toggle-claim-table').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-claim-number').text()).toBe(
            `${currentClaimMock.ref_number}`
        );

        const tabviewTitles = wrapper.findAll('.p-tabview-header');
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

    it('component renders SubmissionClaimTable', () => {
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
