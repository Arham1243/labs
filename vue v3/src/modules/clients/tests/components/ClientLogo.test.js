import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ClientLogo from '@/modules/clients/components/ClientLogo.vue';
import { ref } from 'vue';

vi.mock('@/modules/clients/composables/useEditState', () => ({
    useEditState: () => ({
        activeEditComponent: ref(null),
        showUnsavedDialog: ref(false),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn(),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        registerCancelCallback: vi.fn(),
        unregisterCancelCallback: vi.fn()
    })
}));

describe('ClientLogo', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(ClientLogo, {
            props: {
                modelValue: { logo: null }
            }
        });

        expect(wrapper.findByTestId('client-logo-title').text()).toBe(
            'Holding Logo'
        );

        // expect(wrapper.findByTestId('client-logo-label').text()).toBe(
        //     'Drag and drop or select your file'
        // );
        // expect(wrapper.findByTestId('client-logo-input').exists()).toBe(true);
    });
});
