import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/clients/views/holding/new/index.vue';
import { getHoldingMock } from '@/modules/clients/tests/mocks/Client.service.mocks';

describe('Holding new index view', () => {
    beforeEach(() => {
        getHoldingMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('page-title').text()).toBe('New Holding');

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
