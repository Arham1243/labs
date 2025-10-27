import { beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import IndexView from '@/modules/plans/views/plans/new/index.vue';
import { getPlanMock } from '@/modules/plans/tests/mocks/Plan.service.mocks';
import { getBusinessUnitMock } from '@/modules/clients/tests/mocks/Client.service.mocks';

describe('index view', () => {
    beforeEach(() => {
        getPlanMock();
        getBusinessUnitMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(IndexView, {
            global: { stubs: { Steps: true } }
        });
        await flushPromises();

        expect(wrapper.findByTestId('plan-name-title').text()).toBe(
            'test plan'
        );

        expect(wrapper.findComponent({ name: 'StatusTag' }).exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('plan-details-subtitle').text()).toBe(
            'Inbound • Domestic   • Extensions'
        );

        expect(wrapper.findByTestId('check-square-button').exists()).toBe(true);
        expect(wrapper.findByTestId('check-square-button').exists()).toBe(true);
        expect(wrapper.findByTestId('comment-button').exists()).toBe(true);
        expect(wrapper.findByTestId('back-button').exists()).toBe(true);
    });
});
