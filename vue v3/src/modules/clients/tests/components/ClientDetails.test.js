import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ClientDetails from '@/modules/clients/components/ClientDetails.vue';
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

describe('ClientDetails', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(ClientDetails, {
            props: {
                data: {}
            }
        });

        expect(wrapper.findByTestId('client-details-title').text()).toBe(
            'Client Details'
        );
        expect(wrapper.findByTestId('edit-button').text()).toBe('Edit');

        expect(wrapper.findByTestId('name-label').text()).toBe('Name:');
        expect(wrapper.findByTestId('short-name-label').text()).toBe(
            'Short Name:'
        );

        expect(wrapper.findByTestId('client-sector-label').text()).toBe(
            'Client Sector:'
        );
        expect(wrapper.findByTestId('business-phone-label').text()).toBe(
            'Business Phone:'
        );
        expect(wrapper.findByTestId('business-website-label').text()).toBe(
            'Business Website:'
        );
        expect(wrapper.findByTestId('preferred-language-label').text()).toBe(
            'Preferred Language:'
        );
    });
});
