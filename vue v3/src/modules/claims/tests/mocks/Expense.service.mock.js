import { vi } from 'vitest';
import * as ExpenseService from '@/modules/claims/services/Expense.service';

export const getExpenseByIdMock = () =>
    vi.spyOn(ExpenseService, 'getExpenseById').mockResolvedValue({
        data: {
            id: '1734033061664459216',
            status: 'approved',
            submission_id: '1734033061661887632',
            amount_claimed: '230.00',
            amount_approved: '0.00',
            amount_refund: '0.00',
            amount_co_pay: '25.00',
            description: 'bbbbbbb',
            diagnosis: 'Diagnosis 1',
            service_date: '2024-10-15 00:00:00',
            created_at: '2024-12-12T19:51:01.000000Z',
            updated_at: '2024-12-12T19:51:01.000000Z'
        }
    });

// Mock the currentExpense value on expenseStore
const currentExpenseMock = {
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
    amount_claimed: 200,
    amount_approved: '0.00',
    amount_refund: '0.00',
    amount_co_pay: '0.00',
    service_date: '2025-01-01 00:00:00',
    description: 'asdfasdf',
    diagnosis: 'Anim veniam lacus',
    created_at: '2025-01-13T16:04:19.000000Z',
    updated_at: '2025-01-13T16:04:19.000000Z'
};

// Mock expenseStore
export const expenseStoreMock = () => ({
    currentExpenses: {
        value: [
            {
                id: '1736784259025343476'
            },
            {
                id: '1736784259025754361'
            }
        ]
    },
    currentExpense: {
        value: currentExpenseMock,
        ...currentExpenseMock
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
});
