import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SubmissionDetailsCard from '@/modules/claims/components/submissions/SubmissionDetailsCard.vue';
import { useClaimNoteStoreMock } from '@/modules/claims/tests/mocks/ClaimNote.service.mock';

vi.mock('@/modules/claims/stores/ClaimNote', () => ({
    useClaimNoteStore: vi.fn(() => useClaimNoteStoreMock())
}));

beforeAll(() => {
    window.ResizeObserver = class {
        constructor(callback) {
            this.callback = callback
        }
        observe() {}
        unobserve() {}
        disconnect() {}
    }
});


// Mock the currentSubmission value on submissionStore
const submissionStoreMock = {
    currentSubmission: {
        id: '1734033061661887632',
        ref_number: 'kmq60znqy',
        claim: [],
        policy: {
            id: '1734029938738548111',
            number: '1520000',
            holder: 'test test'
        },
        status: 'review',
        source: 'hive_email',
        expenses: [
            {
                id: '1734033061664459216',
                status: 'approved',
                submission_id: '1734033061661887632',
                amount_claimed: '230.00',
                amount_approved: '0.00',
                created_at: '2024-12-12T19:51:01.000000Z',
                updated_at: '2024-12-12T19:51:01.000000Z'
            },
            {
                id: '1734033061665174299',
                status: 'review',
                submission_id: '1734033061661887632',
                amount_claimed: '230.00',
                amount_approved: '0.00',
                created_at: '2024-12-12T19:51:01.000000Z',
                updated_at: '2024-12-12T19:51:01.000000Z'
            },
            {
                id: '1734033061666565307',
                status: 'review',
                submission_id: '1734033061661887632',
                amount_claimed: '230.00',
                amount_approved: '0.00',
                created_at: '2024-12-12T19:51:01.000000Z',
                updated_at: '2024-12-12T19:51:01.000000Z'
            }
        ],
        attachments: [],
        created_at: '2024-12-12T19:51:01.000000Z',
        updated_at: '2024-12-12T19:51:01.000000Z'
    }
};

vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: vi.fn(() => submissionStoreMock)
}));

describe('SubmissionDetailsCard', () => {
    // beforeEach(() => {
    //     getSubmissionMock();
    //     getExpensesMock();
    // });

    it('component renders correctly', async () => {
        const wrapper = mount(SubmissionDetailsCard, {
            props: {
                clientId: '1734033061661887632'
            }
        });

        expect(wrapper.findByTestId('btn-toggle-expenses-table').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('text-submission-number').text()).toBe(
            'Submission ID kmq60znqy'
        );

        // !TEST: Submission status tag
        expect(wrapper.findComponent({ name: 'ClaimStatusTag' }).exists()).toBe(
            true
        );
        // !TEST: Submission High Priority tag
        expect(wrapper.findComponent({ name: 'ClaimStatusTag' }).exists()).toBe(
            true
        );

        expect(
            wrapper.findByTestId('text-submission-receiveDate-source').text()
        ).toBe('Received On Dec 12, 2024 via Hive email');

        const tabviewTitles = wrapper.findAll('.p-tab');
        expect(tabviewTitles).toHaveLength(3);
        expect(tabviewTitles[0].text()).toBe('Expenses');
        expect(tabviewTitles[1].text()).toBe('Activities');
        expect(tabviewTitles[2].text()).toBe('Log');
    });
});
