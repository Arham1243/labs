import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LocationDetails from '@/modules/clients/components/LocationDetails.vue';
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

describe('LocationDetails', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(LocationDetails, {
            props: {
                data: {}
            }
        });

        expect(wrapper.findByTestId('mailing-address-title').text()).toBe(
            'Mailing Address'
        );
        expect(wrapper.findByTestId('edit-button').text()).toBe('Edit');
        expect(wrapper.findByTestId('address-label').text()).toBe('Address:');
        expect(wrapper.findByTestId('address2-label').text()).toBe(
            'Address 2:'
        );
        expect(wrapper.findByTestId('country-label').text()).toBe('Country:');
        expect(wrapper.findByTestId('city-label').text()).toBe('City:');
        expect(wrapper.findByTestId('postal-code-label').text()).toBe(
            'Postal/Zip Code:'
        );
    });
});
