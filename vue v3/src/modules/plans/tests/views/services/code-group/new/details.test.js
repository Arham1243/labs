import { describe, expect, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DetailsView from '@/modules/plans/views/services/code-group/new/details.vue';
import {
    getCodeGroupMock,
    searchCodeSetsMock
} from '@/modules/plans/tests/mocks/CodeSet.service.mocks';

describe('code-group/new/details view', () => {
    beforeEach(() => {
        getCodeGroupMock();
        searchCodeSetsMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(DetailsView, { props: { id: '123' } });

        expect(wrapper.findByTestId('details-title').text()).toBe(
            'Code Group Details'
        );
        expect(
            wrapper.findComponent({ name: 'CodeGroupDetailsForm' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('cancel-button').text()).toBe('Cancel');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );
    });
});
