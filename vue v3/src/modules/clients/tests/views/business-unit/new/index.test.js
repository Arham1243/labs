import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/clients/views/business-unit/new/index.vue';
import { getBusinessUnitMock } from '@/modules/clients/tests/mocks/Client.service.mocks';

describe('Business Unit new index view', () => {
    beforeEach(() => {
        getBusinessUnitMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(IndexView, {
            global: { stubs: { Steps: true } }
        });

        expect(wrapper.findByTestId('page-title').text()).toBe(
            'New Business Unit'
        );

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
