import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PlanPolicyAction from '@/modules/plans/components/plans/PlanPolicyAction.vue';
import { nextTick } from 'vue';
import { useRoute } from 'vue-router';

// Mock the PlanStore
const mockUpdatePlan = vi.fn().mockResolvedValue({
    data: {
        id: '123',
        name: { en: 'Updated Plan' },
        periods: [
            {
                id: '1',
                name: 'Period 1',
                effective_date: '2023-01-01',
                end_date: '2023-12-31',
                cancellation_periods: [
                    {
                        id: '1',
                        type: 'full',
                        name: 'Full Cancellation',
                        plan_period_precedence: 'before',
                        plan_period_date_reference: 'effective_date'
                    },
                    {
                        id: '2',
                        type: 'partial',
                        name: 'Partial Cancellation',
                        plan_period_precedence: 'during',
                        plan_period_date_reference: 'end_date'
                    }
                ],
                extension_periods: [
                    {
                        id: '3',
                        name: 'Extension Period',
                        plan_period_precedence: 'after',
                        plan_period_date_reference: 'end_date'
                    }
                ],
                early_return_periods: [
                    {
                        id: '4',
                        name: 'Early Return Period',
                        plan_period_precedence: 'during',
                        plan_period_date_reference: 'policy_term'
                    }
                ]
            }
        ],
        cancellation_type: { value: 'fixed' },
        extension_type: { value: 'fixed' },
        early_return_type: { value: 'fixed' },
        is_cancellations: true,
        is_extensions: true,
        is_early_returns: true
    }
});

vi.mock('@/modules/plans/stores/Plan', () => ({
    usePlanStore: vi.fn(() => ({
        updatePlan: mockUpdatePlan,
        transferPayload: vi.fn((data) => data)
    }))
}));

// Mock the helpers
vi.mock('@/composables', () => ({
    useHelpers: vi.fn(() => ({
        getLocaleValue: vi.fn((value) => value?.en || value),
        formatDate: vi.fn((date, format) => date)
    }))
}));

// Mock the event bus
const mockEmit = vi.fn();
vi.mock('@/composables/event-bus', () => ({
    default: vi.fn(() => ({
        emit: mockEmit
    }))
}));

// Mock vue-router
vi.mock('vue-router', () => ({
    useRoute: vi.fn(() => ({
        name: 'Plan Details'
    }))
}));

// Mock the useEditState composable
const mockSetActiveComponent = vi.fn();
const mockClearActiveComponent = vi.fn();
const mockRegisterCancelCallback = vi.fn();
const mockUnregisterCancelCallback = vi.fn();
const mockHandleUnsavedChanges = vi.fn((callback) => callback());

vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: vi.fn(() => ({
        activeEditComponent: { value: null },
        setActiveComponent: mockSetActiveComponent,
        clearActiveComponent: mockClearActiveComponent,
        registerCancelCallback: mockRegisterCancelCallback,
        unregisterCancelCallback: mockUnregisterCancelCallback,
        handleUnsavedChanges: mockHandleUnsavedChanges
    }))
}));

