import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import CategoryView from '@/modules/plans/views/benefits/categories.vue';
import { searchBenefitCategoriesMock } from '@/modules/plans/tests/mocks/Benefit.service.mocks';

describe('Categories view', () => {
    beforeEach(() => {
        searchBenefitCategoriesMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(CategoryView);

        expect(
            wrapper.findComponent({ name: 'CategoriesTable' }).exists()
        ).toBe(true);
    });
});
