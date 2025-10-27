import { beforeEach, describe, expect, it } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';

import PlanDetailsView from '@/modules/plans/views/plans/new/plan-details.vue';
import { getPlanMock } from '@/modules/plans/tests/mocks/Plan.service.mocks';
import { searchCompanyUsersMock } from '@/../tests/mocks/Common.service.mocks';
import { searchNonInsuranceProductMock } from '@/modules/plans/tests/mocks/NonInsuranceProduct.service.mocks';

describe('Plan details view', () => {
    beforeEach(() => {
        getPlanMock();
        searchCompanyUsersMock();
        searchNonInsuranceProductMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(PlanDetailsView, {
            props: { id: '-1' }
        });
        await flushPromises();

        expect(wrapper.findByTestId('plan-details-title').text()).toBe(
            'Plan Details'
        );
        expect(wrapper.findByTestId('select-from-existing-button').text()).toBe(
            'Select from existing'
        );
        expect(
            wrapper.findComponent({ name: 'PlanDetailsForm' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('set-period-dates-title').text()).toBe(
            'Set Enrolment Period Dates'
        );
        expect(
            wrapper.findComponent({ name: 'PeriodDatesForm' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('set-policy-actions-title').text()).toBe(
            'Set Policy Actions'
        );
        expect(
            wrapper.findComponent({ name: 'PolicyActionFrom' }).exists()
        ).toBe(true);

        expect(
            wrapper.findByTestId('bundle-non-insurance-product-title').text()
        ).toBe('Bundles');
        expect(wrapper.findComponent({ name: 'BundlesForm' }).exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('policy-defaults-title').text()).toBe(
            'Policy Defaults'
        );
        expect(
            wrapper.findComponent({ name: 'PolicyDefaultForm' }).exists()
        ).toBe(true);
        expect(wrapper.findByTestId('main-default-plan-card').text()).toBe(
            'This is a main default plan that will be the base plan for any associated plans.'
        );

        expect(wrapper.findByTestId('cancel-button').text()).toBe('Cancel');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );
    });
});
