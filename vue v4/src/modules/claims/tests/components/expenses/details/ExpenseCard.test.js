import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ExpenseCard from '@/modules/claims/components/expenses/details/ExpenseCard.vue';
import DiagnosisCard from '@/modules/claims/components/expenses/details/card/DiagnosisCard.vue';
import { mountUserMock } from '@/modules/claims/tests/mocks/User.mock';

// Mock the currentExpense value on expenseStore
const expenseStoreMock = {
    currentExpense: {
        id: '1736784259025343476',
        submission_id: '1734033061661887632',
        status: 'pending',
        beneficiary: {
            id: '1733416764855513846',
            name: ''
        },
        benefit: {
            id: '1733416764855513846',
            name: ''
        },
        payment_method: {
            id: '1733416764855512937',
            name: ''
        },
        service_code: {
            id: '1733416764855514826',
            name: ''
        },
        amount_claimed: '200.00',
        amount_approved: '0.00',
        amount_refund: '0.00',
        amount_co_pay: '0.00',
        service_date: '2025-01-01 00:00:00',
        description: 'asdfasdf',
        diagnosis: 'Anim veniam lacus',
        created_at: '2025-01-13T16:04:19.000000Z',
        updated_at: '2025-01-13T16:04:19.000000Z'
    },
    updateExpense: vi.fn(() => ({
        loading: false,
        mutate: vi.fn(),
        status: 'success'
    })),
    changeExpenseStatus: vi.fn(() => ({
        loading: false,
        mutate: vi.fn(),
        status: 'success'
    }))
};

vi.mock('@/modules/claims/stores/Expense', () => ({
    useExpenseStore: vi.fn(() => expenseStoreMock)
}));

describe('ExpenseCard', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = mount(ExpenseCard, {
            ...mountUserMock,
            props: {
                clientId: 123456789
            }
        });
    });

    it('component renders correctly', async () => {
        expect(wrapper.findByTestId('btn-approve-expense').exists()).toBe(true);

        expect(wrapper.findByTestId('btn-decline-expense').exists()).toBe(true);

        expect(
            wrapper.findByTestId('btn-more-actions-on-expense').exists()
        ).toBe(true);
        expect(wrapper.findByTestId('btn-more-actions-on-expense').text()).toBe(
            'More Actions'
        );
    });
});
