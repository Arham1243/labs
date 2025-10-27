import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/clients/views/client/new/index.vue';
import { getClientMock } from '@/modules/clients/tests/mocks/Client.service.mocks';

describe('Clients new index view', () => {
    beforeEach(() => {
        getClientMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('page-title').text()).toBe('New Client');

        expect(wrapper.findComponent({ name: 'StatusTag' }).exists()).toBe(
            false
        );

        expect(wrapper.findByTestId('close-button').exists()).toBe(true);

        expect(wrapper.findComponent({ name: 'Steps' }).exists()).toBe(true);

        // Confirmation modal
        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );
    });
});
