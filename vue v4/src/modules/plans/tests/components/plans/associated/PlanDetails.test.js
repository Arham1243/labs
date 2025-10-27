import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import PlanDetails from '@/modules/plans/components/plans/associated/PlanDetails.vue';
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

// Mock the PlanDetailsForm component
vi.mock(
    '@/modules/plans/components/plans/associated/forms/PlanDetailsForm.vue',
    () => ({
        default: {
            name: 'PlanDetailsForm',
            template: '<div>Mock Form</div>',
            props: ['modelValue', 'isNew'],
            emits: ['update:modelValue', 'save']
        }
    })
);

// Mock the useHelpers composable
vi.mock('@/composables', () => ({
    useHelpers: () => ({
        formatDate: (date) => (date ? new Date(date).toLocaleDateString() : '')
    })
}));

describe('PlanDetails', () => {
    let wrapper;
    const mockUpdateAssociatedPlan = vi.fn().mockResolvedValue({});
    const mockTransferPayload = vi.fn().mockImplementation((data) => data);

    const mockData = {
        id: '1',
        category: { name: 'Test Category', code: 'test_category' },
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        authorized: { name: 'Test User', id: '123' }
    };

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(AssociatedPlanStore.useAssociatedPlanStore).mockReturnValue({
            updateAssociatedPlan: mockUpdateAssociatedPlan,
            transferPayload: mockTransferPayload,
            currentPlan: { id: '1' }
        });

        wrapper = mount(PlanDetails, {
            props: {
                data: mockData,
                isNew: false,
                plan: 'test-plan',
                componentId: 'plan-details',
                isReview: false
            },
            global: {
                mocks: {
                    $t: (msg) => msg
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

    it('should render the component with plan details', () => {
        expect(wrapper.find('h5').text()).toContain('plans.plan_details');
        expect(wrapper.text()).toContain('Test Category');
        expect(wrapper.text()).toContain('Test User');
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
            effective_date: '2023-02-01'
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
            effective_date: '2023-02-01'
        };
        await nextTick();

        await wrapper.find('[data-testid="save-button"]').trigger('click');

        expect(mockUpdateAssociatedPlan).toHaveBeenCalledWith(
            'test-plan',
            '1',
            { ...mockData, effective_date: '2023-02-01' }
        );
    });

    it('should handle cancel when editing with changes', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        // Simulate form update
        wrapper.vm.itemToUpdate = {
            ...mockData,
            effective_date: '2023-02-01'
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

    it('should render PlanDetailsForm when editing', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        const form = wrapper.findComponent({ name: 'PlanDetailsForm' });
        expect(form.exists()).toBe(true);
        expect(form.props('modelValue')).toEqual(mockData);
    });

    it('should handle save event from PlanDetailsForm', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        const form = wrapper.findComponent({ name: 'PlanDetailsForm' });
        await form.vm.$emit('save');

        expect(mockUpdateAssociatedPlan).toHaveBeenCalled();
    });
});