describe('PlanPolicyAction - Rendering Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        periods: [
            {
                id: '1',
                name: 'Period 1',
                effective_date: '2023-01-01',
                end_date: '2023-12-31',
                cancellation_periods: [
                    {
                        id: '1',
                        type: 'full',
                        name: 'Full Cancellation',
                        plan_period_precedence: 'before',
                        plan_period_date_reference: 'effective_date'
                    },
                    {
                        id: '2',
                        type: 'partial',
                        name: 'Partial Cancellation',
                        plan_period_precedence: 'during',
                        plan_period_date_reference: 'end_date'
                    }
                ],
                extension_periods: [
                    {
                        id: '3',
                        name: 'Extension Period',
                        plan_period_precedence: 'after',
                        plan_period_date_reference: 'end_date'
                    }
                ],
                early_return_periods: [
                    {
                        id: '4',
                        name: 'Early Return Period',
                        plan_period_precedence: 'during',
                        plan_period_date_reference: 'policy_term'
                    }
                ]
            }
        ],
        cancellation_type: { value: 'fixed' },
        extension_type: { value: 'fixed' },
        early_return_type: { value: 'fixed' },
        is_cancellations: true,
        is_extensions: true,
        is_early_returns: true
    };

    beforeEach(async () => {
        wrapper = mount(PlanPolicyAction, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'plan-policy-action',
                isReview: false
            },
            global: {
                stubs: {
                    PolicyActionFrom: {
                        template:
                            '<div data-testid="policy-action-form"></div>',
                        props: ['modelValue', 'isNew'],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'label',
                            'icon',
                            'dataTestid',
                            'loading',
                            'disabled'
                        ],
                        emits: ['click']
                    }
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        await nextTick();
    });

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('displays the policy action details when not editing', () => {
        // Check for section titles
        expect(wrapper.text()).toContain('common.cancellations');
        expect(wrapper.text()).toContain('common.extensions');
        expect(wrapper.text()).toContain('common.early_returns');

        // Check for period names
        expect(wrapper.text()).toContain('Full Cancellation');
        expect(wrapper.text()).toContain('Partial Cancellation');
        expect(wrapper.text()).toContain('Extension Period');
        expect(wrapper.text()).toContain('Early Return Period');
    });

    it('does not display the policy action form when not editing', () => {
        const form = wrapper.find('[data-testid="policy-action-form"]');
        expect(form.exists()).toBe(false);
    });

    it('displays the edit button when not editing', () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        expect(editButton.exists()).toBe(true);
    });

    it('does not display the save and cancel buttons when not editing', () => {
        const saveButton = wrapper.find('[data-testid="save-button"]');
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        expect(saveButton.exists()).toBe(false);
        expect(cancelButton.exists()).toBe(false);
    });
});

describe('PlanPolicyAction - Interaction Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        periods: [
            {
                id: '1',
                name: 'Period 1',
                effective_date: '2023-01-01',
                end_date: '2023-12-31',
                cancellation_periods: [
                    {
                        id: '1',
                        type: 'full',
                        name: 'Full Cancellation',
                        plan_period_precedence: 'before',
                        plan_period_date_reference: 'effective_date'
                    }
                ],
                extension_periods: [
                    {
                        id: '3',
                        name: 'Extension Period',
                        plan_period_precedence: 'after',
                        plan_period_date_reference: 'end_date'
                    }
                ],
                early_return_periods: [
                    {
                        id: '4',
                        name: 'Early Return Period',
                        plan_period_precedence: 'during',
                        plan_period_date_reference: 'policy_term'
                    }
                ]
            }
        ],
        cancellation_type: { value: 'fixed' },
        extension_type: { value: 'fixed' },
        early_return_type: { value: 'fixed' },
        is_cancellations: true,
        is_extensions: true,
        is_early_returns: true
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanPolicyAction, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'plan-policy-action',
                isReview: false
            },
            global: {
                stubs: {
                    PolicyActionFrom: {
                        template:
                            '<div data-testid="policy-action-form"></div>',
                        props: ['modelValue', 'isNew'],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'label',
                            'icon',
                            'dataTestid',
                            'loading',
                            'disabled'
                        ],
                        emits: ['click']
                    }
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        await nextTick();
    });

    it('registers cancel callback on mount', () => {
        expect(mockRegisterCancelCallback).toHaveBeenCalledWith(
            'plan-policy-action',
            expect.any(Function)
        );
    });

    it('unregisters cancel callback on unmount', async () => {
        wrapper.unmount();
        expect(mockUnregisterCancelCallback).toHaveBeenCalledWith(
            'plan-policy-action'
        );
    });

    it('enters edit mode when edit button is clicked', async () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        expect(wrapper.vm.isEditing).toBe(true);
        expect(mockSetActiveComponent).toHaveBeenCalledWith(
            'plan-policy-action'
        );

        // Form should be visible in edit mode
        const form = wrapper.find('[data-testid="policy-action-form"]');
        expect(form.exists()).toBe(true);

        // Save and cancel buttons should be visible in edit mode
        const saveButton = wrapper.find('[data-testid="save-button"]');
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        expect(saveButton.exists()).toBe(true);
        expect(cancelButton.exists()).toBe(true);
    });

    it('exits edit mode when cancel button is clicked', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        expect(wrapper.vm.isEditing).toBe(false);
        expect(mockClearActiveComponent).toHaveBeenCalled();

        // Form should not be visible after canceling
        const form = wrapper.find('[data-testid="policy-action-form"]');
        expect(form.exists()).toBe(false);
    });

    it('saves changes when save button is clicked', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            cancellation_type: { value: 'open' }
        };
        await nextTick();

        // Now click save
        const saveButton = wrapper.find('[data-testid="save-button"]');
        await saveButton.trigger('click');

        expect(mockUpdatePlan).toHaveBeenCalledWith('123', expect.any(Object));
        expect(wrapper.vm.isEditing).toBe(false);
        expect(mockClearActiveComponent).toHaveBeenCalled();
        expect(mockEmit).toHaveBeenCalledWith('reloadPlanDetails');
    });

    it('handles unsaved changes when canceling', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            cancellation_type: { value: 'open' }
        };
        await nextTick();

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        expect(mockHandleUnsavedChanges).toHaveBeenCalled();
        expect(wrapper.vm.isEditing).toBe(false);
    });
});

