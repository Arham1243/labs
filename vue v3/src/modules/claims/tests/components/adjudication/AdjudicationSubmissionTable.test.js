// tests/unit/AdjudicationSubmissionTable.spec.ts
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import AdjudicationSubmissionTable from '@/modules/claims/components/adjudication/AdjudicationSubmissionTable.vue';
import { ref, nextTick } from 'vue';
import { useAdjudicationQueueStoreMock } from '@/modules/claims/tests/mocks/Adjudication.service.mock';

// --- MOCKS ---

// Mock vue-router
const push = vi.fn();
vi.mock('vue-router', async () => {
    const actual = await vi.importActual('vue-router');
    return {
        ...actual,
        useRouter: () => ({ push })
    };
});

// Mock store
const getAdjudicationQueueSubmissions = vi.fn();
const mockSubmissions = ref([
    {
        id: '1',
        client_id: '101',
        ref_number: 'REF123',
        created_at: '2024-01-01',
        source: 'Online',
        amount_claimed: 100,
        status: 'Pending'
    }
]);

vi.mock('@/modules/claims/stores/AdjudicationQueue', () => ({
    useAdjudicationQueueStore: vi.fn(() => ({
        ...useAdjudicationQueueStoreMock()
    }))
}));

// Mock Submission Store
const searchSubmissions__ = vi.fn();
const mockCurrentSubmissions = ref([
    {
        id: '1',
        client_id: '101',
        ref_number: 'REF123',
        created_at: '2024-01-01',
        amount_claimed: 100,
        status: 'Pending'
    }
]);

// --- TESTS ---
describe('AdjudicationSubmissionTable.vue', () => {
    let wrapper;

    beforeEach(() => {
        vi.clearAllMocks();
        wrapper = mount(AdjudicationSubmissionTable, {
            props: {
                queueId: 'queue-001'
            },
            global: {
                stubs: {
                    ClaimStatusTag: true,
                    Search: {
                        template: '<input data-testid="search-input" />'
                    },
                    Button: {
                        template:
                            '<button data-testid="btn-submission-table-filter">Filter</button>'
                    }
                }
            }
        });
    });

    it('navigates correctly on row select', async () => {
        const rowEvent = {
            data: {
                submission_id: '1',
                client_id: '101'
            }
        };

        await wrapper.vm.onRowSelect(rowEvent);
        expect(push).toHaveBeenCalledWith('/claims/submissions/1/client/101');
    });

    it('renders the search and filter UI', async () => {
        await flushPromises();
        expect(wrapper.find('[data-testid="search-input"]').exists()).toBe(
            true
        );
        expect(
            wrapper.find('[data-testid="btn-submission-table-filter"]').exists()
        ).toBe(true);
    });

    it('handles empty submissions array gracefully', async () => {
        mockSubmissions.value = [];
        await flushPromises();
        await nextTick();

        expect(wrapper.vm.submissions).toEqual([]);
    });
});
