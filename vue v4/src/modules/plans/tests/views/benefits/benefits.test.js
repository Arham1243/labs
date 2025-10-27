import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import BenefitsView from '@/modules/plans/views/benefits/benefits.vue';
import { searchBenefitsMock } from '@/modules/plans/tests/mocks/Benefit.service.mocks';

describe('Benefits view', () => {
    beforeEach(() => {
        searchBenefitsMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(BenefitsView);

        expect(wrapper.findComponent({ name: 'BenefitsTable' }).exists()).toBe(
            true
        );
    });
});
