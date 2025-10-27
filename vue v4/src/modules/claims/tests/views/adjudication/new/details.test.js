import { describe, it, expect, beforeEach, vi } from 'vitest';
import DetailsView from '@/modules/claims/views/adjudication/new/details.vue';
import { useAdjudicationQueueStoreMock } from '@/modules/claims/tests/mocks/Adjudication.service.mock';
import { mount } from '@vue/test-utils';

vi.mock('@/modules/claims/stores/AdjudicationQueue', () => ({
    useAdjudicationQueueStore: vi.fn(() => ({
        ...useAdjudicationQueueStoreMock()
    }))
}));

describe('DetailsView', () => {
    let wrapper;

    beforeEach(() => (wrapper = mount(DetailsView, {})));

    it('component renders correctly', async () => {
        expect(wrapper.findByTestId('text-details-title').text()).toBe(
            'Adjudication Details'
        );
        expect(wrapper.findByTestId('input-name').exists()).toBe(true);
        expect(wrapper.findByTestId('input-description').exists()).toBe(true);
    });
});
