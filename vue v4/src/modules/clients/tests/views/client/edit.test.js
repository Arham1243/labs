import { describe, expect, it, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Edit from '@/modules/clients/views/client/edit.vue';
import { getClientMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { searchContactTypesMock } from '@/../tests/mocks/Common.service.mocks';

describe('Edit', () => {
    beforeEach(() => {
        getClientMock();
        searchContactTypesMock();

        updateAbility(['update clients']);
    });

    it('page renders correctly', async () => {
        const wrapper = mount(Edit, {
            props: {
                id: '0cc73a81-c7b4-4319-b79d-0a8efee37c1c'
            }
        });

        await flushPromises();

        expect(wrapper.findByTestId('edit-client-title').text()).toBe(
            'Edit Client'
        );

        expect(wrapper.findComponent({ name: 'ClientDetails' }).exists()).toBe(
            true
        );
        expect(
            wrapper.findComponent({ name: 'LocationDetails' }).exists()
        ).toBe(true);
        expect(wrapper.findComponent({ name: 'BillingDetails' }).exists()).toBe(
            true
        );
        expect(wrapper.findComponent({ name: 'ClientLogo' }).exists()).toBe(
            true
        );
        expect(
            wrapper.findComponent({ name: 'ClientContactDetails' }).exists()
        ).toBe(true);
        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );
    });
});