describe('PlanPolicyAction - Review Mode Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        periods: [
            {
                id: '1',
                name: 'Period 1',
                effective_date: '2023-01-01',
                end_date: '2023-12-31',
                cancellation_periods: [
                    {
                        id: '1',
                        type: 'full',
                        name: 'Full Cancellation',
                        plan_period_precedence: 'before',
                        plan_period_date_reference: 'effective_date'
                    }
                ],
                extension_periods: [],
                early_return_periods: []
            }
        ],
        cancellation_type: { value: 'fixed' },
        extension_type: { value: 'open' },
        early_return_type: { value: 'open' },
        is_cancellations: true,
        is_extensions: false,
        is_early_returns: false
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        // Default mock for useRoute
        vi.mocked(useRoute).mockReturnValue({
            name: 'Plan Details'
        });

        wrapper = mount(PlanPolicyAction, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'plan-policy-action',
                isReview: true
            },
            global: {
                stubs: {
                    PolicyActionFrom: {
                        template:
                            '<div data-testid="policy-action-form"></div>',
                        props: ['modelValue', 'isNew'],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'label',
                            'icon',
                            'dataTestid',
                            'loading',
                            'disabled'
                        ],
                        emits: ['click']
                    }
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        await nextTick();
    });

    it('skips unsaved changes check in review mode', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            cancellation_type: { value: 'open' }
        };
        await nextTick();

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        // In review mode, handleUnsavedChanges should not be called
        expect(mockHandleUnsavedChanges).not.toHaveBeenCalled();
        expect(wrapper.vm.isEditing).toBe(false);
    });

    it('emits reloadReviewPlanDetails event when saving in review mode', async () => {
        // Unmount the current wrapper
        wrapper.unmount();

        // Create a new wrapper with a different route name
        vi.mocked(useRoute).mockReturnValue({
            name: 'Review Plan'
        });

        wrapper = mount(PlanPolicyAction, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'plan-policy-action',
                isReview: true
            },
            global: {
                stubs: {
                    PolicyActionFrom: {
                        template:
                            '<div data-testid="policy-action-form"></div>',
                        props: ['modelValue', 'isNew'],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'label',
                            'icon',
                            'dataTestid',
                            'loading',
                            'disabled'
                        ],
                        emits: ['click']
                    }
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        await nextTick();

        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            cancellation_type: { value: 'open' }
        };
        await nextTick();

        // Now click save
        const saveButton = wrapper.find('[data-testid="save-button"]');
        await saveButton.trigger('click');

        expect(mockUpdatePlan).toHaveBeenCalledWith('123', expect.any(Object));
        expect(wrapper.vm.isEditing).toBe(false);
        expect(mockClearActiveComponent).toHaveBeenCalled();
        expect(mockEmit).toHaveBeenCalledWith('reloadReviewPlanDetails');
    });
});
