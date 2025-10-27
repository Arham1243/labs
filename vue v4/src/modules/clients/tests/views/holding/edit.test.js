import { describe, expect, it, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Edit from '@/modules/clients/views/holding/edit.vue';
import { getHoldingMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { searchContactTypesMock } from '@/../tests/mocks/Common.service.mocks';

describe('Edit', () => {
    beforeEach(() => {
        searchContactTypesMock();
        getHoldingMock();

        updateAbility(['update holdings', 'view clients']);
    });

    it('page renders correctly', async () => {
        const wrapper = mount(Edit, {
            props: {
                id: '0cc73a81-c7b4-4319-b79d-0a8efee37c1c'
            }
        });
        await flushPromises();

        expect(wrapper.findByTestId('edit-holding-title').text()).toBe(
            'Edit Holding'
        );

        expect(wrapper.findComponent({ name: 'ClientDetails' }).exists()).toBe(
            true
        );
        expect(wrapper.findComponent({ name: 'ClientLogo' }).exists()).toBe(
            true
        );
        expect(
            wrapper.findComponent({ name: 'LocationDetails' }).exists()
        ).toBe(true);
        expect(
            wrapper.findComponent({ name: 'ClientContactDetails' }).exists()
        ).toBe(true);
        expect(
            wrapper.findComponent({ name: 'AssociatedClients' }).exists()
        ).toBe(true);
        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );
    });
});
