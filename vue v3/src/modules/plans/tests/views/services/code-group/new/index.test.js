import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/plans/views/services/code-group/new/index.vue';
import { getCodeGroupMock } from '@/modules/plans/tests/mocks/CodeSet.service.mocks';

describe('code-set/new/index view', () => {
    beforeEach(() => {
        getCodeGroupMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('new-code-group-title').text()).toBe(
            'New Code Group'
        );
        expect(wrapper.findComponent({ name: 'StatusTag' }).exists()).toBe(
            false
        );

        expect(wrapper.findByTestId('back-button').exists()).toBe(true);

        expect(wrapper.findComponent({ name: 'Steps' }).exists()).toBe(true);
    });
});
