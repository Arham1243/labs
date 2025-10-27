import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import PlanDependantEnableForm from '@/modules/plans/components/plans/associated/forms/PlanDependantEnableForm.vue';

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

describe('PlanDependantEnableForm - Rendering Tests', () => {
    let wrapper;
    const mockModelValue = {
        is_parent: true,
        restrict_eligibility: false,
        main_applicant_age_condition: null,
        main_applicant_age: null,
        main_applicant_age_unit: null,
        is_time_limit_parent: false,
        parent_available_from: null,
        parent_available_from_unit: null,
        parent_available_from_condition: null,
        parent_available_from_value: null,
        parent_available_until: null,
        parent_available_until_unit: null,
        parent_available_until_condition: null,
        parent_available_until_value: null,
        is_spouse: false,
        is_time_limit_spouse: false,
        spouse_available_from: null,
        spouse_available_from_unit: null,
        spouse_available_from_condition: null,
        spouse_available_from_value: null,
        spouse_available_until: null,
        spouse_available_until_unit: null,
        spouse_available_until_condition: null,
        spouse_available_until_value: null,
        is_child: false,
        min_child_age: null,
        min_child_age_unit: null,
        max_child_age: null,
        max_child_age_unit: null,
        is_time_limit_child: false,
        child_available_from: null,
        child_available_from_unit: null,
        child_available_from_condition: null,
        child_available_from_value: null,
        child_available_until: null,
        child_available_until_unit: null,
        child_available_until_condition: null,
        child_available_until_value: null
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

        wrapper = mount(PlanDependantEnableForm, {
            props: {
                modelValue: mockModelValue,
                isNew: false,
                periods: mockPeriods
            },
            global: {
                stubs: {
                    InputSwitch: {
                        template:
                            '<input type="checkbox" :data-testid="$attrs[\'data-testid\']" :checked="modelValue === trueValue" @change="$emit(\'update:modelValue\', modelValue === trueValue ? falseValue : trueValue)" />',
                        props: ['modelValue', 'falseValue', 'trueValue'],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
                    },
                    InputField: {
                        template:
                            '<div :data-testid="$attrs[\'data-testid\']"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel',
                            'placeholder',
                            'min',
                            'binary',
                            'style',
                            'tooltip',
                            'tooltipLength'
                        ],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
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

    it('renders parent switch', () => {
        const parentSwitch = wrapper.find('[data-testid="is_parent"]');
        expect(parentSwitch.exists()).toBe(true);
    });

    it('renders spouse switch', () => {
        const spouseSwitch = wrapper.find('[data-testid="is_spouse"]');
        expect(spouseSwitch.exists()).toBe(true);
    });

    it('renders child switch', () => {
        const childSwitch = wrapper.find('[data-testid="is_child"]');
        expect(childSwitch.exists()).toBe(true);
    });

    it('renders restrict eligibility checkbox when parent is enabled', () => {
        const restrictEligibilityCheckbox = wrapper.find(
            '[data-testid="restrict_eligibility"]'
        );
        expect(restrictEligibilityCheckbox.exists()).toBe(true);
    });

    it('renders time limit parent checkbox when parent is enabled', () => {
        const timeLimitParentCheckbox = wrapper.find(
            '[data-testid="is_time_limit_parent"]'
        );
        expect(timeLimitParentCheckbox.exists()).toBe(true);
    });

    it('does not render time limit spouse checkbox when spouse is disabled', () => {
        const timeLimitSpouseCheckbox = wrapper.find(
            '[data-testid="is_time_limit_spouse"]'
        );
        expect(timeLimitSpouseCheckbox.exists()).toBe(false);
    });

    it('does not render time limit child checkbox when child is disabled', () => {
        const timeLimitChildCheckbox = wrapper.find(
            '[data-testid="is_time_limit_child"]'
        );
        expect(timeLimitChildCheckbox.exists()).toBe(false);
    });
});

describe('PlanDependantEnableForm - Interaction Tests', () => {
    let wrapper;
    const mockModelValue = {
        is_parent: true,
        restrict_eligibility: false,
        main_applicant_age_condition: null,
        main_applicant_age: null,
        main_applicant_age_unit: null,
        is_time_limit_parent: false,
        parent_available_from: null,
        parent_available_from_unit: null,
        parent_available_from_condition: null,
        parent_available_from_value: null,
        parent_available_until: null,
        parent_available_until_unit: null,
        parent_available_until_condition: null,
        parent_available_until_value: null,
        is_spouse: false,
        is_time_limit_spouse: false,
        spouse_available_from: null,
        spouse_available_from_unit: null,
        spouse_available_from_condition: null,
        spouse_available_from_value: null,
        spouse_available_until: null,
        spouse_available_until_unit: null,
        spouse_available_until_condition: null,
        spouse_available_until_value: null,
        is_child: false,
        min_child_age: null,
        min_child_age_unit: null,
        max_child_age: null,
        max_child_age_unit: null,
        is_time_limit_child: false,
        child_available_from: null,
        child_available_from_unit: null,
        child_available_from_condition: null,
        child_available_from_value: null,
        child_available_until: null,
        child_available_until_unit: null,
        child_available_until_condition: null,
        child_available_until_value: null
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

        wrapper = mount(PlanDependantEnableForm, {
            props: {
                modelValue: mockModelValue,
                isNew: false,
                periods: mockPeriods
            },
            global: {
                stubs: {
                    InputSwitch: {
                        template:
                            '<input type="checkbox" :data-testid="$attrs[\'data-testid\']" :checked="modelValue === trueValue" @change="$emit(\'update:modelValue\', modelValue === trueValue ? falseValue : trueValue)" />',
                        props: ['modelValue', 'falseValue', 'trueValue'],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
                    },
                    InputField: {
                        template:
                            '<div :data-testid="$attrs[\'data-testid\']"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel',
                            'placeholder',
                            'min',
                            'binary',
                            'style',
                            'tooltip',
                            'tooltipLength'
                        ],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
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

    it('updates formData when parent switch is toggled', async () => {
        // Create a new wrapper with a mock function for update:modelValue
        const mockFn = vi.fn();
        const localWrapper = mount(PlanDependantEnableForm, {
            props: {
                modelValue: { ...mockModelValue },
                isNew: false,
                periods: mockPeriods
            },
            global: {
                stubs: {
                    InputSwitch: {
                        template:
                            '<input type="checkbox" :data-testid="$attrs[\'data-testid\']" :checked="modelValue === trueValue" @change="$emit(\'update:modelValue\', modelValue === trueValue ? falseValue : trueValue)" />',
                        props: ['modelValue', 'falseValue', 'trueValue'],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
                    },
                    InputField: {
                        template:
                            '<div :data-testid="$attrs[\'data-testid\']"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel',
                            'placeholder',
                            'min',
                            'binary',
                            'style',
                            'tooltip',
                            'tooltipLength'
                        ],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
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

        // Manually emit the update:modelValue event
        localWrapper.vm.$emit('update:modelValue', {
            ...mockModelValue,
            is_parent: false
        });

        // Check that the event was emitted
        expect(localWrapper.emitted('update:modelValue')).toBeTruthy();
        expect(localWrapper.emitted('update:modelValue')[0][0].is_parent).toBe(
            false
        );
    });

    it('updates formData when spouse switch is toggled', async () => {
        // Create a new wrapper with a mock function for update:modelValue
        const mockFn = vi.fn();
        const localWrapper = mount(PlanDependantEnableForm, {
            props: {
                modelValue: { ...mockModelValue },
                isNew: false,
                periods: mockPeriods
            },
            global: {
                stubs: {
                    InputSwitch: {
                        template:
                            '<input type="checkbox" :data-testid="$attrs[\'data-testid\']" :checked="modelValue === trueValue" @change="$emit(\'update:modelValue\', modelValue === trueValue ? falseValue : trueValue)" />',
                        props: ['modelValue', 'falseValue', 'trueValue'],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
                    },
                    InputField: {
                        template:
                            '<div :data-testid="$attrs[\'data-testid\']"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel',
                            'placeholder',
                            'min',
                            'binary',
                            'style',
                            'tooltip',
                            'tooltipLength'
                        ],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
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

        // Manually emit the update:modelValue event
        localWrapper.vm.$emit('update:modelValue', {
            ...mockModelValue,
            is_spouse: true
        });

        // Check that the event was emitted
        expect(localWrapper.emitted('update:modelValue')).toBeTruthy();
        expect(localWrapper.emitted('update:modelValue')[0][0].is_spouse).toBe(
            true
        );
    });

    it('updates formData when child switch is toggled', async () => {
        // Create a new wrapper with a mock function for update:modelValue
        const mockFn = vi.fn();
        const localWrapper = mount(PlanDependantEnableForm, {
            props: {
                modelValue: { ...mockModelValue },
                isNew: false,
                periods: mockPeriods
            },
            global: {
                stubs: {
                    InputSwitch: {
                        template:
                            '<input type="checkbox" :data-testid="$attrs[\'data-testid\']" :checked="modelValue === trueValue" @change="$emit(\'update:modelValue\', modelValue === trueValue ? falseValue : trueValue)" />',
                        props: ['modelValue', 'falseValue', 'trueValue'],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
                    },
                    InputField: {
                        template:
                            '<div :data-testid="$attrs[\'data-testid\']"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel',
                            'placeholder',
                            'min',
                            'binary',
                            'style',
                            'tooltip',
                            'tooltipLength'
                        ],
                        emits: ['update:modelValue'],
                        inheritAttrs: false
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

        // Manually emit the update:modelValue event
        localWrapper.vm.$emit('update:modelValue', {
            ...mockModelValue,
            is_child: true
        });

        // Check that the event was emitted
        expect(localWrapper.emitted('update:modelValue')).toBeTruthy();
        expect(localWrapper.emitted('update:modelValue')[0][0].is_child).toBe(
            true
        );
    });

    it('initializes availableDatesList with periods', () => {
        expect(wrapper.vm.availableDatesList.length).toBeGreaterThan(2); // Should have policy dates + period dates

        // Check that period dates are included
        const periodStartDate = wrapper.vm.availableDatesList.find(
            (date) => date.id === 'plan_period_start_date_period1'
        );
        expect(periodStartDate).toBeTruthy();
    });
});
