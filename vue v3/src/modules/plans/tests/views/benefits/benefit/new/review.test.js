import { beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import ReviewView from '@/modules/plans/views/benefits/benefit/new/review.vue';
import {
    getBenefitCodeServicesGroupsMock,
    getBenefitMock,
    searchBenefitEntityServiceCodesMock,
    searchBenefitServicesCodesMock
} from '@/modules/plans/tests/mocks/Benefit.service.mocks';
import { listDocumentsMock } from '@/../tests/mocks/Document.service.mocks';

describe('Review view', () => {
    beforeEach(() => {
        getBenefitMock();
        getBenefitCodeServicesGroupsMock();
        listDocumentsMock();
        searchBenefitEntityServiceCodesMock();
        searchBenefitServicesCodesMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(ReviewView, {
            props: { id: '7e9cefff-c0e8-4e7d-864d-08a8b3148a73' }
        });
        await flushPromises();

        expect(wrapper.findByTestId('review-title').text()).toBe(
            'Review Benefit Summary'
        );

        expect(
            wrapper.findComponent({ name: 'BenefitRestrictions' }).exists()
        ).toBe(true);
        expect(
            wrapper.findComponent({ name: 'BenefitServices' }).exists()
        ).toBe(true);
        expect(wrapper.findComponent({ name: 'DocumentsTable' }).exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('confirm-publish-button').text()).toBe(
            'Confirm & Publish'
        );

        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );
    });
});
