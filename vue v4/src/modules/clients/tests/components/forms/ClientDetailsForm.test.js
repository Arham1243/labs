import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ClientDetailsForm from '@/modules/clients/components/forms/ClientDetailsForm.vue';

vi.mock('@/components/common/InputField.vue', () => ({
    default: {
        template: '<div>InputField</div>',
        props: ['modelValue', 'variant', 'options', 'binary'],
        emits: ['update:modelValue']
    }
}));

vi.mock('@/modules/clients/components/common/LocaleField.vue', () => ({
    default: {
        template: '<div>LocaleField</div>',
        props: ['modelValue', 'label', 'type', 'multiple'],
        emits: ['update:modelValue']
    }
}));

vi.mock('@/modules/clients/components/common/ApiDropdown.vue', () => ({
    default: {
        template: '<div>ApiDropdown</div>',
        props: ['modelValue', 'items', 'loading'],
        emits: ['update:modelValue', 'search']
    }
}));

vi.mock('vue-router', () => ({
    useRoute: () => ({
        params: {
            id: '123'
        }
    })
}));

vi.mock('@/stores', () => ({
    useCommonStore: () => ({
        searchClientSectors: vi.fn().mockResolvedValue({ data: [] }),
        searchCompanyUsers: vi.fn().mockResolvedValue({ data: [] }),
        searchLanguages: vi.fn().mockResolvedValue({ data: [] })
    }),
    useSessionStore: () => ({
        settings: {
            default_language: {}
        }
    })
}));

vi.mock('@/config', () => ({
    enrollmentType: [],
    clientTypes: []
}));

describe('ClientDetailsForm', () => {
    it('renders without crashing', () => {
        const wrapper = mount(ClientDetailsForm, {
            props: {
                modelValue: {}
            },
            global: {
                stubs: {
                    LocaleField: true,
                    ApiDropdown: true,
                    InputField: true
                }
            }
        });

        expect(wrapper.exists()).toBe(true);
    });
});
