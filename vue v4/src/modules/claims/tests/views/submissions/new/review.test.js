import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ReviewView from '@/modules/claims/views/submissions/new/review.vue';
import {
    currentInsuredMock,
    useClaimInsuredStoreMock
} from '@/modules/claims/tests/mocks/Insured.service.mock';
import { useClaimPolicyStoreMock } from '@/modules/claims/tests/mocks/Policy.service.mock';
import { useGeneralStoreMock } from '@/modules/claims/tests/mocks/General.service.mock';
import { useSubmissionStoreMock } from '@/modules/claims/tests/mocks/Submission.service.mock';

vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: vi.fn(() => ({ ...useSubmissionStoreMock() }))
}));

vi.mock('@/modules/claims/stores/Insured', () => ({
    useClaimInsuredStore: vi.fn(() => ({ ...useClaimInsuredStoreMock() }))
}));

vi.mock('@/modules/claims/stores/Policy', () => ({
    useClaimPolicyStore: vi.fn(() => ({ ...useClaimPolicyStoreMock() }))
}));

vi.mock('@/modules/claims/stores/General', () => ({
    useGeneralStore: vi.fn(() => ({ ...useGeneralStoreMock() }))
}));

describe('ReviewClaimView', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(ReviewView, {
            global: {
                provide: {}
            }
        });
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('text-step').text()).toBe(
            'Review Your Claim'
        );
        expect(wrapper.findByTestId('text-policy-value-name').text()).toBe(
            `${currentInsuredMock.first_name} ${currentInsuredMock.last_name}`
        );
        expect(wrapper.findByTestId('text-policy-value-email').text()).toBe(
            `${currentInsuredMock.email}`
        );

        expect(wrapper.findByTestId('text-title-claim-info').text()).toBe(
            'Claim Information'
        );
        expect(wrapper.findByTestId('text-title-payee').text()).toBe(
            'Payment Information'
        );
    });
});
