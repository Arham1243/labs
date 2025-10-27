import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExpenseHeader from '@/modules/claims/components/expenses/ExpenseHeader.vue';

// Mock Submission store
const submissionStoreMock = {
    currentSubmission: {
        id: '1734033061661887632',
        ref_number: 'kmq60znqy',
        claim_id: '',
        policy: {
            id: '1734029938738548111',
            number: '1520000',
            holder: 'test test'
        },
        insured: [],
        provider: [],
        status: 'review',
        source: 'hive_email',
        examiner: [],
        running_total: '700.00',
        expense_total: '750.00'
    }
};

vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: vi.fn(() => submissionStoreMock)
}));

// Mock i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (key) => key })
}));

describe('ExpenseHeader.vue', () => {
    it('renders correctly and interacts with menus', async () => {
        const wrapper = mount(ExpenseHeader, {
            props: {
                expenseId: '123456',
                clientId: '987654'
            }
        });

        // Mock Menu refs to avoid toggle() error
        wrapper.vm.policyMenu = { toggle: vi.fn() };
        wrapper.vm.submissionMenu = { toggle: vi.fn() };

        // Check main elements exist
        expect(wrapper.findByTestId('btn-go-back-to-submission').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-submission-id').text()).toBe(
            'submissions.submission_id kmq60znqy'
        );
        expect(wrapper.findByTestId('tag-submission-status').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('text-insured-name').text()).toContain(
            'test test • Policy #'
        );

        // Check buttons
        expect(
            wrapper.findByTestId('btn-open-claim-history-dialog').exists()
        ).toBe(true);
        expect(wrapper.findByTestId('link-open-policy-dropdown').exists()).toBe(
            true
        );

        // Test showMenu function for policy
        await wrapper.vm.showMenu('policy', { some: 'event' });
        expect(wrapper.vm.policyMenu.toggle).toHaveBeenCalled();

        // Test showMenu function for submission
        await wrapper.vm.showMenu('submission', { some: 'event' });
        expect(wrapper.vm.submissionMenu.toggle).toHaveBeenCalled();
    });
});
