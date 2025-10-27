import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import DetailsView from '@/modules/plans/views/benefits/benefit/new/details.vue';
import {
    searchVendorsMock,
    searchUnderwritersMock,
    searchBenefitCategoriesMock
} from '@/../tests/mocks/Common.service.mocks';

describe('Details view', () => {
    beforeEach(() => {
        searchBenefitCategoriesMock();
        searchUnderwritersMock();
        searchVendorsMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(DetailsView, {
            props: { id: '-1' }
        });

        expect(wrapper.findByTestId('details-title').text()).toBe(
            'Benefit Details'
        );
        expect(wrapper.findByTestId('restrictions-title').text()).toBe(
            'Benefit Restrictions & Reporting'
        );

        expect(
            wrapper.findComponent({ name: 'BenefitDetailsForm' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('cancel-button').text()).toBe('Cancel');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );

        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );
    });
});
