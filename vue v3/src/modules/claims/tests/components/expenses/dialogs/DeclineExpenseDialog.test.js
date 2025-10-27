import { describe, expect, it, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DeclineExpenseDialog from '@/modules/claims/components/expenses/dialogs/DeclineExpenseDialog.vue';
import { expenseStoreMock } from '@/modules/claims/tests/mocks/Expense.service.mock';

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

vi.mock('@/modules/claims/stores/Expense', () => ({
    useExpenseStore: vi.fn(() => expenseStoreMock())
}));

vi.mock('@/modules/claims/stores/Submission', () => ({
    useSubmissionStore: vi.fn(() => submissionStoreMock)
}));

describe('DeclineExpenseDialog', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = mount(DeclineExpenseDialog, {
            props: {
                modelValue: true,
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
                    Dropdown: {
                        template:
                            '<div data-testid="select-decline-expense-template" v-model="modelValue"></div>',
                        props: ['modelValue']
                    },
                    Editor: {
                        template:
                            '<div data-testid="editor-decline-expense-reason" v-model="modelValue"></div>',
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

    it('renders dropdown field for select template correctly', () => {
        expect(
            wrapper.findByTestId('select-decline-expense-template').exists()
        ).toBe(true);
    });

    it('renders editor field for decline expense reason correctly', () => {
        expect(
            wrapper.findByTestId('editor-decline-expense-reason').exists()
        ).toBe(true);
    });

    it('renders buttons for cancel and confirm correctly', () => {
        const cancelButton = wrapper.find(
            '[data-testid="btn-decline-expense-cancel"]'
        );
        expect(cancelButton.exists()).toBe(true);

        const confirmButton = wrapper.find(
            '[data-testid="btn-decline-expense-confirm"]'
        );
        expect(confirmButton.exists()).toBe(true);
    });
});
