import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Details from '@/modules/clients/views/client/new/details.vue';
import {
    getClientMock,
    searchClientsMock
} from '@/modules/clients/tests/mocks/Client.service.mocks';
import {
    searchClientSectorsMock,
    searchCountriesMock
} from '@/../tests/mocks/Common.service.mocks';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Province.service.mocks';
import { updateAbility } from '@/plugins/ability';
import {
    searchContactTypesMock,
    searchLanguagesMock
} from '@/../tests/mocks/Common.service.mocks';
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

describe('Details', () => {
    beforeEach(() => {
        getClientMock();
        searchClientSectorsMock();
        searchClientsMock();
        searchContactTypesMock();
        searchCountriesMock();
        searchCountriesMock();
        searchLanguagesMock();
        searchItemsMock();

        updateAbility(['create clients']);
    });

    it('page renders correctly', () => {
        const wrapper = mount(Details, {
            props: {
                id: '-1'
            }
        });

        // Client Details
        expect(wrapper.findByTestId('client-details-title').text()).toBe(
            'Client Details'
        );
        expect(
            wrapper.findComponent({ name: 'ClientDetailsForm' }).exists()
        ).toBe(true);

        // Mailing Address
        expect(wrapper.findByTestId('mailing-address-title').text()).toBe(
            'Mailing Address'
        );
        expect(
            wrapper.findComponent({ name: 'AddressDetailsForm' }).exists()
        ).toBe(true);

        // Client Logo
        expect(wrapper.findComponent({ name: 'ClientLogo' }).exists()).toBe(
            true
        );

        // Buttons
        expect(wrapper.findByTestId('cancel-button').text()).toBe('Cancel');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );
    });
});
