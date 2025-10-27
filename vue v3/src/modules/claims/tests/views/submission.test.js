import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, shallowMount } from '@vue/test-utils';
import SubmissionDetailsView from '@/modules/claims/views/submission.vue';
import { getSubmissionMock } from '@/modules/claims/tests/mocks/Submission.service.mock';
import {
    getBusinessUnitMock,
    getInsuredMock,
    getPolicyBatchMock,
    getPolicyMock
} from '@/modules/claims/tests/mocks/General.service.mock';

// Mock route + router
vi.mock('vue-router', () => ({
    useRoute: vi.fn(() => ({
        params: {
            clientId: 'client_123',
            submissionId: 'submission_456'
        }
    })),
    useRouter: vi.fn(() => ({
        push: vi.fn()
    }))
}));

// Mock store
vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: vi.fn(() => ({
        getSubmissionById: vi.fn(() => ({
            loading: false
        }))
    }))
}));

// Mock components
vi.mock(
    '@/modules/claims/components/shared/details/DetailsViewHeader.vue',
    () => ({
        default: { name: 'DetailsViewHeader', template: '<div></div>' }
    })
);
vi.mock(
    '@/modules/claims/components/shared/details/DetailsViewHeaderActions.vue',
    () => ({
        default: { name: 'DetailsViewHeaderActions', template: '<div></div>' }
    })
);
vi.mock(
    '@/modules/claims/components/submissions/SubmissionDetailsCard.vue',
    () => ({
        default: { name: 'SubmissionDetailsCard', template: '<div></div>' }
    })
);
vi.mock(
    '@/modules/claims/components/shared/InsuredClaimHistoryCard.vue',
    () => ({
        default: { name: 'InsuredClaimHistoryCard', template: '<div></div>' }
    })
);

describe('Submission Details view', () => {
    getInsuredMock();
    getPolicyMock();
    getPolicyBatchMock();
    getBusinessUnitMock();

    beforeEach(() => {
        getSubmissionMock();
    });

    it('renders correctly', async () => {
        const wrapper = shallowMount(SubmissionDetailsView);

        await flushPromises();

        expect(
            wrapper.findComponent({ name: 'SubmissionDetailsCard' }).exists()
        ).toBe(true);
        expect(
            wrapper.findComponent({ name: 'InsuredClaimHistoryCard' }).exists()
        ).toBe(true);
    });
});
