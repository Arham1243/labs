import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import DetailsView from '@/modules/claims/views/adjudication/details.vue';
import { useAdjudicationQueueStoreMock } from '@/modules/claims/tests/mocks/Adjudication.service.mock';
import { useGeneralStoreMock } from '@/modules/claims/tests/mocks/General.service.mock';
import { useClaimPolicyStoreMock } from '@/modules/claims/tests/mocks/Policy.service.mock';

vi.mock('@/modules/claims/stores/AdjudicationQueue', () => ({
    useAdjudicationQueueStore: vi.fn(() => ({
        ...useAdjudicationQueueStoreMock()
    }))
}));

vi.mock('@/modules/claims/stores/General', () => ({
    useGeneralStore: vi.fn(() => ({
        ...useGeneralStoreMock()
    }))
}));

vi.mock('@/modules/claims/stores/Policy', () => ({
    useClaimPolicyStore: vi.fn(() => ({
        ...useClaimPolicyStoreMock()
    }))
}));

describe('DetailsView', () => {
    let wrapper;

    beforeEach(() => (wrapper = mount(DetailsView, {})));

    it('component renders correctly', async () => {
        expect(wrapper.findByTestId('tab-overview').text()).toBe('Overview');
        expect(wrapper.findByTestId('btn-back').exists()).toBe(true);
    });
});
