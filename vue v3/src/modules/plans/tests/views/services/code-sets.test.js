import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';

import CodeSetsView from '@/modules/plans/views/services/code-sets.vue';
import { searchCodeSetsMock } from '@/modules/plans/tests/mocks/CodeSet.service.mocks';

describe('Code Sets view', () => {
    beforeEach(() => {
        searchCodeSetsMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(CodeSetsView);

        expect(wrapper.findComponent({ name: 'CodeSetsTable' }).exists()).toBe(
            true
        );
    });
});
