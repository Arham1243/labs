import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ComponentName from '@/modules/plans/components/services/forms/CodeSetDetailsForm.vue';

vi.mock('@/path/to/LocaleField', () => ({
    default: {
        template: '<div><input v-model="modelValue" /></div>',
        props: ['modelValue', 'label', 'type', 'variant', 'multiple']
    }
}));

vi.mock('@/path/to/DatePicker', () => ({
    default: {
        template: '<div><input type="date" v-model="modelValue" /></div>',
        props: ['modelValue']
    }
}));

describe('ComponentName - Rendering Tests', () => {
    let wrapper;
    const mockModelValue = {
        name: { en: 'Sample Name' },
        description: { en: 'Sample Description' },
        effective_date: '2024-10-25'
    };

    beforeEach(() => {
        wrapper = mount(ComponentName, {
            props: {
                modelValue: mockModelValue,
                isNew: false
            },
            global: {
                stubs: {
                    LocaleField: {
                        template:
                            '<div><input data-testid="code-set-name" v-model="modelValue.en" /></div>',
                        props: [
                            'modelValue',
                            'label',
                            'type',
                            'variant',
                            'multiple'
                        ]
                    },
                    DatePicker: {
                        template:
                            '<div><input data-testid="effective-date-datepicker" type="date" v-model="modelValue" /></div>',
                        props: ['modelValue']
                    }
                }
            }
        });
    });

    it('renders the name field', () => {
        const nameInput = wrapper.find('[data-testid="code-set-name"]');
        expect(nameInput.exists()).toBe(true);
    });

    it('renders the description field', () => {
        const descriptionInput = wrapper.find(
            '[data-test-id="code-set-description"]'
        );
        expect(descriptionInput.exists()).toBe(true);
    });

    it('renders the effective date picker', () => {
        const effectiveDatePicker = wrapper.find(
            '[data-testid="effective-date-datepicker"]'
        );
        expect(effectiveDatePicker.exists()).toBe(true);
    });
});
