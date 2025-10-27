import { vi } from 'vitest';
import { ref } from 'vue';

export const currentAdjudicationQueueMock = {
    id: '760053575160000000',
    name: 'Queue 100',
    description: 'Queue 100 Details',
    start_at: '2025-04-01T04:00:00.000000Z',
    end_at: '2025-06-30T04:00:00.000000Z',
    audit_frequency: 5,
    conditions: [
        {
            field: 'amount',
            value: '500',
            operator: 'equal'
        }
    ],
    priority: 1,
    status: 'active',
    total_submissions: 0,
    created_at: '2025-05-05T16:29:41.000000Z',
    updated_at: '2025-05-05T16:41:48.000000Z'
};

export const adjudicationQueuesMock = [currentAdjudicationQueueMock];

export const rulesDataMock = ref([
    {
        field: '',
        value: '',
        operator: ''
    }
]);

export const getAdjudicationQueueMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        currentAdjudicationQueue: currentAdjudicationQueueMock,
        data: adjudicationQueuesMock
    }));

const mutateAdjudicationQueueMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        data: currentAdjudicationQueueMock,
        status: 'success'
    }));

const changeStatusAdjudicationQueueMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        data: currentAdjudicationQueueMock,
        status: 'success'
    }));

const deleteAdjudicationQueueMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success'
    }));

const searchAdjudicationQueueMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success',
        meta: { total: 10 }
    }));

const getQueueDashboardMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success',
        meta: { total: 10 }
    }));

const getAdjudicationQueueSubmissionsMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success',
        meta: { total: 10 }
    }));

const searchAdjudicationQueueSubmissionsMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success',
        meta: { total: 10 }
    }));

const mutateQueuePriorityMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success'
    }));

const changeQueueSubmissionStatusMock = () =>
    vi.fn(() => ({
        loading: false, // or set true if you want to test the loading state
        mutate: vi.fn(),
        status: 'success'
    }));

const paginationMock = { page: 1, limit: 10 };

export const useAdjudicationQueueStoreMock = () => ({
    rulesData: rulesDataMock,
    currentAdjudicationQueue: currentAdjudicationQueueMock,
    adjudicationQueues: adjudicationQueuesMock,
    getAdjudicationQueue: getAdjudicationQueueMock(),
    mutateAdjudicationQueue: mutateAdjudicationQueueMock(),
    changeStatusAdjudicationQueue: changeStatusAdjudicationQueueMock(),
    deleteAdjudicationQueue: deleteAdjudicationQueueMock(),
    setRulesData: () => rulesDataMock.value,
    searchAdjudicationQueue: searchAdjudicationQueueMock(),
    getQueueDashboard: getQueueDashboardMock(),
    getAdjudicationQueueSubmissions: getAdjudicationQueueSubmissionsMock(),
    searchAdjudicationQueueSubmissions:
        searchAdjudicationQueueSubmissionsMock(),
    mutateQueuePriority: mutateQueuePriorityMock(),
    pagination: paginationMock,
    changeQueueSubmissionStatus: changeQueueSubmissionStatusMock()
});
