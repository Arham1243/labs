import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ServiceCodeDialog from '@/modules/plans/components/services/dialogs/ServiceCodeDialog.vue';

vi.mock('@/modules/plans/stores/CodeSet', () => ({
    useCodeSetStore: vi.fn(() => ({
        searchServiceCodes: vi.fn().mockResolvedValue({ data: [] }),
        createServiceCode: vi.fn().mockResolvedValue({ data: {} }),
        updateServiceCode: vi.fn().mockResolvedValue({})
    }))
}));

vi.mock('@/stores', () => ({
    useCommonStore: vi.fn(() => ({
        searchTags: vi.fn().mockResolvedValue({ data: [] })
    })),
    useGlobalStore: vi.fn(() => ({
        clearErrors: vi.fn(),
        errors: {}
    }))
}));

describe('ServiceCodeDialog - Rendering Tests', () => {
    let wrapper;
    const mockServiceCode = {
        id: '123',
        code: 'ABC123',
        description: { en: 'Test Description' },
        tags: [{ name: 'Tag1' }, { name: 'Tag2' }]
    };

    beforeEach(() => {
        wrapper = mount(ServiceCodeDialog, {
            props: {
                modelValue: true,
                serviceCode: mockServiceCode,
                serviceCodeSetId: '456'
            },
            global: {
                stubs: {
                    Dialog: {
                        template:
                            '<div v-if="visible"><slot name="header"></slot><slot /><slot name="footer"></slot></div>',
                        props: ['visible']
                    },
                    InputField: {
                        template:
                            '<input data-testid="input-code" v-model="modelValue" />',
                        props: ['modelValue']
                    },
                    LocaleField: {
                        template:
                            '<textarea data-testid="input-description" v-model="modelValue" />',
                        props: ['modelValue']
                    },
                    AutoComplete: {
                        template:
                            '<div data-testid="autocomplete-tags"><slot /></div>',
                        props: ['modelValue', 'suggestions', 'loading']
                    },
                    Button: {
                        template: '<button><slot /></button>'
                    }
                }
            }
        });
    });

    it('renders the dialog and sets the visible prop correctly', () => {
        expect(wrapper.vm.dialog).toBe(true);
    });

    it('renders input fields for code, description', () => {
        const codeInput = wrapper.find('[data-testid="input-code"]');
        expect(codeInput.exists()).toBe(true);

        const descriptionField = wrapper.find(
            '[data-testid="input-description"]'
        );
        expect(descriptionField.exists()).toBe(true);
    });

    it('renders buttons for cancel and save', () => {
        const cancelButton = wrapper.find('[data-testid="button-cancel"]');
        expect(cancelButton.exists()).toBe(true);

        const saveButton = wrapper.find('[data-testid="button-save"]');
        expect(saveButton.exists()).toBe(true);
    });
});
