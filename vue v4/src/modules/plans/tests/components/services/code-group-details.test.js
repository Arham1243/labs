import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CodeGroupDetails from '@/modules/plans/components/services/CodeGroupDetails.vue';
import { useCodeSetStore } from '../../../stores/CodeSet';
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
    useCodeSetStore: vi.fn()
}));

describe('CodeGroupDetails', () => {
    let wrapper;

    const mockCodeSetStore = {
        setCurrentCodeGroup: vi.fn(),
        updateCodeGroup: vi.fn().mockResolvedValue({ data: {} }),
        searchCodeSets: vi.fn().mockResolvedValue({ data: [] })
    };

    const data = {
        id: 1,
        name: { en: 'Test Group' },
        description: { en: 'This is a test description.' },
        service_code_set: { id: 1, name: { en: 'Test Service Code Set' } },
        effective_date: '2024-01-01'
    };

    beforeEach(() => {
        useCodeSetStore.mockReturnValue(mockCodeSetStore);

        wrapper = mount(CodeGroupDetails, {
            props: {
                data,
                isNew: false
            }
        });
    });

    it('should render the loader when loading is true', async () => {
        wrapper.vm.loading = true;
        await wrapper.vm.$nextTick();
        expect(wrapper.findComponent({ name: 'Loader' }).exists()).toBe(true);
    });

    it('should render the code group details when not in edit mode', () => {
        expect(wrapper.text()).toContain('Code Group Details');
        expect(wrapper.text()).toContain('Name: Test Group');
        expect(wrapper.text()).toContain(
            'Description: This is a test description.'
        );
    });

    it('should update data when save is called', async () => {
        wrapper.vm.isEditing = true;
        wrapper.vm.itemToUpdate = { ...data };
        await wrapper.vm.save();

        expect(mockCodeSetStore.updateCodeGroup).toHaveBeenCalledWith(
            data.id,
            expect.any(Object)
        );
        expect(wrapper.emitted()['update:data']).toBeTruthy();
        expect(wrapper.emitted().reloadItem).toBeTruthy();
        expect(wrapper.vm.isEditing).toBe(false);
    });

    it('should disable Save button if there are no changes', async () => {
        wrapper.vm.isEditing = true;
        wrapper.vm.itemToUpdate = { ...data };
        await wrapper.vm.$nextTick();

        const saveButton = wrapper.find('[data-testid="save-button"]');
        expect(saveButton.exists()).toBe(true);
        expect(saveButton.element.disabled).toBe(true);
    });

    it('should enable Save button if there are changes', async () => {
        wrapper.vm.isEditing = true;
        wrapper.vm.itemToUpdate = { ...data, name: { en: 'Changed Name' } };
        await wrapper.vm.$nextTick();

        const saveButton = wrapper.find('[data-testid="save-button"]');
        expect(saveButton.exists()).toBe(true);
        expect(saveButton.element.disabled).toBe(false);
    });
});
