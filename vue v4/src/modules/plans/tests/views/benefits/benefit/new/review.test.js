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
            props: { id: '7e9cefff-c0e8-4e7d-864d-08a8b3148a73' },
            global: {
                stubs: {
                    BenefitDetails: true,
                    BenefitRestrictions: true,
                    BenefitServices: true,
                    DocumentsTable: true,
                    AttachPricingInit: true,
                    Confirmation: true,
                }
            }
        });
        await flushPromises();

        expect(wrapper.findByTestId('review-title').text()).toBe(
            'Review Benefit Summary'
        );
        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('confirm-publish-button').text()).toBe(
            'Confirm & Publish'
        );
      
        expect(wrapper.find('attach-pricing-init-stub').exists()).toBe(true);
        expect(wrapper.find('benefit-restrictions-stub').exists()).toBe(true);
        expect(wrapper.find('documents-table-stub').exists()).toBe(true);
        expect(wrapper.find('benefit-services-stub').exists()).toBe(true);
        expect(wrapper.find('confirmation-stub').exists()).toBe(true);
    });
});
