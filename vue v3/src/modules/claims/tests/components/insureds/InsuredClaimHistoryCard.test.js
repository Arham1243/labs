import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InsuredClaimHistoryCard from '@/modules/claims/components/shared/InsuredClaimHistoryCard.vue';
import {
    currentClaimMock,
    getClaimsMock
} from '@/modules/claims/tests/mocks/Claim.service.mock';
import { mountUserMock } from '@/modules/claims/tests/mocks/User.mock';
import * as ClaimService from '@/modules/claims/services/Claim.service.js';
import * as SubmissionService from '@/modules/claims/services/Submission.service.js';

// Mock route
vi.mock('vue-router', () => ({
    useRoute: vi.fn(() => ({
        params: { clientId: '123456789' }
    })),
    useRouter: vi.fn(() => ({
        push: vi.fn(),
        replace: vi.fn()
    }))
}));

// Mock stores
vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: vi.fn(() => ({
        currentSubmission: {
            id: '1734033061661887632',
            insured: { id: 'insured_1' },
            claim_id: '',
            expenses: [],
            attachments: []
        },
        moveSubmissionToClaim: vi
            .spyOn(SubmissionService, 'moveSubmissionToClaim')
            .mockResolvedValue({
                loading: false,
                status: 'success',
                mutate: vi.fn()
            }),
        searchSubmissions: vi
            .spyOn(SubmissionService, 'searchSubmissions')
            .mockResolvedValue({
                data: [],
                loading: false,
                status: 'success',
                mutate: vi.fn()
            })
    }))
}));

vi.mock('@/modules/claims/stores/Claim', () => ({
    useClaimStore: vi.fn(() => ({
        currentClaim: { value: null },
        createClaim: vi.spyOn(ClaimService, 'createClaim').mockResolvedValue({
            data: currentClaimMock,
            loading: false,
            status: 'success',
            mutate: vi.fn()
        }),
        moveSubmissionsToClaim: vi
            .spyOn(ClaimService, 'moveSubmissionsToClaim')
            .mockResolvedValue({
                data: currentClaimMock,
                loading: false,
                status: 'success',
                mutate: vi.fn()
            })
    }))
}));

vi.mock('@/modules/claims/stores/Insured', () => ({
    useClaimInsuredStore: vi.fn(() => ({
        currentInsured: { value: null },
        getInsuredById: vi.fn()
    }))
}));

describe('InsuredClaimHistoryCard', () => {
    let wrapper;

    beforeEach(() => {
        getClaimsMock();
        wrapper = mount(InsuredClaimHistoryCard, {
            ...mountUserMock
        });
    });

    it('renders correctly', () => {
        expect(
            wrapper.find('[data-testid="btn-toggle-expenses-table"]').exists()
        ).toBe(true);
        expect(
            wrapper.find('[data-testid="text-submission-number"]').text()
        ).toBe('Insured Claim History');
    });
});
