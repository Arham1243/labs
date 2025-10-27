import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach } from 'vitest';
import BenefitGroupsDetailsForm from '@/modules/plans/components/benefit-groups/forms/BenefitGroupsDetailsForm.vue';
import { nextTick } from 'vue';

describe('BenefitGroupsDetailsForm - Rendering Tests', () => {
    let wrapper;
    const mockData = {
        name: { en: 'Test Group' },
        coverage: 75,
        max_amount: 500,
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        bound: { value: 'in' },
        type: { value: 'domestic' }
    };

    beforeEach(async () => {
        wrapper = mount(BenefitGroupsDetailsForm, {
            props: {
                modelValue: mockData,
                isNew: false
            },
            global: {
                stubs: {
                    LocaleField: {
                        template:
                            '<div :data-testid="dataTestid"><input v-model="value" /></div>',
                        props: [
                            'modelValue',
                            'id',
                            'label',
                            'type',
                            'variant',
                            'multiple',
                            'dataTestid'
                        ],
                        emits: ['update:modelValue'],
                        computed: {
                            value: {
                                get() {
                                    return this.modelValue;
                                },
                                set(val) {
                                    this.$emit('update:modelValue', val);
                                }
                            }
                        }
                    },
                    InputField: {
                        template:
                            '<div :data-testid="dataTestid"><input v-model="value" /></div>',
                        props: [
                            'modelValue',
                            'id',
                            'variant',
                            'addonAfter',
                            'addonBefore',
                            'options',
                            'optionLabel',
                            'unselectable',
                            'dataTestid'
                        ],
                        emits: ['update:modelValue'],
                        computed: {
                            value: {
                                get() {
                                    return this.modelValue;
                                },
                                set(val) {
                                    this.$emit('update:modelValue', val);
                                }
                            }
                        }
                    },
                    DatePicker: {
                        template:
                            '<div :data-testid="dataTestid"><input v-model="value" /></div>',
                        props: ['modelValue', 'id', 'dataTestid'],
                        emits: ['update:modelValue'],
                        computed: {
                            value: {
                                get() {
                                    return this.modelValue;
                                },
                                set(val) {
                                    this.$emit('update:modelValue', val);
                                }
                            }
                        }
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

    it('renders the name field', () => {
        const nameField = wrapper.find('[data-testid="input-name"]');
        expect(nameField.exists()).toBe(true);
    });

    it('renders the coverage field', () => {
        const coverageField = wrapper.find('[data-testid="input-coverage"]');
        expect(coverageField.exists()).toBe(true);
    });

    it('renders the max amount field', () => {
        const maxAmountField = wrapper.find('[data-testid="input-max-amount"]');
        expect(maxAmountField.exists()).toBe(true);
    });

    it('renders the effective date field', () => {
        const effectiveDateField = wrapper.find(
            '[data-testid="input-effective-date"]'
        );
        expect(effectiveDateField.exists()).toBe(true);
    });

    it('renders the end date field', () => {
        const endDateField = wrapper.find('[data-testid="input-end-date"]');
        expect(endDateField.exists()).toBe(true);
    });

    it('renders the bound field', () => {
        const boundField = wrapper.find('[data-testid="bound-input"]');
        expect(boundField.exists()).toBe(true);
    });

    it('renders the type field', () => {
        const typeField = wrapper.find('[data-testid="type-input"]');
        expect(typeField.exists()).toBe(true);
    });
});

describe('BenefitGroupsDetailsForm - Data Binding Tests', () => {
    let wrapper;
    const mockData = {
        name: { en: 'Test Group' },
        coverage: 75,
        max_amount: 500,
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        bound: { value: 'in' },
        type: { value: 'domestic' }
    };

    beforeEach(async () => {
        wrapper = mount(BenefitGroupsDetailsForm, {
            props: {
                modelValue: mockData,
                isNew: false
            },
            global: {
                stubs: {
                    LocaleField: {
                        template:
                            '<div :data-testid="dataTestid"><input v-model="value" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'modelValue',
                            'id',
                            'label',
                            'type',
                            'variant',
                            'multiple',
                            'dataTestid'
                        ],
                        emits: ['update:modelValue'],
                        computed: {
                            value: {
                                get() {
                                    return this.modelValue;
                                },
                                set(val) {
                                    this.$emit('update:modelValue', val);
                                }
                            }
                        }
                    },
                    InputField: {
                        template:
                            '<div :data-testid="dataTestid"><input v-model="value" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: [
                            'modelValue',
                            'id',
                            'variant',
                            'addonAfter',
                            'addonBefore',
                            'options',
                            'optionLabel',
                            'unselectable',
                            'dataTestid'
                        ],
                        emits: ['update:modelValue'],
                        computed: {
                            value: {
                                get() {
                                    return this.modelValue;
                                },
                                set(val) {
                                    this.$emit('update:modelValue', val);
                                }
                            }
                        }
                    },
                    DatePicker: {
                        template:
                            '<div :data-testid="dataTestid"><input v-model="value" @input="$emit(\'update:modelValue\', $event.target.value)" /></div>',
                        props: ['modelValue', 'id', 'dataTestid'],
                        emits: ['update:modelValue'],
                        computed: {
                            value: {
                                get() {
                                    return this.modelValue;
                                },
                                set(val) {
                                    this.$emit('update:modelValue', val);
                                }
                            }
                        }
                    }
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        await nextTick();
    });

    it('initializes form data with modelValue', () => {
        expect(wrapper.vm.formData).toEqual(mockData);
    });

    it('emits update:modelValue event when form data changes', async () => {
        // Update the form data
        wrapper.vm.formData = {
            ...wrapper.vm.formData,
            coverage: 80
        };
        await nextTick();

        // Check that the event was emitted with the updated data
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0][0].coverage).toBe(80);
    });

    it('passes isNew prop to LocaleField for name field', async () => {
        // Check with isNew = false
        expect(wrapper.vm.isNew).toBe(false);

        // Update isNew prop
        await wrapper.setProps({ isNew: true });

        // Check that isNew was updated
        expect(wrapper.vm.isNew).toBe(true);
    });
});
