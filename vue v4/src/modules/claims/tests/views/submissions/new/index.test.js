import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/claims/views/submissions/new/index.vue';
import { useGeneralStoreMock } from '@/modules/claims/tests/mocks/General.service.mock';
import {
    currentPolicyMock,
    useClaimPolicyStoreMock
} from '@/modules/claims/tests/mocks/Policy.service.mock';
import { userMock } from '@/modules/claims/tests/mocks/Claim.service.mock';
import {
    currentInsuredMock,
    useClaimInsuredStoreMock
} from '@/modules/claims/tests/mocks/Insured.service.mock';
import { useSubmissionStoreMock } from '@/modules/claims/tests/mocks/Submission.service.mock';

vi.mock('vue-router', () => ({
    useRoute: vi.fn(() => ({
        query: {
            client_id: '',
            insured_id: currentInsuredMock.id,
            policy_id: currentPolicyMock.id
        }
    })),
    useRouter: vi.fn(() => ({
        push: vi.fn()
    }))
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

vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: vi.fn(() => ({ ...useSubmissionStoreMock() }))
}));

describe('IndexView', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(IndexView, {
            global: {
                provide: {
                    currentUser: { value: userMock }
                }
            }
        });
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('text-policy-number').text()).toBe(
            `Policy Number: ${currentPolicyMock.policy_number}`
        );
        expect(wrapper.findByTestId('btn-back').exists()).toBe(true);
        expect(wrapper.findByTestId('btn-next').exists()).toBe(true);
    });
});
