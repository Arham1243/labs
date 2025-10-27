import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LimitDialog from '@/modules/plans/components/plans/dialogs/LimitDialog.vue';
import { nextTick } from 'vue';

// Mock the PlanStore
const mockUpdateBenefitGroups = vi.fn().mockResolvedValue({
    data: {
        id: '123',
        name: { en: 'Updated Benefit Group' }
    }
});

vi.mock('@/modules/plans/stores/Plan', () => ({
    usePlanStore: vi.fn(() => ({
        updateBenefitGroups: mockUpdateBenefitGroups
    }))
}));

// Mock the event bus
const mockEmit = vi.fn();
vi.mock('@/composables/event-bus', () => ({
    default: vi.fn(() => ({
        emit: mockEmit
    }))
}));

describe('LimitDialog - Rendering Tests', () => {
    let wrapper;
    const mockItem = {
        id: '456',
        name: { en: 'Test Benefit Group' },
        pivot: {
            coverage: 75,
            max_amount: 1000
        }
    };

    beforeEach(async () => {
        wrapper = mount(LimitDialog, {
            props: {
                modelValue: true,
                id: '123',
                item: mockItem,
                header: 'Test Header'
            },
            global: {
                stubs: {
                    Dialog: {
                        template:
                            '<div data-testid="dialog"><slot></slot><slot name="footer"></slot></div>',
                        props: ['visible', 'header', 'style'],
                        emits: ['update:visible']
                    },
                    InputSwitch: {
                        template: '<div data-testid="input-switch"></div>',
                        props: ['modelValue'],
                        emits: ['update:modelValue']
                    },
                    InputField: {
                        template: '<div data-testid="input-field"></div>',
                        props: [
                            'id',
                            'variant',
                            'addonAfter',
                            'addonBefore',
                            'modelValue'
                        ],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')">{{ label }}<slot /></button>',
                        props: [
                            'label',
                            'text',
                            'loading',
                            'disabled',
                            'dataTestid'
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

    it('renders the dialog', () => {
        expect(wrapper.find('[data-testid="dialog"]').exists()).toBe(true);
    });

    it('initializes with correct values from props', () => {
        expect(wrapper.vm.isCoverage).toBe(true);
        expect(wrapper.vm.isMax).toBe(true);
        expect(wrapper.vm.coverage).toBe(75);
        expect(wrapper.vm.max_amount).toBe(1000);
    });

    it('renders input switches for coverage and max amount', () => {
        const switches = wrapper.findAll('[data-testid="input-switch"]');
        expect(switches.length).toBe(2);
    });

    it('renders input fields when switches are on', () => {
        const fields = wrapper.findAll('[data-testid="input-field"]');
        expect(fields.length).toBe(2);
    });

    it('renders save and cancel buttons', () => {
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        const saveButton = wrapper.find('[data-testid="save-button"]');
        expect(cancelButton.exists()).toBe(true);
        expect(saveButton.exists()).toBe(true);
        expect(cancelButton.text()).toBe('Cancel');
        expect(saveButton.text()).toBe('Save');
    });
});

describe('LimitDialog - Interaction Tests', () => {
    let wrapper;
    const mockItem = {
        id: '456',
        name: { en: 'Test Benefit Group' },
        pivot: {
            coverage: 75,
            max_amount: 1000
        }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(LimitDialog, {
            props: {
                modelValue: true,
                id: '123',
                item: mockItem,
                header: 'Test Header'
            },
            global: {
                stubs: {
                    Dialog: {
                        template:
                            '<div data-testid="dialog"><slot></slot><slot name="footer"></slot></div>',
                        props: ['visible', 'header', 'style'],
                        emits: ['update:visible']
                    },
                    InputSwitch: {
                        template:
                            '<input type="checkbox" data-testid="input-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
                        props: ['modelValue'],
                        emits: ['update:modelValue']
                    },
                    InputField: {
                        template:
                            '<input data-testid="input-field" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
                        props: [
                            'id',
                            'variant',
                            'addonAfter',
                            'addonBefore',
                            'modelValue'
                        ],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')">{{ label }}<slot /></button>',
                        props: [
                            'label',
                            'text',
                            'loading',
                            'disabled',
                            'dataTestid'
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

    it('toggles coverage input field when coverage switch is toggled', async () => {
        // Initially the coverage switch is on and the field is visible
        expect(wrapper.vm.isCoverage).toBe(true);
        expect(wrapper.findAll('[data-testid="input-field"]').length).toBe(2);

        // Toggle the coverage switch off
        const coverageSwitch = wrapper.findAll(
            '[data-testid="input-switch"]'
        )[0];
        await coverageSwitch.setValue(false);

        // The coverage field should now be hidden
        expect(wrapper.vm.isCoverage).toBe(false);
        // After toggling off, there should be only one input field (the max amount field)
        expect(wrapper.findAll('[data-testid="input-field"]').length).toBe(1);
    });

    it('toggles max amount input field when max amount switch is toggled', async () => {
        // Initially the max amount switch is on and the field is visible
        expect(wrapper.vm.isMax).toBe(true);
        expect(wrapper.findAll('[data-testid="input-field"]').length).toBe(2);

        // Toggle the max amount switch off
        const maxSwitch = wrapper.findAll('[data-testid="input-switch"]')[1];
        await maxSwitch.setValue(false);

        // The max amount field should now be hidden
        expect(wrapper.vm.isMax).toBe(false);
        // After toggling off, there should be only one input field (the coverage field)
        expect(wrapper.findAll('[data-testid="input-field"]').length).toBe(1);
    });

    it('updates coverage value when input changes', async () => {
        const coverageField = wrapper.findAll('[data-testid="input-field"]')[0];
        await coverageField.setValue('80');

        expect(wrapper.vm.coverage).toBe('80');
    });

    it('updates max amount value when input changes', async () => {
        const maxField = wrapper.findAll('[data-testid="input-field"]')[1];
        await maxField.setValue('2000');

        expect(wrapper.vm.max_amount).toBe('2000');
    });

    it('calls updateBenefitGroups when confirm is clicked', async () => {
        // Set some values
        wrapper.vm.coverage = 80;
        wrapper.vm.max_amount = 2000;

        // Click the save button
        const saveButton = wrapper.find('[data-testid="save-button"]');
        await saveButton.trigger('click');

        // Check that updateBenefitGroups was called with the correct arguments
        expect(mockUpdateBenefitGroups).toHaveBeenCalledWith('123', '456', {
            pivot: {
                coverage: 80,
                max_amount: 2000
            }
        });

        // Check that the event was emitted
        expect(mockEmit).toHaveBeenCalledWith('reloadPlanBenefitGroups');

        // Check that the dialog was closed
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('closes the dialog when cancel is clicked', async () => {
        // Click the cancel button
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        // Check that the dialog was closed
        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });

    it('resets state when dialog is closed', async () => {
        // Set some values
        wrapper.vm.coverage = 80;
        wrapper.vm.max_amount = 2000;

        // Close the dialog by clicking the cancel button
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');
        await nextTick();

        // Check that the state was reset
        expect(wrapper.vm.isCoverage).toBe(false);
        expect(wrapper.vm.isMax).toBe(false);
        expect(wrapper.vm.coverage).toBe(null);
        expect(wrapper.vm.max_amount).toBe(null);
    });
});

describe('LimitDialog - Edge Cases', () => {
    it('handles item with no pivot data', async () => {
        const mockItem = {
            id: '456',
            name: { en: 'Test Benefit Group' }
            // No pivot data
        };

        const wrapper = mount(LimitDialog, {
            props: {
                modelValue: true,
                id: '123',
                item: mockItem,
                header: 'Test Header'
            },
            global: {
                stubs: {
                    Dialog: {
                        template:
                            '<div data-testid="dialog"><slot></slot><slot name="footer"></slot></div>',
                        props: ['visible', 'header', 'style'],
                        emits: ['update:visible']
                    },
                    InputSwitch: {
                        template: '<div data-testid="input-switch"></div>',
                        props: ['modelValue'],
                        emits: ['update:modelValue']
                    },
                    InputField: {
                        template: '<div data-testid="input-field"></div>',
                        props: [
                            'id',
                            'variant',
                            'addonAfter',
                            'addonBefore',
                            'modelValue'
                        ],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')">{{ label }}<slot /></button>',
                        props: [
                            'label',
                            'text',
                            'loading',
                            'disabled',
                            'dataTestid'
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

        // Check that the component initialized correctly with default values
        expect(wrapper.vm.isCoverage).toBe(false);
        expect(wrapper.vm.isMax).toBe(false);
        expect(wrapper.vm.coverage).toBe(null);
        expect(wrapper.vm.max_amount).toBe(null);
    });

    it('sends null values when switches are off', async () => {
        const mockItem = {
            id: '456',
            name: { en: 'Test Benefit Group' },
            pivot: {
                coverage: 75,
                max_amount: 1000
            }
        };

        const wrapper = mount(LimitDialog, {
            props: {
                modelValue: true,
                id: '123',
                item: mockItem,
                header: 'Test Header'
            },
            global: {
                stubs: {
                    Dialog: {
                        template:
                            '<div data-testid="dialog"><slot></slot><slot name="footer"></slot></div>',
                        props: ['visible', 'header', 'style'],
                        emits: ['update:visible']
                    },
                    InputSwitch: {
                        template:
                            '<input type="checkbox" data-testid="input-switch" :checked="modelValue" @change="$emit(\'update:modelValue\', $event.target.checked)" />',
                        props: ['modelValue'],
                        emits: ['update:modelValue']
                    },
                    InputField: {
                        template:
                            '<input data-testid="input-field" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
                        props: [
                            'id',
                            'variant',
                            'addonAfter',
                            'addonBefore',
                            'modelValue'
                        ],
                        emits: ['update:modelValue']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')">{{ label }}<slot /></button>',
                        props: [
                            'label',
                            'text',
                            'loading',
                            'disabled',
                            'dataTestid'
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

        // Turn off both switches
        const switches = wrapper.findAll('[data-testid="input-switch"]');
        await switches[0].setValue(false);
        await switches[1].setValue(false);

        // Click save
        const saveButton = wrapper.find('[data-testid="save-button"]');
        await saveButton.trigger('click');

        // Check that updateBenefitGroups was called with null values
        expect(mockUpdateBenefitGroups).toHaveBeenCalledWith('123', '456', {
            pivot: {
                coverage: null,
                max_amount: null
            }
        });
    });
});
