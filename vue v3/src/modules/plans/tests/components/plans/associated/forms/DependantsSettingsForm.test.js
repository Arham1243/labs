import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import DependantsSettingsForm from '@/modules/plans/components/plans/associated/forms/DependantsSettingsForm.vue';

// Mock the stores
const mockSearchUsers = vi.fn().mockResolvedValue({ data: [] });

vi.mock('@/stores', () => ({
    useUserStore: () => ({
        searchUsers: mockSearchUsers
    }),
    useGlobalStore: () => ({
        errors: null
    })
}));

// Mock the ViewPricingDialogComponent
vi.mock(
    '@/modules/plans/components/plans/associated/dialogs/ViewPricingDialog.vue',
    () => ({
        default: {
            name: 'ViewPricingDialogComponent',
            template: '<div>Mock Dialog</div>',
            props: ['modelValue', 'item', 'id'],
            emits: ['update:modelValue']
        }
    })
);

describe('DependantsSettingsForm - Rendering Tests', () => {
    let wrapper;
    const mockModelValue = {
        max_num_of_dependants: 5,
        apply_pricing_discount: 1,
        enforce_start_date: 1,
        enforce_end_date: 0,
        pricing_discounts: [
            {
                percentage: 10,
                condition: { name: 'More than', code: 'more_than' },
                num_of_dependants: 2
            }
        ]
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(DependantsSettingsForm, {
            props: {
                modelValue: mockModelValue,
                isNew: false,
                id: 'test-id'
            },
            global: {
                stubs: {
                    InputNumber: {
                        template:
                            '<input type="number" :data-testid="dataTestid" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
                        props: [
                            'modelValue',
                            'showButtons',
                            'buttonLayout',
                            'min',
                            'max',
                            'dataTestid'
                        ],
                        emits: ['update:modelValue']
                    },
                    InputSwitch: {
                        template:
                            '<input type="checkbox" :data-testid="dataTestid" :checked="modelValue === trueValue" @change="$emit(\'update:modelValue\', modelValue === trueValue ? falseValue : trueValue)" />',
                        props: [
                            'modelValue',
                            'falseValue',
                            'trueValue',
                            'dataTestid'
                        ],
                        emits: ['update:modelValue', 'change']
                    },
                    InputField: {
                        template:
                            '<div><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'variant',
                            'modelValue',
                            'options',
                            'optionLabel',
                            'min',
                            'max',
                            'iconAfter'
                        ],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'label',
                            'disabled',
                            'outlined',
                            'icon',
                            'text',
                            'class',
                            'dataTestid'
                        ],
                        emits: ['click']
                    }
                },
                mocks: {
                    $t: (key) => {
                        const translations = {
                            'plans.maximum_dependant': 'Maximum Dependants',
                            'plans.apply_pricing_discount':
                                'Apply Pricing Discount',
                            'plans.discount_for_of_dependant':
                                'Discount for Dependants',
                            'plans.new_price_condition': 'New Price Condition',
                            'plans.enforce_main_applicant_start_date':
                                'Enforce Main Applicant Start Date',
                            'plans.enforce_main_applicant_end_date':
                                'Enforce Main Applicant End Date',
                            'plans.more_than': 'More than',
                            'plans.less_than': 'Less than',
                            'plans.equal_to': 'Equal to'
                        };
                        return translations[key] || key;
                    }
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

    it('renders maximum dependants field', () => {
        const maxDependantsField = wrapper.find(
            '[data-testid="max_num_of_dependants"]'
        );
        expect(maxDependantsField.exists()).toBe(true);
        expect(maxDependantsField.attributes('value')).toBe('5');
    });

    it('renders apply pricing discount switch', () => {
        const applyPricingSwitch = wrapper.find(
            '[data-testid="apply_pricing_discount"]'
        );
        expect(applyPricingSwitch.exists()).toBe(true);
        expect(applyPricingSwitch.attributes('checked')).toBeDefined();
    });

    it('renders enforce start date switch', () => {
        const enforceStartDateSwitch = wrapper.find(
            '[data-testid="enforce_start_date"]'
        );
        expect(enforceStartDateSwitch.exists()).toBe(true);
        expect(enforceStartDateSwitch.attributes('checked')).toBeDefined();
    });

    it('renders enforce end date switch', () => {
        const enforceEndDateSwitch = wrapper.find(
            '[data-testid="enforce_end_date"]'
        );
        expect(enforceEndDateSwitch.exists()).toBe(true);
    });

    it('renders pricing discounts section when apply_pricing_discount is true', () => {
        const addDiscountButton = wrapper.find(
            '[data-testid="add-discount-button"]'
        );
        expect(addDiscountButton.exists()).toBe(true);
    });

    it('renders view pricing button', () => {
        const viewPricingButton = wrapper.find(
            '[data-testid="view-pricing-button"]'
        );
        expect(viewPricingButton.exists()).toBe(true);
    });

    it('renders remove discount button', () => {
        const removeDiscountButton = wrapper.find(
            '[data-testid="remove-discount-button"]'
        );
        expect(removeDiscountButton.exists()).toBe(true);
        // Button should be disabled when there's only one discount
        expect(removeDiscountButton.attributes('disabled')).toBeDefined();
    });
});

describe('DependantsSettingsForm - Additional Tests', () => {
    it('has the correct props', () => {
        const wrapper = mount(DependantsSettingsForm, {
            props: {
                modelValue: {
                    max_num_of_dependants: 5,
                    apply_pricing_discount: 1,
                    enforce_start_date: 1,
                    enforce_end_date: 0,
                    pricing_discounts: []
                },
                isNew: false,
                id: 'test-id'
            },
            global: {
                stubs: {
                    InputNumber: true,
                    InputSwitch: true,
                    InputField: true,
                    Button: true,
                    ViewPricingDialogComponent: true
                },
                mocks: {
                    $t: (key) => key
                },
                directives: {
                    tooltip: {}
                }
            }
        });

        expect(wrapper.props('modelValue')).toEqual({
            max_num_of_dependants: 5,
            apply_pricing_discount: 1,
            enforce_start_date: 1,
            enforce_end_date: 0,
            pricing_discounts: []
        });
        expect(wrapper.props('isNew')).toBe(false);
        expect(wrapper.props('id')).toBe('test-id');
    });

    it('initializes formData with modelValue', () => {
        const modelValue = {
            max_num_of_dependants: 5,
            apply_pricing_discount: 1,
            enforce_start_date: 1,
            enforce_end_date: 0,
            pricing_discounts: []
        };

        const wrapper = mount(DependantsSettingsForm, {
            props: {
                modelValue,
                isNew: false,
                id: 'test-id'
            },
            global: {
                stubs: {
                    InputNumber: true,
                    InputSwitch: true,
                    InputField: true,
                    Button: true,
                    ViewPricingDialogComponent: true
                },
                mocks: {
                    $t: (key) => key
                },
                directives: {
                    tooltip: {}
                }
            }
        });

        expect(wrapper.vm.formData).toEqual(modelValue);
    });

    it('has methods for managing pricing discounts', () => {
        const wrapper = mount(DependantsSettingsForm, {
            props: {
                modelValue: {
                    max_num_of_dependants: 5,
                    apply_pricing_discount: 1,
                    enforce_start_date: 1,
                    enforce_end_date: 0,
                    pricing_discounts: [
                        {
                            percentage: 10,
                            condition: { name: 'More than', code: 'more_than' },
                            num_of_dependants: 2
                        }
                    ]
                },
                isNew: false,
                id: 'test-id'
            },
            global: {
                stubs: {
                    InputNumber: true,
                    InputSwitch: true,
                    InputField: true,
                    Button: true,
                    ViewPricingDialogComponent: true
                },
                mocks: {
                    $t: (key) => key
                },
                directives: {
                    tooltip: {}
                }
            }
        });

        // Check that the methods exist
        expect(typeof wrapper.vm.addPricingDiscount).toBe('function');
        expect(typeof wrapper.vm.removePricingDiscount).toBe('function');
        expect(typeof wrapper.vm.setViewPricingDialog).toBe('function');
        expect(typeof wrapper.vm.handleApplyPricingSwitch).toBe('function');
    });
});
