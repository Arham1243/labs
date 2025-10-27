import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/claims/views/adjudication/index.vue';
import { useAdjudicationQueueStoreMock } from '@/modules/claims/tests/mocks/Adjudication.service.mock';
import { useGeneralStoreMock } from '@/modules/claims/tests/mocks/General.service.mock';
import { useClaimPolicyStoreMock } from '@/modules/claims/tests/mocks/Policy.service.mock';

vi.mock('@/modules/claims/stores/AdjudicationQueue', () => ({
    useAdjudicationQueueStore: vi.fn(() => ({
        ...useAdjudicationQueueStoreMock()
    }))
}));

describe('IndexView', () => {
    let wrapper;

    beforeEach(() => (wrapper = mount(IndexView, {})));

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('input-search-date').exists()).toBe(true);
        expect(wrapper.findByTestId('btn-new-queue').exists()).toBe(true);
    });
});
