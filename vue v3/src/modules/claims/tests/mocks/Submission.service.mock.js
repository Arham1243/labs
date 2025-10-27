import { vi } from 'vitest';
import { ref } from 'vue';
import { metaMock } from '@/modules/claims/tests/mocks/General.mock.js';
import * as SubmissionService from '@/modules/claims/services/Submission.service';

export const submissionSourcesMock = [
    'admin_portal',
    'email',
    'mobile_app',
    'web_portal',
    'fax',
    'other'
];

export const currentSubmissionMock = {
    id: '11111111111111111',
    ref_number: 'kmq60znqy',
    claim_id: '3333333333333333',
    claim: {
        id: '3333333333333333',
        ref_number: 'bv8qfE09',
        status: 'review',
        declined_total: 0,
        expense_total: 690,
        running_total: 300,
        reserved_amount: 800,
        created_by_user_id: '123456789',
        last_updated_by_user_id: '123456789',
        created_at: '2021-05-01T00:00:00.000Z',
        updated_at: '2021-05-01T00:00:00.000Z'
    },
    insured: {
        id: '4444444444444444',
        dob: '1992-01-01',
        name: 'John Doe'
    },
    policy: {
        id: '222222222222222',
        number: '1520000',
        holder: 'test test'
    },
    status: 'pending',
    source: 'email',
    amount_approved: 200,
    amount_claimed: 450,
    created_at: '2021-05-01T00:00:00.000Z',
    updated_at: '2021-05-01T00:00:00.000Z'
};

export const currentSubmissionsMock = [
    currentSubmissionMock,
    currentSubmissionMock
];

export const getSubmissionsMock = () =>
    vi.spyOn(SubmissionService, 'getSubmissions').mockResolvedValue({
        data: {
            data: currentSubmissionsMock,
            meta: metaMock
        }
    });

export const searchSubmissionsMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success',
        data: currentSubmissionsMock
    }));

export const getSubmissionMock = () =>
    vi.spyOn(SubmissionService, 'getSubmissionById').mockResolvedValue({
        data: {
            data: currentSubmissionMock
        }
    });

export const moveSubmissionToClaimMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success'
    }));

export const createSubmissionMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success'
    }));

export const assignSubmissionToExaminerMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success'
    }));

export const getSubmissionSourcesMock = () =>
    vi.spyOn(SubmissionService, 'getSubmissionSources').mockResolvedValue({
        data: {
            data: submissionSourcesMock
        }
    });

const changeQueueSubmissionStatusMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success'
    }));

export const useSubmissionStoreMock = () => ({
    newSubmission: ref({
        policy_id: '1740673238183129700',
        insured_id: '1740673238175540316',
        provider_id: 173150959834000,
        currency_id: 'CAD',
        source: 'mobile_app',
        expenses: [
            {
                service_date: '2025-02-02',
                description: 'Dental Care',
                amount: 250,
                diagnosis: 'this is a test diagnosis',
                benefit_id: 173150959834001,
                beneficiary_id: 173150959834002,
                service_code_id: 173150959834003,
                payment_method_id: 173150959834004,
                is_payee_self: true,
                attachments: []
            }
        ],
        attachments: [],
        secondary_insurance: {
            provider: '',
            policy_number: '',
            group_number: '',
            details: ''
        },
        payee: {
            payee: '',
            payment_method: '',
            document: '',
            other_info: {}
        },
        formData: {}
    }),

    newSubmissionBtn: ref(-1),
    resetSubmissionData: () => {},

    getSubmissions: getSubmissionsMock(),
    searchSubmissions: searchSubmissionsMock(),
    getSubmission: getSubmissionMock(),
    moveSubmissionToClaim: moveSubmissionToClaimMock(),
    createSubmission: createSubmissionMock(),
    assignSubmissionToExaminer: assignSubmissionToExaminerMock(),
    getSubmissionSources: getSubmissionSourcesMock(),
    changeQueueSubmissionStatus: changeQueueSubmissionStatusMock()
});
