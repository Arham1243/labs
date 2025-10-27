import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExpenseDetailsCard from '@/modules/claims/components/expenses/details/card/ExpenseDetailsCard.vue';

// Mock the currentExpense value on expenseStore
const expenseStoreMock = {
    currentExpense: {
        value: {
            id: '1736784259025343476'
        },
        id: '1736784259025343476',
        submission_id: '1734033061661887632',
        status: 'pending',
        beneficiary: {
            id: '1733416764855513846',
            name: ''
        },
        benefit: {
            id: '1733416764855513846',
            name: { en: 'test benefit' }
        },
        payment_method: {
            id: '1733416764855512937',
            name: ''
        },
        service_code: {
            id: '1733416764855514826',
            name: 'ABCDE'
        },
        amount_claimed: '200.00',
        amount_approved: '0.00',
        amount_refund: '0.00',
        amount_co_pay: '0.00',
        service_date: '2025-01-01 00:00:00',
        description: 'asdfasdf'
    }
};

vi.mock('@/modules/claims/stores/Expense', () => ({
    useExpenseStore: vi.fn(() => expenseStoreMock)
}));

describe('ExpenseDetailsCard', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(ExpenseDetailsCard, {
            props: {
                clientId: 123456789,
                showExpenseDetails: true,
                showEditExpenseForm: false
            }
        });

        expect(wrapper.findByTestId('label-expense-detail-benefit').exists()).toBe(true);
        expect(wrapper.findByTestId('text-expense-detail-benefit').text()).toBe(
            'test benefit'
        );

        expect(wrapper.findByTestId('label-expense-detail-service-code').exists()).toBe(true);
        expect(wrapper.findByTestId('text-expense-detail-service-code').text()).toBe('ABCDE');

        expect(wrapper.findByTestId('label-expense-detail-service-date').exists()).toBe(true);
        expect(wrapper.findByTestId('text-expense-detail-service-date').text()).toBe(
            '01-Jan-2025'
        );

        expect(wrapper.findByTestId('label-expense-detail-reason-for-visit').exists()).toBe(true);
        expect(wrapper.findByTestId('text-expense-detail-reason-for-visit').text()).toBe(
            'asdfasdf'
        );

        expect(wrapper.findByTestId('label-expense-detail-expense-amount').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-expense-detail-expense-amount').text()).toBe(
            '$200.00 CAD'
        );

        expect(wrapper.findByTestId('label-expense-detail-beneficiary').exists()).toBe(true);

        // expect(wrapper.findByTestId('label-coverage-include').exists()).toBe(
        //     true
        // );

        // expect(wrapper.findByTestId('label-coverage').exists()).toBe(true);

        // expect(wrapper.findByTestId('label-to-maximum-of').exists()).toBe(true);
        //
        // expect(wrapper.findByTestId('label-coverage-left').exists()).toBe(true);
    });
});
