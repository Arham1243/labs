import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import ExpenseLists from '@/modules/claims/components/expenses/ExpenseLists.vue';
import { mountUserMock } from '@/modules/claims/tests/mocks/User.mock';

// Mocks
vi.mock('@/modules/claims/stores/Expense', () => ({
    useExpenseStore: () => ({
        currentExpenses: ref([
            {
                id: '1',
                benefit_name: 'Benefit A',
                status: 'approved',
                created_at: '2025-08-15',
                amount_claimed: 100
            }
        ]),
        createExpense: vi.fn()
    })
}));

vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: () => ({
        currentSubmission: { id: 'sub1' }
    })
}));

vi.mock('@/utils/helpers', () => ({
    default: {
        formatDate: vi.fn(() => 'Aug 15, 2025'),
        moneyFormat: vi.fn((val) => `$${val.toFixed(2)}`)
    }
}));

describe('ExpenseLists', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = mount(ExpenseLists, {
            ...mountUserMock,
            global: {
                stubs: {
                    Button: true,
                    Card: { template: '<div><slot name="content"/></div>' },
                    Drawer: { template: '<div><slot/></div>' },
                    ClaimStatusTag: true,
                    ExpenseForm: true
                }
            }
        });
    });

    it('component renders correctly', () => {
        expect(wrapper.find('[data-testid="btn-filter"]').exists()).toBe(true);
        expect(
            wrapper
                .find('[data-testid="btn-open-new-expense-sidebar"]')
                .exists()
        ).toBe(true);
        expect(wrapper.find('[data-testid="text-benefit-title1"]').text()).toBe(
            'Benefit A'
        );
        expect(
            wrapper.find('[data-testid="text-expense-amount-and-date"]').text()
        ).toContain('$100.00 CAD');
    });
});
