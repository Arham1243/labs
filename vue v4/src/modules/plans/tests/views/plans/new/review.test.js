import { beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import ReviewView from '@/modules/plans/views/plans/new/review.vue';
import {
    getBenefitGroupsMock,
    getPlanBenefitsMock,
    getPlanMock,
    searchBenefitGroupsBenefitsMock,
    searchPlanPricesMock
} from '@/modules/plans/tests/mocks/Plan.service.mocks';
import { getBusinessUnitMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { listDocumentsMock } from '@/../tests/mocks/Document.service.mocks';

describe('Review view', () => {
    beforeEach(() => {
        getPlanMock();
        getBusinessUnitMock();
        getBenefitGroupsMock();
        getPlanBenefitsMock();
        searchPlanPricesMock();
        listDocumentsMock();
        searchBenefitGroupsBenefitsMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(ReviewView, {
            props: { id: '879e4b4b-733d-4b4c-94bc-c34a7969e188' }
        });
        await flushPromises();

        expect(wrapper.findByTestId('review-title').text()).toBe(
            'Review Plan Summary'
        );

        expect(wrapper.findComponent({ name: 'PlanDetails' }).exists()).toBe(
            true
        );
        expect(wrapper.findComponent({ name: 'PlanDates' }).exists()).toBe(
            true
        );
        expect(
            wrapper.findComponent({ name: 'PlanPolicyAction' }).exists()
        ).toBe(true);
        expect(
            wrapper.findComponent({ name: 'PlanPolicyDefaults' }).exists()
        ).toBe(true);
        expect(wrapper.findComponent({ name: 'Bundles' }).exists()).toBe(true);
        expect(
            wrapper.findComponent({ name: 'AttachBenefitInit' }).exists()
        ).toBe(true);
        expect(
            wrapper.findComponent({ name: 'AttachPricingInit' }).exists()
        ).toBe(true);
        expect(wrapper.findComponent({ name: 'DocumentsTable' }).exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('confirm-publish-button').text()).toBe(
            'Confirm & Publish'
        );
    });
});
