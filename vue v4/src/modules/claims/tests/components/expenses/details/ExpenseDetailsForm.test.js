import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExpenseDetailsForm from '@/modules/claims/components/expenses/details/ExpenseDetailsForm.vue';
import { getPolicyMock } from '@/modules/claims/tests/mocks/General.service.mock';
import { expenseStoreMock } from '@/modules/claims/tests/mocks/Expense.service.mock';

// Mock the currentSubmission value on submissionStore
const submissionStoreMock = {
    currentSubmission: {
        value: {
            policy: {
                id: 123456789
            }
        }
    }
};

vi.mock('@/modules/claims/stores/Expense', () => ({
    useExpenseStore: vi.fn(() => ({ ...expenseStoreMock() }))
}));

vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: vi.fn(() => submissionStoreMock)
}));

describe('ExpenseDetailsForm', () => {
    getPolicyMock();

    it('component renders correctly', async () => {
        const wrapper = mount(ExpenseDetailsForm, {
            props: {
                clientId: 123456789
            },
            global: {
                provide: {
                    currentUser: {
                        value: {
                            id: 123456789
                        }
                    }
                }
            }
        });

        expect(wrapper.findByTestId('label-benefit').text()).toBe('Benefit');
        expect(wrapper.findByTestId('dropdown-benefit').exists()).toBe(true);

        expect(wrapper.findByTestId('label-service-code').text()).toBe(
            'Service Code'
        );
        expect(wrapper.findByTestId('dropdown-service-code').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('label-service-date').text()).toBe(
            'Service Date'
        );
        expect(wrapper.findByTestId('date-picker-service-date').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('label-expense-amt').text()).toBe(
            'Expense Amt'
        );
        expect(wrapper.findByTestId('input-expense-amt').exists()).toBe(true);

        expect(wrapper.findByTestId('label-beneficiary').text()).toBe(
            'Beneficiary'
        );
        expect(wrapper.findByTestId('dropdown-beneficiary').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('label-description').text()).toBe(
            'Reason for Visit'
        );
        expect(wrapper.findByTestId('textarea-description').exists()).toBe(
            true
        );
    });
});
