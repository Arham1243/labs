import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, ref } from 'vue';

import DocumentsView from '@/modules/plans/views/benefits/benefit/new/documents.vue';
import { listDocumentsMock } from '@/../tests/mocks/Document.service.mocks';

vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: () => ({
        activeEditComponent: ref(null),
        showUnsavedDialog: ref(false),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn(),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        registerCancelCallback: vi.fn(),
        unregisterCancelCallback: vi.fn(),
        triggerCancelEdit: vi.fn(),
        isAnyComponentEditing: computed(() => false),
        shouldUseLazy: computed(() => true)
    }),
    provideEditState: vi.fn().mockReturnValue({
        activeEditComponent: ref(null),
        showUnsavedDialog: ref(false),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn(),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        registerCancelCallback: vi.fn(),
        unregisterCancelCallback: vi.fn(),
        triggerCancelEdit: vi.fn(),
        isAnyComponentEditing: computed(() => false),
        shouldUseLazy: computed(() => true)
    })
}));

describe('Documents view', () => {
    beforeEach(() => {
        listDocumentsMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(DocumentsView, {
            props: { id: '7e9cefff-c0e8-4e7d-864d-08a8b3148a73' }
        });

        expect(wrapper.findComponent({ name: 'DocumentsTable' }).exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );
    });
});
