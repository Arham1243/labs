import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExpenseDetails from '@/modules/claims/components/expenses/details/ExpenseDetails.vue';
import { expenseStoreMock } from '@/modules/claims/tests/mocks/Expense.service.mock';
import { getClaimsMock } from '@/modules/claims/tests/mocks/Claim.service.mock';
import { mountUserMock } from '@/modules/claims/tests/mocks/User.mock';

vi.mock('@/modules/claims/stores/Expense', () => ({
    useExpenseStore: vi.fn(() => expenseStoreMock())
}));

describe('ExpenseDetails', () => {
    let wrapper;
    beforeEach(() => {
        getClaimsMock();
        wrapper = mount(ExpenseDetails, {
            ...mountUserMock,
            props: {
                clientId: '123456789'
            }
        });
    });

    it('component renders correctly', async () => {
        expect(wrapper.findByTestId('btn-open-expenses-lists').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('text-expense-pagination').text()).toBe(
            'Expense 1 /'
        );

        expect(wrapper.findComponent({ name: 'ClaimStatusTag' }).exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('btn-goto-next-expense').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('btn-goto-previous-expense').exists()).toBe(
            true
        );
    });
});
