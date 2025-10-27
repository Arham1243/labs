import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import PlanActionWithSinglePeriodsForm from '@/modules/plans/components/plans/forms/PlanActionWithSinglePeriodsForm.vue';

// Mock the i18n composable
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => {
            const translations = {
                'common.policy_action_type_fixed': 'Fixed',
                'common.policy_action_type_open': 'Open',
                'common.no_plan_periods': 'No plan periods available'
            };
            return translations[key] || key;
        }
    })
}));

describe('PlanActionWithSinglePeriodsForm - Rendering Tests', () => {
    let wrapper;
    const mockModelValue = {
        id: '123',
        periods: [
            {
                id: '1',
                name: 'Period 1',
                start_date: '2023-01-01',
                end_date: '2023-12-31'
            }
        ],
        cancellation_periods: [
            {
                id: 0,
                name: 'Cancellation Period 1',
                days: 30,
                plan_period_precedence: 'before',
                plan_period_date_reference: 'start_date'
            }
        ],
        cancellation_type: { value: 'fixed' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanActionWithSinglePeriodsForm, {
            props: {
                modelValue: mockModelValue,
                isNew: false,
                planAction: 'cancellation_periods',
                planActionType: 'cancellation_type'
            },
            global: {
                stubs: {
                    InputField: {
                        template:
                            '<div data-testid="input-field"><slot /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel'
                        ],
                        emits: ['update:modelValue', 'change']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'icon',
                            'label',
                            'text',
                            'disabled',
                            'dataTestid'
                        ],
                        emits: ['click']
                    },
                    PolicyCancellationDatesForm: {
                        template:
                            '<div data-testid="policy-cancellation-dates-form"><slot /></div>',
                        props: ['modelValue', 'isNew', 'periods', 'periodName'],
                        emits: ['update:modelValue', 'remove']
                    }
                },
                mocks: {
                    $t: (key) => {
                        const translations = {
                            'common.policy_action_type_fixed': 'Fixed',
                            'common.policy_action_type_open': 'Open',
                            'common.no_plan_periods':
                                'No plan periods available'
                        };
                        return translations[key] || key;
                    }
                }
            }
        });

        await nextTick();
    });

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('renders the select button for cancellation type', () => {
        const selectButton = wrapper.findByTestId('cancellation_type');
        expect(selectButton.exists()).toBe(true);
    });

    it('renders PolicyCancellationDatesForm for each period when type is fixed', () => {
        const cancellationForms = wrapper.findAll(
            '[data-testid="policy-cancellation-dates-form"]'
        );
        expect(cancellationForms.length).toBe(1);
    });

    it('renders add period button when periods are less than 10', () => {
        const addButton = wrapper.findByTestId('add-period');
        expect(addButton.exists()).toBe(true);
    });

    it('does not render add period button when periods are 10', async () => {
        // Create a new wrapper with 10 cancellation periods
        const tenPeriods = Array(10)
            .fill()
            .map((_, i) => ({
                id: i,
                name: `Cancellation Period ${i + 1}`,
                days: 30,
                plan_period_precedence: 'before',
                plan_period_date_reference: 'start_date'
            }));

        const newWrapper = mount(PlanActionWithSinglePeriodsForm, {
            props: {
                modelValue: {
                    ...mockModelValue,
                    cancellation_periods: tenPeriods
                },
                isNew: false,
                planAction: 'cancellation_periods',
                planActionType: 'cancellation_type'
            },
            global: {
                stubs: {
                    InputField: {
                        template:
                            '<div data-testid="input-field"><slot /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel'
                        ],
                        emits: ['update:modelValue', 'change']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'icon',
                            'label',
                            'text',
                            'disabled',
                            'dataTestid'
                        ],
                        emits: ['click']
                    },
                    PolicyCancellationDatesForm: {
                        template:
                            '<div data-testid="policy-cancellation-dates-form"><slot /></div>',
                        props: ['modelValue', 'isNew', 'periods', 'periodName'],
                        emits: ['update:modelValue', 'remove']
                    }
                },
                mocks: {
                    $t: (key) => {
                        const translations = {
                            'common.policy_action_type_fixed': 'Fixed',
                            'common.policy_action_type_open': 'Open',
                            'common.no_plan_periods':
                                'No plan periods available'
                        };
                        return translations[key] || key;
                    }
                }
            }
        });

        await nextTick();

        const addButton = newWrapper.findByTestId('add-period');
        expect(addButton.exists()).toBe(false);
    });

    it('shows warning message when there are no plan periods', async () => {
        // Create a new wrapper with no plan periods
        const newWrapper = mount(PlanActionWithSinglePeriodsForm, {
            props: {
                modelValue: {
                    ...mockModelValue,
                    periods: []
                },
                isNew: false,
                planAction: 'cancellation_periods',
                planActionType: 'cancellation_type'
            },
            global: {
                stubs: {
                    InputField: {
                        template:
                            '<div data-testid="input-field"><slot /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel'
                        ],
                        emits: ['update:modelValue', 'change']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'icon',
                            'label',
                            'text',
                            'disabled',
                            'dataTestid'
                        ],
                        emits: ['click']
                    },
                    PolicyCancellationDatesForm: {
                        template:
                            '<div data-testid="policy-cancellation-dates-form"><slot /></div>',
                        props: ['modelValue', 'isNew', 'periods', 'periodName'],
                        emits: ['update:modelValue', 'remove']
                    }
                },
                mocks: {
                    $t: (key) => {
                        const translations = {
                            'common.policy_action_type_fixed': 'Fixed',
                            'common.policy_action_type_open': 'Open',
                            'common.no_plan_periods':
                                'No plan periods available'
                        };
                        return translations[key] || key;
                    }
                }
            }
        });

        await nextTick();

        const warningMessage = newWrapper.findByTestId('warning-message');
        expect(warningMessage.exists()).toBe(true);
        expect(warningMessage.text()).toContain('No plan periods available');
    });

    it('does not render cancellation forms when type is not fixed', async () => {
        // Create a new wrapper with open cancellation type
        const newWrapper = mount(PlanActionWithSinglePeriodsForm, {
            props: {
                modelValue: {
                    ...mockModelValue,
                    cancellation_type: { value: 'open' }
                },
                isNew: false,
                planAction: 'cancellation_periods',
                planActionType: 'cancellation_type'
            },
            global: {
                stubs: {
                    InputField: {
                        template:
                            '<div data-testid="input-field"><slot /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel'
                        ],
                        emits: ['update:modelValue', 'change']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'icon',
                            'label',
                            'text',
                            'disabled',
                            'dataTestid'
                        ],
                        emits: ['click']
                    },
                    PolicyCancellationDatesForm: {
                        template:
                            '<div data-testid="policy-cancellation-dates-form"><slot /></div>',
                        props: ['modelValue', 'isNew', 'periods', 'periodName'],
                        emits: ['update:modelValue', 'remove']
                    }
                },
                mocks: {
                    $t: (key) => {
                        const translations = {
                            'common.policy_action_type_fixed': 'Fixed',
                            'common.policy_action_type_open': 'Open',
                            'common.no_plan_periods':
                                'No plan periods available'
                        };
                        return translations[key] || key;
                    }
                }
            }
        });

        await nextTick();

        const cancellationForms = newWrapper.findAll(
            '[data-testid="policy-cancellation-dates-form"]'
        );
        expect(cancellationForms.length).toBe(0);
    });
});

