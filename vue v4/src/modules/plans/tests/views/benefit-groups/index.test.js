import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/plans/views/benefit-groups/index.vue';
import {
    searchBenefitGroupBenefitsMock,
    searchBenefitGroupsMock
} from '@/modules/plans/tests/mocks/Benefit.service.mocks';

describe('Benefit groups index view', () => {
    beforeEach(() => {
        searchBenefitGroupBenefitsMock();
        searchBenefitGroupsMock();
    });

    it('page renders correctly', async () => {
        const wrapper = mount(IndexView);

        // expect(wrapper.findByTestId('page-title').text()).toBe(
        //     'Benefit Groups'
        // );

        // expect(
        //     wrapper.findByTestId('add-new-benefit-group-button').text()
        // ).toBe('New Benefit Group');

        expect(
            wrapper.findComponent({ name: 'BenefitGroupsTable' }).exists()
        ).toBe(true);
    });
});
