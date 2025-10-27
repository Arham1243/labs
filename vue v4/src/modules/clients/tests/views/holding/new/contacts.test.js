import { describe, expect, it, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Contacts from '@/modules/clients/views/holding/new/contacts.vue';
import { searchContactTypesMock } from '@/../tests/mocks/Common.service.mocks';
import { getHoldingMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Contacts', () => {
    beforeEach(() => {
        searchContactTypesMock();
        getHoldingMock();

        updateAbility(['create holdings']);
    });

    it('page renders correctly', async () => {
        const wrapper = mount(Contacts, {
            props: {
                id: '1'
            }
        });
        await wrapper.vm.$nextTick();
        await flushPromises();

        expect(wrapper.findByTestId('contacts-title').text()).toBe('Contacts');

        const addContactButton = wrapper.findByTestId('add-contact-button');

        expect(addContactButton.text()).toBe('Add Contact');
        expect(wrapper.findComponent({ name: 'NewContact' }).exists()).toBe(
            true
        );

        await addContactButton.trigger('click');
        expect(
            wrapper.findComponent({ name: 'NewContact' }).vm.$props.modelValue
        ).toBe(true);

        expect(wrapper.findByTestId('holding-contact-info-label').text()).toBe(
            'The initial contact information is required to send a welcome email for profile setup.'
        );
        expect(wrapper.findByTestId('no-contacts-added-label').exists()).toBe(
            false
        );

        // Buttons
        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );

        expect(wrapper.findComponent({ name: 'NewContact' }).exists()).toBe(
            true
        );
    });
});
