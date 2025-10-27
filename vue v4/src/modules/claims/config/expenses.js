export const createExpenseCols = (t) => {
    const regularExpense = [
        {
            label: t('expenses.received_date'),
            field: 'created_at',
            type: 'date',
            sortable: true,
            hidden: false
        },
        {
            label: t('common.status'),
            field: 'status',
            sortable: true,
            hidden: false
        },
        {
            label: t('expenses.service_date'),
            field: 'service_date',
            type: 'date',
            sortable: true,
            hidden: false
        },
        {
            label: t('common.benefit'),
            field: 'benefit_name',
            sortable: true,
            hidden: false,
            styleClass: 'text-primary underline'
        },
        {
            label: t('expenses.diagnosis'),
            field: 'diagnosis',
            sortable: true,
            hidden: false
        },
        {
            label: t('expenses.expense_amt'),
            field: 'amount_claimed',
            type: 'currency',
            sortable: true,
            hidden: false
        },
        {
            label: t('expenses.approved_amt'),
            field: 'amount_approved',
            type: 'currency',
            sortable: true,
            hidden: false
        }
    ];

    const historyExpense = [
        {
            label: t('policies.policy') + '#',
            field: 'policy_number',
            sortable: true,
            hidden: false,
            type: 'link'
        },
        {
            label: t('claims.claim_id'),
            field: 'claim_ref_number',
            sortable: true,
            hidden: false,
            type: 'link'
        },
        {
            label: t('submissions.submission_id'),
            field: 'submission_ref_number',
            sortable: true,
            hidden: false,
            type: 'link'
        },
        ...regularExpense
    ];

    const benefitExpense = [
        {
            label: t('common.benefits'),
            field: 'benefit_name',
            sortable: true,
            hidden: false,
            styleClass: 'text-primary font-bold'
        },
        {
            label: t('expenses.total_expenses'),
            field: 'total_expenses',
            sortable: true,
            hidden: false,
            styleClass: 'text-right pr-3'
        },
        {
            label: t('benefits.approved'),
            field: 'approved',
            sortable: true,
            hidden: false,
            styleClass: 'text-right pr-3'
        },
        {
            label: t('benefits.declined'),
            field: 'declined',
            sortable: true,
            hidden: false,
            styleClass: 'text-right pr-3'
        },
        {
            label: t('benefits.returned'),
            field: 'returned',
            type: 'number',
            sortable: true,
            hidden: false,
            styleClass: 'text-right pr-3'
        },
        {
            label: t('expenses.total_expense_amt'),
            field: 'amount_claimed',
            type: 'currency',
            sortable: true,
            hidden: false
        },
        {
            label: t('expenses.approved_amt'),
            field: 'amount_approved',
            type: 'currency',
            sortable: true,
            hidden: false
        },
        {
            label: t('benefits.coverage_limit'),
            field: 'coverage',
            hidden: false
        },
        {
            label: t('benefits.remaining'),
            field: 'balance',
            type: 'currency',
            hidden: false
        }
    ];

    return {
        regularExpense: () => regularExpense,
        historyExpense: () => historyExpense,
        benefitExpense: () => benefitExpense
    };
};

export const createExpenseTotalsCols = (t) => {
    return createExpenseCols(t)
        .regularExpense()
        .slice(-3)
        .map((col) => ({
            label: col.field,
            type: col.type,
            field: col.type === 'currency' ? 0 : '' // default values, replace with real totals
        }));
};

export const createExpenseData = (t) => {
    return [
        { label: t('expenses.expense_id'), field: '' },
        { label: t('expenses.service_code'), field: 'currentExpense.service_code.name' },
        { label: t('common.benefit'), field: 'currentExpense.benefit.name.en', type: 'link' },
        { label: t('expenses.din'), field: '-' },
        { label: t('expenses.service_date'), field: 'currentExpense.service_date', type: 'date' },
        { label: t('expenses.expense_amount'), field: 'currentExpense.amount_claimed', type: 'currency' },
        { label: t('expenses.beneficiary'), field: 'currentExpense.beneficiary.name' },
        { label: t('expenses.reason_for_visit'), field: 'currentExpense.description' },
        { label: t('expenses.diagnosis'), field: 'currentExpense.diagnosis' },
    ];
};

export const createExpenseCoverageData = (t) => {
    return [
        { label: t('expenses.coverage_incl'), field: '' },
        { label: t('expenses.coverage'), field: 'currentBenefit.coverage' },
        { label: t('expenses.to_maximum_of'), field: 'currentBenefit.max_amount', type: 'currency' },
        { label: t('expenses.coverage_left'), field: 'currentBenefit.balance', type: 'currency' },
    ];
};

export const createExpenseApprovalData = (t) => {
    return [
        { label: t('expenses.approved_total'), field: 'currentExpense.amount_approved', type: 'currency' },
        { label: t('expenses.approved_by'), field: '' },
        { label: t('expenses.approved_on'), field: 'currentExpense.updated_at', type: 'date' },
    ];
};
