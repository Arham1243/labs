import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Clients from '@/modules/clients/views/clients.vue';
import { searchClientsMock } from '@/modules/clients/tests/mocks/Client.service.mocks';

describe('Clients view', () => {
    beforeEach(() => {
        searchClientsMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(Clients);

        expect(wrapper.findComponent({ name: 'ClientsTable' }).exists()).toBe(
            true
        );
    });
});
