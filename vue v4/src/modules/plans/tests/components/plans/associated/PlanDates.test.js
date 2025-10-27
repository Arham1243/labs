import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import PlanDates from '@/modules/plans/components/plans/associated/PlanDates.vue';
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

// Mock the PlanDatesForm component
vi.mock(
    '@/modules/plans/components/plans/associated/forms/PlanDatesForm.vue',
    () => ({
        default: {
            name: 'PlanDatesForm',
            template: '<div>Mock Form</div>',
            props: ['modelValue', 'isNew', 'planCategory', 'periods'],
            emits: ['update:modelValue', 'save']
        }
    })
);

// Mock the useHelpers composable
vi.mock('@/composables', () => ({
    useHelpers: () => ({
        formatDate: (date, format) =>
            date ? new Date(date).toLocaleDateString() : ''
    })
}));

// Mock the useI18n composable
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('PlanDates', () => {
    let wrapper;
    const mockUpdateAssociatedPlan = vi.fn().mockResolvedValue({});
    const mockTransferPayload = vi.fn().mockImplementation((data) => data);

    const mockData = {
        id: '1',
        category: { name: 'Early Arrivals', code: 'early_arrivals' },
        early_arrivals_type: 'period',
        early_arrivals_min_days: 10,
        early_arrivals_max_days: 30,
        early_arrivals_periods: [
            {
                days: 15,
                plan_period_id: {
                    id: 'period1',
                    name: 'Period 1',
                    start_date: '2023-01-01',
                    end_date: '2023-12-31'
                },
                plan_period_precedence: { name: 'After', value: 'after' },
                plan_period_date_reference: {
                    name: 'Start Date (1 Jan)',
                    value: 'start_date'
                }
            }
        ],
        gap_periods: []
    };

    const mockPeriods = [
        {
            id: 'period1',
            name: 'Period 1',
            start_date: '2023-01-01',
            end_date: '2023-12-31'
        },
        {
            id: 'period2',
            name: 'Period 2',
            start_date: '2023-02-01',
            end_date: '2023-11-30'
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();

        vi.mocked(AssociatedPlanStore.useAssociatedPlanStore).mockReturnValue({
            updateAssociatedPlan: mockUpdateAssociatedPlan,
            transferPayload: mockTransferPayload,
            currentPlan: { id: '1' }
        });

        wrapper = mount(PlanDates, {
            props: {
                data: mockData,
                isNew: false,
                plan: 'test-plan',
                periods: mockPeriods,
                componentId: 'plan-dates',
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

    it('should render the component with plan dates', () => {
        expect(wrapper.find('h5').text()).toContain('Early Arrivals');
        expect(wrapper.text()).toContain('common.settings');
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

    it('should not have a disabled attribute on save button when isNotChanged is false', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        wrapper.vm.itemToUpdate = {
            ...wrapper.vm.itemToUpdate,
            early_arrivals_min_days: 15
        };
        await nextTick();

        // After clicking edit, isNotChanged is false, so the button should not be disabled
        const saveButton = wrapper.find('[data-testid="save-button"]');
        expect(wrapper.vm.isNotChanged).toBe(false);
        expect(saveButton.attributes('disabled')).toBeFalsy();
    });

    it('should enable save button when changes are made', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        // Simulate form update
        wrapper.vm.itemToUpdate = {
            ...mockData,
            early_arrivals_min_days: 15
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
            early_arrivals_min_days: 15
        };
        await nextTick();

        await wrapper.find('[data-testid="save-button"]').trigger('click');

        expect(mockUpdateAssociatedPlan).toHaveBeenCalledWith(
            'test-plan',
            '1',
            { ...mockData, early_arrivals_min_days: 15 }
        );
    });

    it('should handle cancel when editing with changes', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        // Simulate form update
        wrapper.vm.itemToUpdate = {
            ...mockData,
            early_arrivals_min_days: 15
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

    it('should render PlanDatesForm when editing', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        const form = wrapper.findComponent({ name: 'PlanDatesForm' });
        expect(form.exists()).toBe(true);
        expect(form.props('modelValue')).toEqual(
            expect.objectContaining({
                category: { name: 'Early Arrivals', code: 'early_arrivals' }
            })
        );
        expect(form.props('planCategory')).toBe('early_arrivals');
        expect(form.props('periods')).toEqual(mockPeriods);
    });

    it('should handle save event from PlanDatesForm', async () => {
        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        const form = wrapper.findComponent({ name: 'PlanDatesForm' });
        await form.vm.$emit('save');

        expect(mockUpdateAssociatedPlan).toHaveBeenCalled();
    });

    it('should display period information when not editing and type is period', () => {
        expect(wrapper.text()).toContain('15 days');
        expect(wrapper.text()).toContain('Period 1');
    });

    it('should display min/max days when not editing and type is open', async () => {
        // Update the data to use 'open' type
        await wrapper.setProps({
            data: {
                ...mockData,
                early_arrivals_type: 'open'
            }
        });

        expect(wrapper.text()).toContain('10');
        expect(wrapper.text()).toContain('30');
        expect(wrapper.text()).toContain('common.days');
    });
});
