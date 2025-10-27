import { describe, expect, it, vi, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Review from '@/modules/clients/views/business-unit/new/review.vue';
import {
    getBusinessUnitMock,
    getClientMock
} from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { searchContactTypesMock } from '@/../tests/mocks/Common.service.mocks';

describe('Review', () => {
    beforeEach(() => {
        getBusinessUnitMock();
        getClientMock();
        searchContactTypesMock();

        updateAbility(['update business units', 'view business units']);
    });

    it('page renders correctly', async () => {
        const wrapper = mount(Review, {
            props: {
                id: '0cc73a81-c7b4-4319-b79d-0a8efee37c1c',
                clientId: '0cc73a81-c7b4-4319-b79d-0a8efee37c1c'
            }
        });

        await wrapper.vm.$nextTick();
        await flushPromises();

        expect(wrapper.findByTestId('review-title').text()).toBe(
            'Review Business Unit Summary'
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
        expect(
            wrapper.findComponent({ name: 'ClientContactDetails' }).exists()
        ).toBe(true);
        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );

        // Buttons
        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('publish-button').text()).toBe('Publish');
    });
});
