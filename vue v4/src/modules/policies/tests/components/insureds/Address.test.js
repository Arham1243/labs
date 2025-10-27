import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InsuredAddress from '@/modules/policies/components/insureds/Address.vue';

const mockSetActiveComponent = vi.fn();
const mockClearActiveComponent = vi.fn();
const mockRegisterCancelCallback = vi.fn();
const mockUnregisterCancelCallback = vi.fn();
const mockHandleUnsavedChanges = vi.fn((callback) => callback());

vi.mock('@/modules/policies/composables/useEditState', () => ({
    useEditState: vi.fn(() => ({
        activeEditComponent: { value: null },
        setActiveComponent: mockSetActiveComponent,
        clearActiveComponent: mockClearActiveComponent,
        registerCancelCallback: mockRegisterCancelCallback,
        unregisterCancelCallback: mockUnregisterCancelCallback,
        handleUnsavedChanges: mockHandleUnsavedChanges
    }))
}));

describe('Insured Address', () => {
    it('renders correctly', async () => {
        const wrapper = mount(InsuredAddress, {});

        expect(wrapper.find('h5').text()).toBe('Insured Address');
    });
});
