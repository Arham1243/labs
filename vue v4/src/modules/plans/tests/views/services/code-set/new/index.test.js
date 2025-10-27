import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import IndexView from '@/modules/plans/views/services/code-set/new/index.vue';
import { getCodeSetMock } from '@/modules/plans/tests/mocks/CodeSet.service.mocks';

describe('code-set/new/index view', () => {
    beforeEach(() => {
        getCodeSetMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('new-code-set-title').text()).toBe(
            'New Code Set'
        );
        expect(wrapper.findComponent({ name: 'StatusTag' }).exists()).toBe(
            false
        );

        expect(wrapper.findByTestId('back-button').exists()).toBe(true);

        expect(wrapper.findComponent({ name: 'Stepper' }).exists()).toBe(true);
    });
});
