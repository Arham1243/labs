import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import PlanDatesForm from '@/modules/plans/components/plans/associated/forms/PlanDatesForm.vue';

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

describe('PlanDatesForm - Rendering Tests', () => {
    let wrapper;
    const mockModelValue = {
        category: { name: 'Early Arrivals', code: 'early_arrivals' },
        early_arrivals_type: 'open',
        early_arrivals_min_days: 10,
        early_arrivals_max_days: 30,
        early_arrivals_periods: []
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

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanDatesForm, {
            props: {
                modelValue: mockModelValue,
                isNew: false,
                planCategory: 'early_arrivals',
                periods: mockPeriods
            },
            global: {
                stubs: {
                    InputField: {
                        template:
                            '<div :data-testid="dataTestid"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel',
                            'placeholder',
                            'min',
                            'addon-after',
                            'dataTestid',
                            'value',
                            'name',
                            'tooltip'
                        ],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'icon',
                            'class',
                            'text',
                            'disabled',
                            'label',
                            'dataTestid'
                        ],
                        emits: ['click']
                    }
                },
                mocks: {
                    $t: (key) => key
                },
                directives: {
                    tooltip: {}
                }
            }
        });

        await nextTick();
    });

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('renders date type radio buttons', () => {
        const openRadio = wrapper.find('[data-testid="date-type-open"]');
        const fixedRadio = wrapper.find('[data-testid="date-type-fixed"]');

        expect(openRadio.exists()).toBe(true);
        expect(fixedRadio.exists()).toBe(true);
    });

    it('renders min and max days fields when type is open', () => {
        const minDaysField = wrapper.find(
            '[data-testid="early_arrivals_min_days"]'
        );
        const maxDaysField = wrapper.find(
            '[data-testid="early_arrivals_max_days"]'
        );

        expect(minDaysField.exists()).toBe(true);
        expect(maxDaysField.exists()).toBe(true);
    });

    it('does not render periods section when type is open', () => {
        const addNewPeriodButton = wrapper.find(
            '[data-testid="add-new-period"]'
        );
        expect(addNewPeriodButton.exists()).toBe(false);
    });

    it('renders periods section when type is fixed', async () => {
        // Change type to fixed by directly modifying the formData
        wrapper.vm.formData.early_arrivals_type = 'fixed';
        wrapper.vm.formData.early_arrivals_periods = [
            {
                days: 15,
                plan_period_id: { id: 'period1', name: 'Period 1' },
                plan_period_precedence: { name: 'After', value: 'after' },
                plan_period_date_reference: {
                    name: 'Start Date',
                    value: 'start_date'
                }
            }
        ];
        await nextTick();

        const addNewPeriodButton = wrapper.find(
            '[data-testid="add-new-period"]'
        );
        expect(addNewPeriodButton.exists()).toBe(true);
    });
});

describe('PlanDatesForm - Interaction Tests', () => {
    let wrapper;
    const mockModelValue = {
        category: { name: 'Early Arrivals', code: 'early_arrivals' },
        early_arrivals_type: 'open',
        early_arrivals_min_days: 10,
        early_arrivals_max_days: 30,
        early_arrivals_periods: []
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

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanDatesForm, {
            props: {
                modelValue: mockModelValue,
                isNew: false,
                planCategory: 'early_arrivals',
                periods: mockPeriods
            },
            global: {
                stubs: {
                    InputField: {
                        template:
                            '<div :data-testid="dataTestid"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel',
                            'placeholder',
                            'min',
                            'addon-after',
                            'dataTestid',
                            'value',
                            'name',
                            'tooltip'
                        ],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'icon',
                            'class',
                            'text',
                            'disabled',
                            'label',
                            'dataTestid'
                        ],
                        emits: ['click']
                    }
                },
                mocks: {
                    $t: (key) => key
                },
                directives: {
                    tooltip: {}
                }
            }
        });

        await nextTick();
    });

    it('emits update:modelValue when formData changes', async () => {
        // Change min days
        wrapper.vm.formData.early_arrivals_min_days = 15;
        await nextTick();

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(
            wrapper.emitted('update:modelValue')[0][0].early_arrivals_min_days
        ).toBe(15);
    });

    it('switches between open and fixed types', async () => {
        // Initially open type
        expect(wrapper.vm.formData.early_arrivals_type).toBe('open');

        // Change to fixed type
        wrapper.vm.formData.early_arrivals_type = 'fixed';
        await nextTick();

        expect(
            wrapper.emitted('update:modelValue')[0][0].early_arrivals_type
        ).toBe('fixed');
    });

    it('adds a new period when addNewPeriod is called', async () => {
        // Change to fixed type first
        wrapper.vm.formData.early_arrivals_type = 'fixed';
        await nextTick();

        // Call addNewPeriod
        wrapper.vm.addNewPeriod();
        await nextTick();

        expect(wrapper.vm.formData.early_arrivals_periods.length).toBe(1);
        expect(wrapper.vm.formData.early_arrivals_periods[0]).toEqual({
            plan_period_id: null,
            days: null,
            plan_period_precedence: 'after',
            plan_period_date_reference: null
        });
    });

    it('removes a period when remove is called', async () => {
        // Change to fixed type and add a period
        wrapper.vm.formData.early_arrivals_type = 'fixed';
        wrapper.vm.formData.early_arrivals_periods = [
            {
                days: 15,
                plan_period_id: { id: 'period1', name: 'Period 1' },
                plan_period_precedence: { name: 'After', value: 'after' },
                plan_period_date_reference: {
                    name: 'Start Date',
                    value: 'start_date'
                }
            }
        ];
        await nextTick();

        // Call remove
        wrapper.vm.remove(wrapper.vm.formData.early_arrivals_periods[0]);
        await nextTick();

        expect(wrapper.vm.formData.early_arrivals_periods.length).toBe(0);
    });

    it('updates period date reference options when period is selected', async () => {
        // Change to fixed type and add a period
        wrapper.vm.formData.early_arrivals_type = 'fixed';
        wrapper.vm.formData.early_arrivals_periods = [
            {
                days: 15,
                plan_period_id: { id: 'period1', name: 'Period 1' },
                plan_period_precedence: { name: 'After', value: 'after' },
                plan_period_date_reference: null
            }
        ];
        await nextTick();

        // Manually call updatePeriodDateRefereneOptions
        wrapper.vm.updatePeriodDateRefereneOptions();
        await nextTick();

        expect(wrapper.vm.periodDateReferenceOptions.length).toBe(1);
        expect(wrapper.vm.periodDateReferenceOptions[0].length).toBe(2); // start_date and end_date options
    });
});
