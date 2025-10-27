import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AdjudicationOverview from '@/modules/claims/components/adjudication/AdjudicationOverview.vue';
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

describe('AdjudicationOverview', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(AdjudicationOverview, {
            props: {}
        });
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('text-details-title').text()).toBe(
            'Auto Adjudication Details'
        );

        expect(wrapper.findByTestId('text-rules-title').text()).toBe(
            'Adjudication Rules'
        );

        expect(wrapper.findByTestId('btn-edit-details').exists()).toBe(true);
        expect(wrapper.findByTestId('btn-edit-rules').exists()).toBe(true);
    });
});
