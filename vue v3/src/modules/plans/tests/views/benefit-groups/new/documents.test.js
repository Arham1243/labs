import { computed, ref } from 'vue';
import { vi } from 'vitest';
import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import BenefitGroupDocument from '@/modules/plans/views/benefit-groups/new/documents.vue';

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

describe('Benefit groups new add documents view', () => {
    it('page renders correctly', () => {
        const wrapper = mount(BenefitGroupDocument, {
            props: {
                id: '1'
            },
            global: {
                stubs: 'all',
                mocks: {
                    $t: (key) => key
                }
            },
            shallow: true
        });

        // Test only main UI elements
        expect(wrapper.findByTestId('back-button').exists()).toBe(true);
        expect(wrapper.findByTestId('save-continue-button').exists()).toBe(
            true
        );
    });
});
