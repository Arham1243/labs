import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import ReviewView from '@/modules/plans/views/services/code-set/new/review.vue';
import {
    getCodeSetMock,
    searchEntityServiceCodesMock
} from '@/modules/plans/tests/mocks/CodeSet.service.mocks';
import { searchTagsMock } from '@/../tests/mocks/Common.service.mocks';

describe('code-set/new/review view', () => {
    beforeEach(() => {
        getCodeSetMock();
        searchEntityServiceCodesMock();
        searchTagsMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(ReviewView, { props: { id: '123' } });

        expect(wrapper.findByTestId('review-title').text()).toBe(
            'Review Code Set Summary'
        );

        expect(wrapper.findComponent({ name: 'CodeSetDetails' }).exists()).toBe(
            true
        );
        expect(
            wrapper.findComponent({ name: 'CodeSetsServiceCodes' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('publish-button').text()).toBe('Publish');

        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );
    });
});
