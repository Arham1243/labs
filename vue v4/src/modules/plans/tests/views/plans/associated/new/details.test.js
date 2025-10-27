import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import PlanDetailsView from '@/modules/plans/views/plans/associated/new/details.vue';
import { getPlanMock } from '@/modules/plans/tests/mocks/Plan.service.mocks';
import { getBusinessUnitMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { searchCompanyUsersMock } from '@/../tests/mocks/Common.service.mocks';
import { searchNonInsuranceProductMock } from '@/modules/plans/tests/mocks/NonInsuranceProduct.service.mocks';

describe('Plan details view', () => {
    beforeEach(() => {
        getPlanMock();
        getBusinessUnitMock();
        searchCompanyUsersMock();
        searchNonInsuranceProductMock();
    });

    it('index renders correctly', async () => {
        vi.mock(import('vue-router'), async (importOriginal) => {
            const mod = await importOriginal();
            return {
                ...mod,
                useRoute: vi.fn().mockReturnValue({ params: { id: '-1' } })
            };
        });

        const wrapper = mount(PlanDetailsView, {
            props: { id: '-1', plan: '879e4b4b-733d-4b4c-94bc-c34a7969e188' }
        });
        await flushPromises();

        expect(wrapper.findByTestId('plan-details-title').text()).toBe(
            'Plan Details'
        );

        expect(
            wrapper.findComponent({ name: 'PlanDetailsForm' }).exists()
        ).toBe(true);

        expect(
            wrapper.findComponent({ name: 'SectionPlanDetails' }).exists()
        ).toBe(true);

        expect(wrapper.findComponent({ name: 'BundlesForm' }).exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('cancel-button').text()).toBe('Cancel');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );
    });
});