describe('PlanActionWithSinglePeriodsForm - Interaction Tests', () => {
    let wrapper;
    const mockModelValue = {
        id: '123',
        periods: [
            {
                id: '1',
                name: 'Period 1',
                start_date: '2023-01-01',
                end_date: '2023-12-31'
            }
        ],
        cancellation_periods: [
            {
                id: 0,
                name: 'Cancellation Period 1',
                days: 30,
                plan_period_precedence: 'before',
                plan_period_date_reference: 'start_date'
            }
        ],
        cancellation_type: { value: 'fixed' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanActionWithSinglePeriodsForm, {
            props: {
                modelValue: mockModelValue,
                isNew: false,
                planAction: 'cancellation_periods',
                planActionType: 'cancellation_type'
            },
            global: {
                stubs: {
                    InputField: {
                        template:
                            '<div data-testid="input-field"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @change="$emit(\'change\', {value: $event.target.value})" /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel'
                        ],
                        emits: ['update:modelValue', 'change']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'icon',
                            'label',
                            'text',
                            'disabled',
                            'dataTestid'
                        ],
                        emits: ['click']
                    },
                    PolicyCancellationDatesForm: {
                        template:
                            '<div data-testid="policy-cancellation-dates-form"><button data-testid="remove-button" @click="$emit(\'remove\')">Remove</button><button data-testid="update-button" @click="$emit(\'update:modelValue\', {id: modelValue.id, name: \'Updated Period\', days: 45, plan_period_precedence: \'after\', plan_period_date_reference: \'end_date\'})">Update</button></div>',
                        props: ['modelValue', 'isNew', 'periods', 'periodName'],
                        emits: ['update:modelValue', 'remove']
                    }
                },
                mocks: {
                    $t: (key) => {
                        const translations = {
                            'common.policy_action_type_fixed': 'Fixed',
                            'common.policy_action_type_open': 'Open',
                            'common.no_plan_periods':
                                'No plan periods available'
                        };
                        return translations[key] || key;
                    }
                }
            }
        });

        await nextTick();
    });

    it('adds a new period when add button is clicked', async () => {
        const addButton = wrapper.findByTestId('add-period');
        await addButton.trigger('click');

        // Check that a new period was added
        expect(wrapper.vm.formData.cancellation_periods.length).toBe(2);
        expect(wrapper.vm.formData.cancellation_periods[1]).toEqual({
            id: 1,
            name: '',
            days: null,
            plan_period_precedence: null,
            plan_period_date_reference: null
        });
    });

    it('removes a period when remove is triggered from PolicyCancellationDatesForm', async () => {
        const removeButton = wrapper.findByTestId('remove-button');
        await removeButton.trigger('click');

        // Check that the period was removed
        expect(wrapper.vm.formData.cancellation_periods.length).toBe(1);
    });

    it('updates a period when update is triggered from PolicyCancellationDatesForm', async () => {
        const updateButton = wrapper.findByTestId('update-button');
        await updateButton.trigger('click');

        // Check that the period was updated
        expect(wrapper.vm.formData.cancellation_periods[0]).toEqual({
            id: 0,
            name: 'Updated Period',
            days: 45,
            plan_period_precedence: 'after',
            plan_period_date_reference: 'end_date'
        });
    });

    it('updates formData when addPeriod is called', async () => {
        // Use addPeriod to update formData
        wrapper.vm.addPeriod();
        await nextTick();

        // Check that formData was updated correctly
        expect(wrapper.vm.formData.cancellation_periods.length).toBe(2);
        expect(wrapper.vm.formData.cancellation_periods[1]).toEqual({
            id: 1,
            name: '',
            days: null,
            plan_period_precedence: null,
            plan_period_date_reference: null
        });
    });

    it('prevents empty value in cancellation_type', async () => {
        // Set a value first
        wrapper.vm.formData.cancellation_type = { value: 'open' };
        await nextTick();

        // Try to set null value
        wrapper.vm.preventEmpty({ value: null });
        await nextTick();

        // Check that the value was not changed to null
        expect(wrapper.vm.formData.cancellation_type).toEqual({
            value: 'fixed'
        });
    });

    it('reindexes periods when a period is removed', async () => {
        // Add a second period
        await wrapper.vm.addPeriod();

        // Remove the first period
        const removeButton = wrapper.findByTestId('remove-button');
        await removeButton.trigger('click');

        // Check that the remaining period has id 0
        expect(wrapper.vm.formData.cancellation_periods.length).toBe(2);
        expect(wrapper.vm.formData.cancellation_periods[0].id).toBe(0);
    });
});
