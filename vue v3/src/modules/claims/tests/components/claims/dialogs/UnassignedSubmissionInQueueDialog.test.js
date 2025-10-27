import { mount, shallowMount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks for dependencies
vi.mock('vue-router', () => ({
    useRoute: () => ({
        params: { clientId: 'client-123' }
    }),
    useRouter: () => ({
        push: vi.fn(() => Promise.resolve())
    })
}));

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

vi.mock('@/modules/claims/stores/index.js', () => ({
    useClaimStore: () => ({
        currentClaim: ref({
            id: 'claim-123',
            insured: { id: 'insured-456' }
        })
    })
}));

vi.mock('@/modules/claims/stores/Submission.js', () => ({
    useSubmissionStore: () => ({
        searchSubmissions: vi.fn(),
        moveSubmissionToClaim: () => ({
            loading: ref(false),
            status: ref('idle'),
            mutate: vi.fn()
        })
    })
}));

// Stub ClaimBaseTable
const ClaimBaseTableStub = {
    template: `<div>
      <button @click="$emit('selectedData', { id: 'sub-789' })">Select Row</button>
      <button @click="$emit('dataLength', 5)">Emit Length</button>
    </div>`
};

import UnassignedSubmissionInQueueDialog from '@/modules/claims/components/claims/dialogs/UnassignedSubmissionDialog.vue';

describe('UnassignedSubmissionInQueueDialog.vue', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(UnassignedSubmissionInQueueDialog, {
            props: {
                visible: true
            },
            global: {
                stubs: {
                    ClaimBaseTable: ClaimBaseTableStub,
                    Dialog: { template: '<div><slot /></div>' },
                    Button: {
                        template:
                            '<button @click="$emit(\'click\')"><slot /></button>'
                    },
                    Confirmation: { template: '<div><slot /></div>' }
                },
                provide: {
                    currentUser: { id: 'user-123' }
                }
            }
        });
    });

    it('renders dialog with table', () => {
        expect(wrapper.findComponent(ClaimBaseTableStub).exists()).toBe(true);
    });

    it('handles row selection', async () => {
        await wrapper
            .findComponent(ClaimBaseTableStub)
            .vm.$emit('selectedData', { id: 'sub-789' });
        await nextTick();
        expect(wrapper.vm.selectedSubmission).toEqual({ id: 'sub-789' });
        expect(wrapper.vm.showButtons).toBe(true);
    });

    it('emits unassignedSubmissionLength when dataLength emitted', async () => {
        await wrapper
            .findComponent(ClaimBaseTableStub)
            .vm.$emit('dataLength', 5);
        expect(wrapper.emitted().unassignedSubmissionLength[0]).toEqual([5]);
    });

    it('clears selection', async () => {
        wrapper.vm.tableRef = { selectedData: { id: 'test' } };
        wrapper.vm.clearSelection();
        expect(wrapper.vm.tableRef.selectedData).toBe(null);
        expect(wrapper.vm.showButtons).toBe(false);
    });
});
