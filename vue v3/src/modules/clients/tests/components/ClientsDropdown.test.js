import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ClientsDropdown from '@/modules/clients/components/ClientsDropdown.vue';
import { searchClientsMock } from '@/modules/clients/tests/mocks/Client.service.mocks';

describe('ClientsDropdown', () => {
    beforeEach(() => {
        searchClientsMock();
    });

    it('component renders correctly', async () => {
        const wrapper = mount(ClientsDropdown, {
            props: {
                modelValue: [],
                holding_id: '123'
            }
        });

        expect(wrapper.findComponent({ name: 'ApiMultiselect' }).exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('plus-button').exists()).toBe(true);
    });
});
