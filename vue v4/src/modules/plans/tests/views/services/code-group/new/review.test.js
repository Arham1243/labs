import { describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import ReviewView from '@/modules/plans/views/services/code-group/new/review.vue';
import {
    getCodeGroupMock,
    getCodeSetTagsMock,
    searchEntityServiceCodesMock,
    searchExcludedServicesCodesMock
} from '@/modules/plans/tests/mocks/CodeSet.service.mocks';
import { searchTagsMock } from '@/../tests/mocks/Common.service.mocks';

describe('code-group/new/review view', () => {
    const setupMocks = () => {
        searchEntityServiceCodesMock();
        searchTagsMock();
        searchExcludedServicesCodesMock();
        getCodeSetTagsMock();
        getCodeGroupMock();
    };

    it('renders correctly', async () => {
        setupMocks();

        const wrapper = mount(ReviewView, {
            props: { id: '123' }
        });

        await flushPromises();

        // Inspect HTML if needed
        console.log(wrapper.html());

        // Assertions
        const reviewTitle = wrapper.find('[data-testid="review-title"]');
        expect(reviewTitle.exists()).toBe(true);
        expect(reviewTitle.text()).toBe('Review Code Group Summary');

        expect(
            wrapper.findComponent({ name: 'CodeGroupDetails' }).exists()
        ).toBe(true);
        expect(
            wrapper.findComponent({ name: 'CodeGroupsServiceCodes' }).exists()
        ).toBe(true);

        const publishButton = wrapper.find('[data-testid="publish-button"]');
        expect(publishButton.exists()).toBe(true);
        expect(publishButton.text()).toBe('Publish');

        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );
    });
});
