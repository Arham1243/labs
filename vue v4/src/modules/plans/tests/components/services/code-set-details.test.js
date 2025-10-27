import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CodeSetDetails from '@/modules/plans/components/services/CodeSetDetails.vue';
import CodeSetDetailsForm from '@/modules/plans/components/services/forms/CodeSetDetailsForm.vue';
import { ref } from 'vue';

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
        triggerCancelEdit: vi.fn()
    })
}));

vi.mock('@/modules/plans/stores/CodeSet', () => ({
    useCodeSetStore: vi.fn(() => ({
        setCurrentCodeSet: vi.fn(),
        updateCodeSet: vi
            .fn()
            .mockResolvedValue({ data: { name: 'Updated Name' } })
    }))
}));

vi.mock('@/stores', () => ({
    useGlobalStore: vi.fn(() => ({
        clearErrors: vi.fn()
    }))
}));

vi.mock('@/composables', () => ({
    useHelpers: vi.fn(() => ({
        getLocaleValue: (value) => value,
        formatDate: (date) => date
    }))
}));

describe('CodeSetDetails', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(CodeSetDetails, {
            props: {
                data: {
                    name: 'Sample Code Set',
                    description: 'A description for the code set',
                    effective_date: '2024-10-23'
                },
                isNew: false
            },
            global: {
                stubs: {
                    CodeSetDetailsForm: true,
                    Confirmation: true
                }
            }
        });
    });

    it('renders the page title correctly', () => {
        const pageTitle = wrapper.find('[data-testid="page-title"]');
        expect(pageTitle.exists()).toBe(true);
        expect(pageTitle.text()).toBe('Code Set Details');
    });

    it('renders the Code Set Details Form when in edit mode', async () => {
        wrapper.vm.isEditing = true;
        await wrapper.vm.$nextTick();

        const form = wrapper.findComponent(CodeSetDetailsForm);
        expect(form.exists()).toBe(true);
        expect(form.props('isNew')).toBe(false);
    });

    it('renders the Cancel and Save buttons when in edit mode', async () => {
        wrapper.vm.isEditing = true;
        await wrapper.vm.$nextTick();

        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        const saveButton = wrapper.find('[data-testid="save-button"]');

        expect(cancelButton.exists()).toBe(true);
        expect(cancelButton.text()).toContain('Cancel');
        expect(saveButton.exists()).toBe(true);
        expect(saveButton.text()).toContain('Save');
    });
});
