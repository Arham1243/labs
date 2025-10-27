export const createClaimsCols = (t) => {
    const regularCols = [
        {
            label: t('claims.created_on'),
            field: 'created_at',
            type: 'date',
            sortable: true,
            hidden: false
        },
        {
            label: t('claims.claim_id'),
            field: 'claim_ref_number',
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
            label: t('insureds.insured_name'),
            field: 'insured_name',
            sortable: true,
            hidden: false,
            type: 'link'
        },
        {
            label: t('policies.policy_number'),
            field: 'policy_number',
            sortable: true,
            hidden: false,
            type: 'link'
        },
        {
            label: t('claims.reserved_amt'),
            field: 'reserved_amount',
            type: 'currency',
            sortable: true,
            hidden: false
        },
        {
            label: t('claims.created_by'),
            field: 'created_by_user_name',
            sortable: true,
            hidden: false
        },
        {
            label: t('claims.last_updated'),
            field: 'updated_at',
            type: 'date',
            sortable: true,
            hidden: false
        },
        {
            label: t('submissions.assigned_examiner'),
            field: 'assigned_to_user_name',
            sortable: true,
            hidden: false
        },
        {
            label: t('claims.number_of_submissions'),
            field: 'number_of_submissions',
            sortable: false,
            hidden: true
        },
        {
            label: t('claims.expense_total'),
            field: 'expense_total',
            type: 'currency',
            sortable: false,
            hidden: true
        },
        {
            label: t('claims.running_total'),
            field: 'running_total',
            type: 'currency',
            sortable: false,
            hidden: true
        },
        {
            label: t('claims.last_updated_by_user_name'),
            field: 'last_updated_by_user_name',
            sortable: true,
            hidden: true
        }
    ];

    const insuredClaimsCols = [
        {
            label: t('claims.claim_id'),
            field: 'claim_ref_number',
            sortable: true,
            hidden: false
        },
        {
            label: t('policies.policy_number'),
            field: 'policy_number',
            sortable: true,
            hidden: false,
            type: 'link'
        },
        {
            label: t('claims.claim_status'),
            field: 'status',
            sortable: true,
            hidden: false
        },
        {
            label: t('claims.expense_amount'),
            field: 'expense_total',
            type: 'currency',
            sortable: false,
            hidden: false
        },
        {
            label: t('claims.approved_amount'),
            field: 'running_total',
            type: 'currency',
            sortable: false,
            hidden: false
        },
        {
            label: t('claims.reserved_amount'),
            field: 'reserved_amount',
            type: 'currency',
            sortable: true,
            hidden: false
        },
        {
            label: t('claims.date_last_updated'),
            field: 'updated_at',
            type: 'date',
            sortable: true,
            hidden: false
        },
        {
            label: t('claims.created_by'),
            field: 'created_by_user_name',
            sortable: true,
            hidden: true
        },
        {
            label: t('submissions.assigned_examiner'),
            field: 'assigned_to_user_name',
            sortable: true,
            hidden: true
        },
        {
            label: t('claims.number_of_submissions'),
            field: 'number_of_submissions',
            sortable: false,
            hidden: true
        },
        {
            label: t('claims.last_updated_by_user_name'),
            field: 'last_updated_by_user_name',
            sortable: true,
            hidden: true
        },
        {
            label: t('claims.created_on'),
            field: 'created_at',
            type: 'date',
            sortable: true,
            hidden: true
        },
        {
            label: t('insureds.insured_name'),
            field: 'insured_name',
            sortable: true,
            hidden: true,
            type: 'link'
        }
    ];

    return {
        regularCols: () => regularCols,
        insuredClaimsCols: () => insuredClaimsCols
    };
};
