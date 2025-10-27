import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';

import DetailsView from '@/modules/plans/views/services/code-set/new/details.vue';
import { getCodeSetMock } from '@/modules/plans/tests/mocks/CodeSet.service.mocks';

describe('code-set/new/details view', () => {
    beforeEach(() => {
        getCodeSetMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(DetailsView, { props: { id: '123' } });

        expect(wrapper.findByTestId('details-title').text()).toBe(
            'Code Set Details'
        );
        expect(
            wrapper.findComponent({ name: 'CodeSetDetailsForm' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('cancel-button').text()).toBe('Cancel');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );
    });
});
