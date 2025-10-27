import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AdjudicationRulesForm from '@/modules/claims/components/adjudication/AdjudicationRulesForm.vue';
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

describe('AdjudicationRulesForm', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(AdjudicationRulesForm, {
            props: {}
        });
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('btn-new-condition').exists()).toBe(true);
    });
});
