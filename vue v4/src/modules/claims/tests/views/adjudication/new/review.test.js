import { describe, it, expect, beforeEach, vi } from 'vitest';
import ReviewView from '@/modules/claims/views/adjudication/new/review.vue';
import { useAdjudicationQueueStoreMock } from '@/modules/claims/tests/mocks/Adjudication.service.mock';
import { mount } from '@vue/test-utils';
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

describe('ReviewView', () => {
    let wrapper;

    beforeEach(() => (wrapper = mount(ReviewView, {})));

    it('component renders correctly', async () => {
        expect(wrapper.findByTestId('text-review-title').text()).toBe(
            'Review Auto Adjudication Summary'
        );

        expect(wrapper.findByTestId('text-details-title').text()).toBe(
            'Auto Adjudication Details'
        );

        expect(wrapper.findByTestId('text-rules-title').text()).toBe(
            'Adjudication Rules'
        );
    });
});
