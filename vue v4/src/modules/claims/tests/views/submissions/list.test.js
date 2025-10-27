import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SubmissionListView from '@/modules/claims/views/submissions/list.vue';
import ClaimBaseTable from '@/modules/claims/components/shared/ClaimBaseTable.vue';

// Mock return value for storeAction
const mockStoreAction = vi.fn(() => ({
    mutate: vi.fn(),
    data: [],
    loading: false,
    meta: { total: 0 },
    pagination: { page: 1, limit: 10 },
    onSearch: vi.fn(),
    onPageChange: vi.fn(),
    onSortChange: vi.fn()
}));

// Mock store
vi.mock('@/modules/claims/stores/Submission.js', () => ({
    useSubmissionStore: () => ({
        searchSubmissions: mockStoreAction
    })
}));

// Mock i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key // just return translation key
    })
}));

// Mock column config
vi.mock('@/modules/claims/config/submissions.js', () => ({
    createSubmissionCols: (t) => ({
        allSubmission: () => [
            {
                label: t('submissions.submission_id'),
                field: 'submission_ref_number',
                hidden: false
            },
            {
                label: t('claims.claim_id'),
                field: 'claim_ref_number',
                hidden: false
            },
            {
                label: t('insureds.insured_name'),
                field: 'insured_name',
                hidden: false
            },
            {
                label: t('policies.policy_number'),
                field: 'policy_number',
                hidden: false
            },
            {
                label: t('submissions.submitted_by'),
                field: 'submitted_by_name',
                hidden: false
            },
            {
                label: t('submissions.submission_date'),
                field: 'created_at',
                type: 'date',
                hidden: false
            },
            {
                label: t('submissions.submission_status'),
                field: 'status',
                hidden: false
            },
            { label: t('submissions.source'), field: 'source', hidden: false },
            {
                label: t('submissions.assigned_examiner'),
                field: 'assigned_to_user_name',
                hidden: false
            }
        ]
    })
}));

describe('SubmissionListView', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(SubmissionListView);
    });

    it('renders title with translated text', () => {
        expect(wrapper.find('h4').text()).toBe('submissions.submission_list');
    });

    it('renders ClaimBaseTable with correct props', () => {
        const table = wrapper.findComponent(ClaimBaseTable);
        expect(table.exists()).toBe(true);
        expect(table.props('storeAction')).toBeDefined();
        expect(table.props('columns')).toBeInstanceOf(Array);
        expect(table.props('columns')).toHaveLength(9); // 9 submission columns
    });

    it('has handleRowSelect defined as onRowSelectAction', () => {
        const table = wrapper.findComponent(ClaimBaseTable);
        expect(table.props('onRowSelectAction')).toBeDefined();
        expect(typeof table.props('onRowSelectAction')).toBe('function');
    });
});
