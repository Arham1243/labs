import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PlanDetails from '@/modules/plans/components/plans/PlanDetails.vue';
import { nextTick } from 'vue';

// Mock the PlanStore
const mockUpdatePlan = vi.fn().mockResolvedValue({
    data: {
        id: '123',
        name: { en: 'Updated Plan' },
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        type: { value: 'domestic' },
        bound: { value: 'in' },
        authorized: { name: 'John Doe' }
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
        formatDate: vi.fn((date) => date)
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
import { useRoute } from 'vue-router';
const mockRoute = { name: 'Plan Details' };
vi.mock('vue-router', () => ({
    useRoute: vi.fn(() => mockRoute)
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

describe('PlanDetails - Rendering Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        type: { value: 'domestic' },
        bound: { value: 'in' },
        authorized: { name: 'John Doe' }
    };

    beforeEach(async () => {
        wrapper = mount(PlanDetails, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'plan-details',
                isReview: false
            },
            global: {
                stubs: {
                    PlanDetailsForm: {
                        template: '<div data-testid="plan-details-form"></div>',
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

    it('displays the plan details grid grid-cols-12 gap-4 grid-cols-12 gap-6 grid-cols-12 gap-12 when not editing', () => {
        const grid = wrapper.find('.grid');
        expect(grid.exists()).toBe(true);

        // Check plan name
        expect(wrapper.text()).toContain('Plan Name');
        expect(wrapper.text()).toContain('Test Plan');

        // Check domestic
        expect(wrapper.text()).toContain('Domestic');
        expect(wrapper.text()).toContain('Yes');

        // Check inbound
        expect(wrapper.text()).toContain('Inbound');
        expect(wrapper.text()).toContain('Yes');

        // Check authorized by
        expect(wrapper.text()).toContain('Authorized By');
        expect(wrapper.text()).toContain('John Doe');
    });

    it('does not display the plan details form when not editing', () => {
        const form = wrapper.find('[data-testid="plan-details-form"]');
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

describe('PlanDetails - Interaction Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        type: { value: 'domestic' },
        bound: { value: 'in' },
        authorized: { name: 'John Doe' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanDetails, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'plan-details',
                isReview: false
            },
            global: {
                stubs: {
                    PlanDetailsForm: {
                        template: '<div data-testid="plan-details-form"></div>',
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
            'plan-details',
            expect.any(Function)
        );
    });

    it('unregisters cancel callback on unmount', async () => {
        wrapper.unmount();
        expect(mockUnregisterCancelCallback).toHaveBeenCalledWith(
            'plan-details'
        );
    });

    it('enters edit mode when edit button is clicked', async () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        expect(wrapper.vm.isEditing).toBe(true);
        expect(mockSetActiveComponent).toHaveBeenCalledWith('plan-details');

        // Form should be visible in edit mode
        const form = wrapper.find('[data-testid="plan-details-form"]');
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
        const form = wrapper.find('[data-testid="plan-details-form"]');
        expect(form.exists()).toBe(false);
    });

    it('saves changes when save button is clicked', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            name: { en: 'Updated Plan' }
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
            name: { en: 'Updated Plan' }
        };
        await nextTick();

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        expect(mockHandleUnsavedChanges).toHaveBeenCalled();
        expect(wrapper.vm.isEditing).toBe(false);
    });
});

describe('PlanDetails - Review Mode Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        type: { value: 'domestic' },
        bound: { value: 'in' },
        authorized: { name: 'John Doe' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanDetails, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'plan-details',
                isReview: true
            },
            global: {
                stubs: {
                    PlanDetailsForm: {
                        template: '<div data-testid="plan-details-form"></div>',
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
            name: { en: 'Updated Plan' }
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
        // Change the route name to be different from 'Plan Details'
        const originalRouteName = mockRoute.name;
        mockRoute.name = 'Review Plan';

        try {
            // Enter edit mode first
            const editButton = wrapper.find('[data-testid="edit-button"]');
            await editButton.trigger('click');

            // Modify the data to simulate changes
            wrapper.vm.itemToUpdate = {
                ...mockData,
                name: { en: 'Updated Plan' }
            };
            await nextTick();

            // Now click save
            const saveButton = wrapper.find('[data-testid="save-button"]');
            await saveButton.trigger('click');

            expect(mockUpdatePlan).toHaveBeenCalledWith(
                '123',
                expect.any(Object)
            );
            expect(wrapper.vm.isEditing).toBe(false);
            expect(mockClearActiveComponent).toHaveBeenCalled();
            // With the proper mock of useRoute, it should emit 'reloadReviewPlanDetails'
            expect(mockEmit).toHaveBeenCalledWith('reloadReviewPlanDetails');
        } finally {
            // Restore the original route name
            mockRoute.name = originalRouteName;
        }
    });
});
