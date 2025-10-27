import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import PlanRecentGraduate from '@/modules/plans/components/plans/associated/PlanRecentGraduate.vue';
import * as AssociatedPlanStore from '@/modules/plans/stores/AssociatedPlan';

// Mock the AssociatedPlanStore
vi.mock('@/modules/plans/stores/AssociatedPlan');

// Mock the useEditState composable
vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: () => ({
        activeEditComponent: ref(null),
        showUnsavedDialog: ref(false),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn((callback) => callback()),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        registerCancelCallback: vi.fn(),
        unregisterCancelCallback: vi.fn(),
        triggerCancelEdit: vi.fn()
    })
}));

// Mock the event bus
vi.mock('@/composables/event-bus', () => ({
    default: () => ({ emit: vi.fn() })
}));

// Mock the PlanRecentGraduateForm component
vi.mock(
    '@/modules/plans/components/plans/associated/forms/PlanRecentGraduateForm.vue',
    () => ({
        default: {
            name: 'PlanRecentGraduateForm',
            template: '<div>Mock Form</div>',
            props: ['modelValue', 'isNew'],
            emits: ['update:modelValue', 'save']
        }
    })
);

describe('PlanRecentGraduate', () => {
    let wrapper;
    const mockUpdateAssociatedPlan = vi.fn().mockResolvedValue({});
    const mockTransferPayload = vi.fn().mockImplementation((data) => data);

    const mockData = {
        id: '1',
        category: { name: 'Recent Graduate', code: 'recent_graduate' },
        recent_graduate_eligible_days: 30,
        recent_graduate_max_days: 90
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(AssociatedPlanStore.useAssociatedPlanStore).mockReturnValue({
            updateAssociatedPlan: mockUpdateAssociatedPlan,
            transferPayload: mockTransferPayload,
            currentPlan: { id: '1' }
        });

        wrapper = mount(PlanRecentGraduate, {
            props: {
                data: mockData,
                isNew: false,
                plan: 'test-plan',
                componentId: 'plan-recent-graduate',
                isReview: false
            },
            global: {
                mocks: {
                    $t: (key, params) => {
                        if (key === 'plans.eligible_up_to_details' && params) {
                            return `${params.item} days from the previous policy end date`;
                        }
                        return key;
                    }
                },
                stubs: {
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'label',
                            'disabled',
                            'loading',
                            'icon',
                            'text',
                            'size',
                            'class',
                            'dataTestid'
                        ],
                        emits: ['click']
                    }
                }
            }
        });
    });

    it('should render the component with recent graduate settings', () => {
        expect(wrapper.find('h5').text()).toContain('Recent Graduate');
        expect(wrapper.text()).toContain('common.settings');
        expect(wrapper.text()).toContain(
            '30 days from the previous policy end date'
        );
        expect(wrapper.text()).toContain('90');
        expect(wrapper.text()).toContain('common.days');
    });

    it('should show edit button when not editing', () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        expect(editButton.exists()).toBe(true);
    });

    it('should show save and cancel buttons when editing', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        expect(wrapper.find('[data-testid="save-button"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="cancel-button"]').exists()).toBe(
            true
        );
    });

    it('should disable save button when no changes made', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        const saveButton = wrapper.find('[data-testid="save-button"]');
        expect(saveButton.attributes('disabled')).toBeDefined();
    });

    it('should enable save button when changes are made', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        // Simulate form update
        wrapper.vm.itemToUpdate = {
            ...mockData,
            recent_graduate_eligible_days: 45
        };
        await nextTick();

        const saveButton = wrapper.find('[data-testid="save-button"]');
        expect(saveButton.attributes('disabled')).toBeUndefined();
    });

    it('should call updateAssociatedPlan when saving', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        // Simulate form update
        wrapper.vm.itemToUpdate = {
            ...mockData,
            recent_graduate_eligible_days: 45
        };
        await nextTick();

        await wrapper.find('[data-testid="save-button"]').trigger('click');

        expect(mockUpdateAssociatedPlan).toHaveBeenCalledWith(
            'test-plan',
            '1',
            { ...mockData, recent_graduate_eligible_days: 45 }
        );
    });

    it('should handle cancel when editing with changes', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        // Simulate form update
        wrapper.vm.itemToUpdate = {
            ...mockData,
            recent_graduate_eligible_days: 45
        };
        await nextTick();

        await wrapper.find('[data-testid="cancel-button"]').trigger('click');

        // handleUnsavedChanges should be called
        expect(wrapper.vm.isEditing).toBe(false);
    });

    it('should handle cancel when editing without changes', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');
        await wrapper.find('[data-testid="cancel-button"]').trigger('click');

        expect(wrapper.vm.isEditing).toBe(false);
    });

    it('should render PlanRecentGraduateForm when editing', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        const form = wrapper.findComponent({ name: 'PlanRecentGraduateForm' });
        expect(form.exists()).toBe(true);
        expect(form.props('modelValue')).toEqual(mockData);
    });

    it('should handle form update events', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        const form = wrapper.findComponent({ name: 'PlanRecentGraduateForm' });
        await form.vm.$emit('update:modelValue', {
            ...mockData,
            recent_graduate_max_days: 120
        });

        expect(wrapper.vm.itemToUpdate.recent_graduate_max_days).toBe(120);
    });
});
