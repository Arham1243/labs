import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import IndexView from '@/modules/plans/views/plans/index.vue';
import { searchPlansMock } from '@/modules/plans/tests/mocks/Plan.service.mocks';

describe('Plans index view', () => {
    beforeEach(() => {
        searchPlansMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('page-title').text()).toBe('Plans');
        expect(wrapper.findByTestId('add-new-plan-button').text()).toBe(
            'New Plan'
        );

        expect(wrapper.findComponent({ name: 'PlansTable' }).exists()).toBe(
            true
        );
    });
});
