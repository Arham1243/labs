import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ApproveExpenseDialog from '@/modules/claims/components/expenses/dialogs/ApproveExpenseDialog.vue';
import { getExpenseByIdMock } from '@/modules/claims/tests/mocks/Expense.service.mock';
import { getCurrenciesMock } from '@/modules/claims/tests/mocks/General.service.mock';

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
    currentBenefit: {
        amount_approved: '0.00',
        amount_claimed: '200.00',
        approved: '0',
        balance: '10000.00',
        benefit_id: '1733416764855513846',
        benefit_name: 'test benefit',
        coverage: '75',
        declined: '0',
        max_amount: '10000.00',
        pending: '0',
        total_expenses: '1'
    }
};

vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: vi.fn(() => submissionStoreMock)
}));

vi.mock('@/modules/claims/stores/Expense', () => ({
    useExpenseStore: vi.fn(() => expenseStoreMock)
}));

describe('ApproveExpenseDialog', () => {
    let wrapper;
    getCurrenciesMock();
    beforeEach(() => {
        getExpenseByIdMock();
        wrapper = mount(ApproveExpenseDialog, {
            props: {
                modelValue: true,
                expense: {
                    id: '1734033061664459216',
                    status: 'approved',
                    beneficiary: {
                        id: '1733416764855513846',
                        name: ''
                    },
                    benefit: {
                        id: '1733416764855513846',
                        name: ''
                    },
                    service_code: {
                        id: '1733416764855514826',
                        name: ''
                    },
                    amount_claimed: '250.00',
                    amount_approved: '225.00',
                    service_date: '2024-10-15 00:00:00',
                    diagnosis: 'Diagnosis 1',
                    created_at: '2024-12-12T19:51:01.000000Z',
                    updated_at: '2024-12-24T15:27:10.000000Z'
                },
                submissionRefNumber: 'ksn11235',
                currentExpenseIndex: 0
            },
            global: {
                stubs: {
                    Dialog: {
                        template:
                            '<div v-if="visible"><slot name="header"></slot><slot /><slot name="footer"></slot></div>',
                        props: ['visible']
                    },
                    ExpenseTitle: {
                        template: '<h6 data-testid="text-expense-title"></h6>',
                        props: ['modelValue', 'expense']
                    },
                    ClaimStatusTag: {
                        template:
                            '<span data-testid="tag-expense-status"></span>',
                        props: ['modelValue', 'expense']
                    },
                    CoverageIncludeLabel: {
                        template:
                            '<div data-testid="label-coverage-include"></div>',
                        props: ['modelValue']
                    },
                    CoverageIncludeText: {
                        template:
                            '<div data-testid="text-coverage-include"></div>',
                        props: ['modelValue']
                    },
                    CoverageLabel: {
                        template: '<div data-testid="label-coverage"></div>',
                        props: ['modelValue']
                    },
                    CoverageText: {
                        template: '<div data-testid="text-coverage"></div>',
                        props: ['modelValue']
                    },
                    ToMaximumOfLabel: {
                        template:
                            '<div data-testid="label-to-maximum-of"></div>',
                        props: ['modelValue']
                    },
                    ToMaximumOfText: {
                        template:
                            '<div data-testid="text-to-maximum-of"></div>',
                        props: ['modelValue']
                    },
                    CoverageLeftLabel: {
                        template:
                            '<div data-testid="label-coverage-left"></div>',
                        props: ['modelValue']
                    },
                    CoverageLeftText: {
                        template:
                            '<div data-testid="text-coverage-left"></div>',
                        props: ['modelValue']
                    },
                    ExpenseAmtLabel: {
                        template: '<div data-testid="label-expense-amt"></div>',
                        props: ['modelValue']
                    },
                    ExpenseAmtText: {
                        template: '<div data-testid="text-expense-amt"></div>',
                        props: ['modelValue']
                    },
                    ExpenseApprovalAmountLabel: {
                        template:
                            '<div data-testid="label-expense-approval-amount"></div>',
                        props: ['modelValue']
                    },
                    ExpenseApprovalAmountInput: {
                        template:
                            '<span data-testid="input-expense-approval-amount"><input /></span>',
                        props: ['modelValue']
                    },
                    CurrencyDropdown: {
                        template:
                            '<div data-testid="dropdown-expense-approval-amount-currency"></div>',
                        props: ['modelValue']
                    },
                    ExpenseCoPayAmountLabel: {
                        template:
                            '<div data-testid="label-co-pay-amount"></div>',
                        props: ['modelValue']
                    },
                    ExpenseCoPayAmountPercentageInput: {
                        template:
                            '<span data-testid="input-expense-co-pay-amount-percentage"><input /></span>',
                        props: ['modelValue']
                    },
                    ExpenseCoPayAmountInput: {
                        template:
                            '<span data-testid="input-expense-co-pay-amount"><input /></span>',
                        props: ['modelValue']
                    },
                    ExpenseApprovedAmountLabel: {
                        template:
                            '<div data-testid="label-expense-approved-total"></div>',
                        props: ['modelValue']
                    },
                    ExpenseApprovedAmountInput: {
                        template:
                            '<span data-testid="input-expense-approved-total"><input /></span>',
                        props: ['modelValue']
                    },
                    Button: {
                        template: '<button><slot /></button>'
                    }
                }
            }
        });
    });

    it('renders the dialog and sets the visible prop correctly', () => {
        expect(wrapper.vm.dialog).toBe(true);
    });

    it('renders the expense title correctly', () => {
        expect(wrapper.findByTestId('text-expense-title').text()).toBe(
            'Submission ID: kmq60znqy  Expense # 1'
        );
    });

    it('renders the expense status tag correctly', () => {
        expect(wrapper.findByTestId('tag-expense-status').exists()).toBe(true);
    });

    it('renders the expense coverage include correctly', () => {
        expect(wrapper.findByTestId('label-coverage-include').text()).toBe(
            'Coverage Incl.'
        );
        expect(wrapper.findByTestId('text-coverage-include').text()).toBe(
            'Yes'
        );
    });

    // it('renders the expense coverage correctly', () => {
    //     expect(wrapper.findByTestId('label-coverage').text()).toBe('Coverage');
    //     expect(wrapper.findByTestId('text-coverage').text()).toBe('80%');
    // });
    //
    // it('renders the expense to maximum of correctly', () => {
    //     expect(wrapper.findByTestId('label-to-maximum-of').text()).toBe(
    //         'To a Maximum of'
    //     );
    //     expect(wrapper.findByTestId('text-to-maximum-of').text()).toBe(
    //         '$1,000.00 CAD'
    //     );
    // });
    //
    // it('renders the expense coverage left correctly', () => {
    //     expect(wrapper.findByTestId('label-coverage-left').text()).toBe(
    //         'Coverage Left'
    //     );
    //     expect(wrapper.findByTestId('text-coverage-left').text()).toBe(
    //         '$950.00 CAD'
    //     );
    // });

    it('renders the expense amount correctly', () => {
        expect(wrapper.findByTestId('label-expense-amount').text()).toBe(
            'Expense Amount'
        );
        expect(wrapper.findByTestId('text-expense-amount').text()).toBe(
            'CA$200.00 CAD'
        );
    });

    it('renders the expense approval amount input correctly', () => {
        expect(
            wrapper.findByTestId('label-expense-approval-amount').text()
        ).toBe('Approval Amount');
        expect(
            wrapper.findByTestId('input-expense-approval-amount').exists()
        ).toBe(true);
    });

    it('renders the expense co-pay amount input correctly', () => {
        expect(wrapper.findByTestId('label-expense-co-pay-amount').text()).toBe(
            'Co-Pay Amount'
        );
        expect(
            wrapper
                .findByTestId('input-expense-co-pay-amount-percentage')
                .exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('input-expense-co-pay-amount').exists()
        ).toBe(true);
    });

    it('renders the expense approved amount input correctly', () => {
        expect(
            wrapper.findByTestId('label-expense-approved-total').text()
        ).toBe('Approved Total');
        expect(
            wrapper.findByTestId('input-expense-approved-total').exists()
        ).toBe(true);
    });

    it('renders buttons for cancel and confirm correctly', () => {
        const cancelButton = wrapper.find(
            '[data-testid="btn-approve-expense-cancel"]'
        );
        expect(cancelButton.exists()).toBe(true);

        const confirmButton = wrapper.find(
            '[data-testid="btn-approve-expense-confirm"]'
        );
        expect(confirmButton.exists()).toBe(true);
    });

    it('renders checkbox for courtesy pay', () => {
        expect(wrapper.findByTestId('checkbox-is-courtesy-pay').exists()).toBe(
            true
        );
    });

    it('renders textarea for courtesy pay', () => {
        expect(wrapper.findByTestId('textarea-courtesy-reason').exists()).toBe(
            false
        );
    });
});
