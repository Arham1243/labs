import { describe, expect, it, beforeEach } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Review from '@/modules/clients/views/holding/new/review.vue';
import { updateAbility } from '@/plugins/ability';
import { getHoldingMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { searchContactTypesMock } from '@/../tests/mocks/Common.service.mocks';

describe('Review', () => {
    beforeEach(() => {
        searchContactTypesMock();
        getHoldingMock();

        updateAbility(['update holdings', 'view holdings', 'view clients']);
    });

    it('page renders correctly', async () => {
        const wrapper = mount(Review, {
            props: {
                id: '0cc73a81-c7b4-4319-b79d-0a8efee37c1c'
            }
        });

        await flushPromises();

        expect(wrapper.findByTestId('review-title').text()).toBe(
            'Review Holding Summary'
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

        // Buttons
        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('publish-button').text()).toBe('Publish');
    });
});
