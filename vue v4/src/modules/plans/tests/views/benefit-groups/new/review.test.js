import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

import BenefitGroupReview from '@/modules/plans/views/benefit-groups/new/review.vue';
import Confirmation from '@/components/common/Confirmation.vue';
import BenefitGroupsDetails from '@/modules/plans/components/benefit-groups/BenefitGroupsDetails.vue';
import BenefitGroupsBenefits from '@/modules/plans/components/benefit-groups/BenefitGroupsBenefits.vue';
import DocumentsTable from '@/components/documents/DocumentsTable.vue';
import {
    getBenefitGroupMock,
    searchBenefitGroupPricesMock,
    searchBenefitGroupBenefitsMock,
    searchBenefitsMock
} from '@/modules/plans/tests/mocks/Benefit.service.mocks';
import { listDocumentsMock } from '@/../tests/mocks/Document.service.mocks';
import {
    searchRegionsMock,
    searchCountriesMock
} from '@/../tests/mocks/Common.service.mocks';

describe('Benefit groups new review view', () => {
    beforeEach(() => {
        searchRegionsMock();
        searchCountriesMock();
        searchBenefitGroupBenefitsMock();
        searchBenefitsMock();
        searchBenefitGroupPricesMock();
        listDocumentsMock();
        getBenefitGroupMock();
    });

    it('page renders correctly', () => {
        // Preparation
        const wrapper = mount(BenefitGroupReview, {
            props: {
                id: '1'
            }
        });
        const pageTitle = wrapper.findByTestId('page-title');
        const backButton = wrapper.findByTestId('back-button');
        const confirmAndPublishButton = wrapper.findByTestId(
            'confirm-and-publish-button'
        );

        const benefitGroupsDetails = wrapper.findComponent(
            BenefitGroupsDetails,
            {
                props: {
                    data: {}
                }
            }
        );

        const benefitGroupsBenefits = wrapper.findComponent(
            BenefitGroupsBenefits,
            {
                props: {
                    id: '1'
                }
            }
        );

        const documentsTable = wrapper.findComponent(DocumentsTable, {
            props: {
                type: 'benefit-groups',
                id: '1'
            }
        });

        const confirmation = wrapper.findComponent(Confirmation);

        // Assertion parent component
        expect(pageTitle.exists()).toBe(true);
        expect(backButton.exists()).toBe(true);
        expect(confirmAndPublishButton.exists()).toBe(true);
        expect(pageTitle.text()).toEqual('Review Benefit Group Summary');
        expect(backButton.text()).toEqual('Back');
        expect(confirmAndPublishButton.text()).toEqual('Confirm & Publish');

        // Assertion Confirmation component
        expect(confirmation.exists()).toBe(true);
        expect(benefitGroupsDetails.exists()).toBe(true);
        expect(benefitGroupsBenefits.exists()).toBe(true);
        expect(documentsTable.exists()).toBe(true);
    });
});
