import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import PlanDetailsForm from '@/modules/plans/components/plans/associated/forms/PlanDetailsForm.vue';

// Mock the stores
const mockSearchCompanyUsers = vi.fn().mockResolvedValue({ data: [] });

vi.mock('@/stores', () => ({
    useCommonStore: () => ({
        searchCompanyUsers: mockSearchCompanyUsers
    })
}));

describe('PlanDetailsForm - Rendering Tests', () => {
    let wrapper;
    const mockModelValue = {
        category: { name: 'Early Arrivals', code: 'early_arrivals' },
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        authorized: { name: 'Test User', id: '123' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanDetailsForm, {
            props: {
                modelValue: mockModelValue,
                isNew: false
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
                            'disabled',
                            'dataTestid'
                        ],
                        emits: ['update:modelValue']
                    },
                    DatePicker: {
                        template:
                            '<input type="date" :data-testid="dataTestid" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
                        props: ['id', 'modelValue', 'dataTestid'],
                        emits: ['update:modelValue']
                    },
                    ApiDropdown: {
                        template:
                            '<div :data-testid="dataTestid"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'id',
                            'optionLabel',
                            'modelValue',
                            'loading',
                            'items',
                            'dataTestid'
                        ],
                        emits: ['update:modelValue', 'search']
                    }
                },
                mocks: {
                    $t: (key) => {
                        const translations = {
                            'common.category': 'Category',
                            'common.effective_date': 'Effective Date',
                            'common.end_date': 'End Date',
                            'common.authorized_by': 'Authorized By',
                            'common.select': 'Select',
                            'common.early_arrivals': 'Early Arrivals',
                            'common.gap': 'Gap',
                            'common.dependants': 'Dependants',
                            'common.recent_graduate': 'Recent Graduate'
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

    it('renders category field', () => {
        const categoryField = wrapper.find('[data-testid="category"]');
        expect(categoryField.exists()).toBe(true);
    });

    it('renders effective date field', () => {
        const effectiveDateField = wrapper.find('[data-testid="effective_date"] input');
        expect(effectiveDateField.exists()).toBe(true);
        expect(effectiveDateField.attributes('value')).toBe('2023-01-01');
    });

    it('renders end date field', () => {
        const endDateField = wrapper.find('[data-testid="end_date"] input');
        expect(endDateField.exists()).toBe(true);
        expect(endDateField.attributes('value')).toBe('2023-12-31');
    });

    it('renders authorized by field', () => {
        const authorizedByField = wrapper.find(
            '[data-testid="authorized_by_id"]'
        );
        expect(authorizedByField.exists()).toBe(true);
    });
});

describe('PlanDetailsForm - Additional Tests', () => {
    it('has the correct props', () => {
        const wrapper = mount(PlanDetailsForm, {
            props: {
                modelValue: {
                    category: {
                        name: 'Early Arrivals',
                        code: 'early_arrivals'
                    },
                    effective_date: '2023-01-01',
                    end_date: '2023-12-31',
                    authorized: { name: 'Test User', id: '123' }
                },
                isNew: false
            },
            global: {
                stubs: {
                    InputField: true,
                    DatePicker: true,
                    ApiDropdown: true
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        expect(wrapper.props('modelValue')).toEqual({
            category: { name: 'Early Arrivals', code: 'early_arrivals' },
            effective_date: '2023-01-01',
            end_date: '2023-12-31',
            authorized: { name: 'Test User', id: '123' }
        });
        expect(wrapper.props('isNew')).toBe(false);
    });

    it('initializes formData with modelValue', () => {
        const modelValue = {
            category: { name: 'Early Arrivals', code: 'early_arrivals' },
            effective_date: '2023-01-01',
            end_date: '2023-12-31',
            authorized: { name: 'Test User', id: '123' }
        };

        const wrapper = mount(PlanDetailsForm, {
            props: {
                modelValue,
                isNew: false
            },
            global: {
                stubs: {
                    InputField: true,
                    DatePicker: true,
                    ApiDropdown: true
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        expect(wrapper.vm.formData).toEqual(modelValue);
    });

    it('initializes categories with correct values', () => {
        const wrapper = mount(PlanDetailsForm, {
            props: {
                modelValue: {
                    category: {
                        name: 'Early Arrivals',
                        code: 'early_arrivals'
                    },
                    effective_date: '2023-01-01',
                    end_date: '2023-12-31',
                    authorized: { name: 'Test User', id: '123' }
                },
                isNew: false
            },
            global: {
                stubs: {
                    InputField: true,
                    DatePicker: true,
                    ApiDropdown: true
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        expect(wrapper.vm.categories.length).toBe(4);
        expect(wrapper.vm.categories[0].code).toBe('early_arrivals');
        expect(wrapper.vm.categories[1].code).toBe('gap');
        expect(wrapper.vm.categories[2].code).toBe('dependants');
        expect(wrapper.vm.categories[3].code).toBe('recent_graduate');
    });

    it('has getUsers method', () => {
        const wrapper = mount(PlanDetailsForm, {
            props: {
                modelValue: {
                    category: {
                        name: 'Early Arrivals',
                        code: 'early_arrivals'
                    },
                    effective_date: '2023-01-01',
                    end_date: '2023-12-31',
                    authorized: { name: 'Test User', id: '123' }
                },
                isNew: false
            },
            global: {
                stubs: {
                    InputField: true,
                    DatePicker: true,
                    ApiDropdown: true
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        expect(typeof wrapper.vm.getUsers).toBe('function');
    });
});
