import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BusinessUnitPlanList from '@/modules/clients/components/partials/BusinessUnitPlanList.vue';
import { searchPlanByBusinessUnitUuidsMock } from '@/modules/plans/tests/mocks/Plan.service.mocks';

describe('BusinessUnitPlanList', () => {
    beforeEach(() => {
        searchPlanByBusinessUnitUuidsMock();
    });

    it('component renders correctly', async () => {
        const wrapper = mount(BusinessUnitPlanList, {
            props: {
                id: '0cc73a81-c7b4-4319-b79d-0a8efee37c1c'
            }
        });

        expect(wrapper.exists()).toBe(true);
    });
});
