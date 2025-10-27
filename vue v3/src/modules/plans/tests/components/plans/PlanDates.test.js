import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PlanDates from '@/modules/plans/components/plans/PlanDates.vue';
import { nextTick } from 'vue';
import { useRoute } from 'vue-router';

// Mock the PlanStore
const mockUpdatePlan = vi.fn().mockResolvedValue({
    data: {
        id: '123',
        name: { en: 'Updated Plan' },
        periods: [
            {
                id: 1,
                name: 'Period 1',
                start_date: '2023-01-01',
                end_date: '2023-12-31'
            }
        ]
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
    })),
    provideEditState: vi.fn()
}));

describe('PlanDates - Rendering Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        periods: [
            {
                id: 1,
                name: 'Period 1',
                start_date: '2023-01-01',
                end_date: '2023-12-31'
            }
        ]
    };

    beforeEach(async () => {
        wrapper = mount(PlanDates, {
            props: {
                data: mockData,
                isNew: false,
                validateDates: false,
                componentId: 'plan-dates',
                isReview: false
            },
            global: {
                stubs: {
                    PeriodDatesForm: {
                        template: '<div data-testid="period-dates-form"></div>',
                        props: ['modelValue', 'isNew', 'validateDates'],
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
                }
            }
        });

        await nextTick();
    });

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('displays the period dates table when not editing', () => {
        const table = wrapper.find('table');
        expect(table.exists()).toBe(true);

        // Check table headers
        const headers = wrapper.findAll('th');
        expect(headers.length).toBe(3);
        expect(headers[0].text()).toBe('Period');
        expect(headers[1].text()).toBe('Start Date');
        expect(headers[2].text()).toBe('End Date');
    });

    it('does not display the period dates form when not editing', () => {
        const form = wrapper.find('[data-testid="period-dates-form"]');
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

describe('PlanDates - Interaction Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        periods: [
            {
                id: 1,
                name: 'Period 1',
                start_date: '2023-01-01',
                end_date: '2023-12-31'
            }
        ]
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanDates, {
            props: {
                data: mockData,
                isNew: false,
                validateDates: false,
                componentId: 'plan-dates',
                isReview: false
            },
            global: {
                stubs: {
                    PeriodDatesForm: {
                        template: '<div data-testid="period-dates-form"></div>',
                        props: ['modelValue', 'isNew', 'validateDates'],
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
                }
            }
        });

        await nextTick();
    });

    it('registers cancel callback on mount', () => {
        expect(mockRegisterCancelCallback).toHaveBeenCalledWith(
            'plan-dates',
            expect.any(Function)
        );
    });

    it('unregisters cancel callback on unmount', async () => {
        wrapper.unmount();
        expect(mockUnregisterCancelCallback).toHaveBeenCalledWith('plan-dates');
    });

    it('enters edit mode when edit button is clicked', async () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        expect(wrapper.vm.isEditing).toBe(true);
        expect(mockSetActiveComponent).toHaveBeenCalledWith('plan-dates');

        // Form should be visible in edit mode
        const form = wrapper.find('[data-testid="period-dates-form"]');
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
        const form = wrapper.find('[data-testid="period-dates-form"]');
        expect(form.exists()).toBe(false);
    });

    it('saves changes when save button is clicked', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            periods: [
                {
                    id: 1,
                    name: 'Updated Period',
                    start_date: '2023-02-01',
                    end_date: '2023-11-30'
                }
            ]
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
            periods: [
                {
                    id: 1,
                    name: 'Updated Period',
                    start_date: '2023-02-01',
                    end_date: '2023-11-30'
                }
            ]
        };
        await nextTick();

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        expect(mockHandleUnsavedChanges).toHaveBeenCalled();
        expect(wrapper.vm.isEditing).toBe(false);
    });
});

describe('PlanDates - Review Mode Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        periods: [
            {
                id: 1,
                name: 'Period 1',
                start_date: '2023-01-01',
                end_date: '2023-12-31'
            }
        ]
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        // Mock the route name to be different from 'Plan Details' for all tests in this describe block
        vi.mocked(useRoute).mockReturnValue({
            name: 'Review Plan'
        });

        wrapper = mount(PlanDates, {
            props: {
                data: mockData,
                isNew: false,
                validateDates: false,
                componentId: 'plan-dates',
                isReview: true
            },
            global: {
                stubs: {
                    PeriodDatesForm: {
                        template: '<div data-testid="period-dates-form"></div>',
                        props: ['modelValue', 'isNew', 'validateDates'],
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
            periods: [
                {
                    id: 1,
                    name: 'Updated Period',
                    start_date: '2023-02-01',
                    end_date: '2023-11-30'
                }
            ]
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
        // The route name is already mocked in beforeEach

        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            periods: [
                {
                    id: 1,
                    name: 'Updated Period',
                    start_date: '2023-02-01',
                    end_date: '2023-11-30'
                }
            ]
        };
        await nextTick();

        // Now click save
        const saveButton = wrapper.find('[data-testid="save-button"]');
        await saveButton.trigger('click');

        expect(mockUpdatePlan).toHaveBeenCalledWith('123', expect.any(Object));
        expect(wrapper.vm.isEditing).toBe(false);
        expect(mockClearActiveComponent).toHaveBeenCalled();
        // Now that we've properly mocked the route name, it should emit 'reloadReviewPlanDetails'
        expect(mockEmit).toHaveBeenCalledWith('reloadReviewPlanDetails');
    });
});
