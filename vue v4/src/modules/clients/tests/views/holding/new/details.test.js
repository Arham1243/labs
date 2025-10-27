import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';

import Details from '@/modules/clients/views/holding/new/details.vue';
import {} from '@/../tests/mocks/Common.service.mocks';
import {
    searchCountriesMock,
    searchCompanyUsersMock,
    searchLanguagesMock
} from '@/../tests/mocks/Common.service.mocks';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Province.service.mocks';
import { updateAbility } from '@/plugins/ability';
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
        searchCompanyUsersMock();
        searchCountriesMock();
        searchLanguagesMock();
        searchItemsMock();

        updateAbility(['create holdings']);
    });

    it('page renders correctly', () => {
        const wrapper = mount(Details, {
            props: {
                id: '-1'
            }
        });

        // Holding Details
        expect(wrapper.findByTestId('holding-details-title').text()).toBe(
            'Holding Details'
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
