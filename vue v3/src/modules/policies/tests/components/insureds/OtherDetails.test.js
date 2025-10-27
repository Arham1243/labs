import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import InsuredOtherDetails from '@/modules/policies/components/insureds/OtherDetails.vue';

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

describe('Insured OtherDetails', () => {
    it('renders correctly', async () => {
        const wrapper = mount(InsuredOtherDetails, {});

        expect(wrapper.find('h5').text()).toBe('Other Details');
    });
});
