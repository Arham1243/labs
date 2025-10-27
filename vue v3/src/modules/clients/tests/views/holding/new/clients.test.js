import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Clients from '@/modules/clients/views/holding/new/clients.vue';
import {
    getHoldingMock,
    searchClientsMock
} from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Clients', () => {
    beforeEach(() => {
        searchClientsMock();
        getHoldingMock();

        updateAbility(['view clients']);
    });

    it('page renders correctly', () => {
        const wrapper = mount(Clients, {
            props: {
                id: '-1'
            }
        });

        expect(wrapper.findByTestId('clients-title').text()).toBe(
            'Add Associated Clients'
        );
        expect(
            wrapper.findComponent({ name: 'ClientsDropdown' }).exists()
        ).toBe(true);

        // Buttons
        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );

        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );

        expect(
            wrapper
                .findComponent({
                    name: 'ClientReassignmentWarningConfirmation'
                })
                .exists()
        ).toBe(true);
    });
});
