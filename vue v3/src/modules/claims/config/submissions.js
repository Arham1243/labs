export const createSubmissionCols = (t) => {
    const assigned = [
        {
            label: t('expenses.received_date'),
            field: 'created_at',
            type: 'date',
            sortable: true,
            hidden: false
        },
        {
            label: t('submissions.sub_id'),
            field: 'submission_ref_number',
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
            label: t('submissions.submission_amt'),
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
            label: t('submissions.last_updated'),
            field: 'updated_at',
            type: 'date',
            sortable: true,
            hidden: false
        }
    ];

    const allSubmission = [
        {
            label: t('submissions.submission_id'),
            field: 'submission_ref_number',
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
            label: t('submissions.submitted_by'),
            field: 'submitted_by_name',
            sortable: true,
            hidden: false
        },
        {
            label: t('submissions.submission_date'),
            field: 'created_at',
            type: 'date',
            sortable: true,
            hidden: false
        },
        {
            label: t('submissions.source'),
            field: 'source',
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
            label: t('submissions.last_updated_by_user_name'),
            field: 'last_updated_by_user_name',
            sortable: true,
            hidden: true
        }
    ];

    const unassignedSubmissionInQueue = [
        ...assigned,
        {
            label: t('submissions.examiner'),
            field: 'examiner_name', // or whatever field holds the examiner's name
            sortable: true,
            hidden: false
        }
    ];

    const insuredClaimsCols = [
        {
            label: t('submissions.submission_id'),
            field: 'submission_ref_number',
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
            label: t('submissions.source'),
            field: 'source',
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
            label: t('expenses.received_date'),
            field: 'created_at',
            type: 'date',
            sortable: true,
            hidden: false
        },
        {
            label: t('claims.expense_amount'),
            field: 'amount_claimed',
            type: 'currency',
            sortable: true,
            hidden: false
        },
        {
            label: t('claims.approved_amount'),
            field: 'amount_approved',
            type: 'currency',
            sortable: true,
            hidden: false
        },
        {
            label: t('submissions.last_updated'),
            field: 'updated_at',
            type: 'date',
            sortable: true,
            hidden: false
        },
        {
            label: t('insureds.insured_name'),
            field: 'insured_name',
            sortable: true,
            hidden: true,
            type: 'link'
        },
        {
            label: t('policies.policy_number'),
            field: 'policy_number',
            sortable: true,
            hidden: true,
            type: 'link'
        },
        {
            label: t('submissions.submitted_by'),
            field: 'submitted_by_name',
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
            label: t('submissions.last_updated_by_user_name'),
            field: 'last_updated_by_user_name',
            sortable: true,
            hidden: true
        }
    ];

    return {
        // Columns for the submission list
        assigned: () => assigned,
        completedSubmissions: () => assigned,
        unassignedSubmissionInQueue: () => unassignedSubmissionInQueue,
        allSubmission: () => allSubmission,
        insuredClaimsCols: () => insuredClaimsCols
    };
};
