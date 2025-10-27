import { mount } from '@vue/test-utils';
import { afterEach, describe, it, expect, beforeEach, vi } from 'vitest';
import MyComponent from '@/modules/plans/components/services/CodeGroupsServiceCodes.vue';
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

vi.mock('../../../stores/CodeSet', () => ({
    useCodeSetStore: vi.fn(() => ({
        getCodeSetTags: vi
            .fn()
            .mockResolvedValue({ data: [{ name: 'Tag1' }, { name: 'Tag2' }] }),
        syncCodeGroupByTags: vi.fn().mockResolvedValue({})
    }))
}));

describe('MyComponent', () => {
    let wrapper;

    beforeEach(async () => {
        vi.useFakeTimers();
        wrapper = mount(MyComponent, {
            props: {
                id: '123',
                isNew: true,
                codeSetId: '456'
            },
            global: {
                stubs: {
                    ServiceCodesTable: true,
                }
            }
        });
        await wrapper.vm.$nextTick();
    });

    afterEach(() => {
        vi.runAllTimers();
        vi.useRealTimers();
    });

    it('renders the page title correctly', () => {
        const pageTitle = wrapper.find('[data-testid="page-title"]');
        expect(pageTitle.exists()).toBe(true);
        expect(pageTitle.text()).toBe(
            'Select service codes to include in code group'
        );
    });

    it('shows the cancel button when in edit mode', async () => {
        await wrapper.setProps({ isNew: false });
        wrapper.vm.isEditing = true;
        await wrapper.vm.$nextTick();
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        expect(cancelButton.exists()).toBe(true);
    });

    it('renders the tags multiselect when editable', () => {
        const multiselect = wrapper.find('[data-testid="tags-multiselect"]');
        expect(multiselect.exists()).toBe(true);
    });

    it('renders the ServiceCodesTable components', () => {
        const includedTable = wrapper.find(
            '[data-testid="included-service-codes"]'
        );
        const excludedTable = wrapper.find(
            '[data-testid="excluded-service-codes"]'
        );
        expect(includedTable.exists()).toBe(true);
        expect(excludedTable.exists()).toBe(true);
    });
});
