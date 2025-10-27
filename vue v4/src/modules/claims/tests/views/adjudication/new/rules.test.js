import { describe, it, expect, beforeEach, vi } from 'vitest';
import RulesView from '@/modules/claims/views/adjudication/new/rules.vue';
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

describe('RulesView', () => {
    let wrapper;

    beforeEach(() => (wrapper = mount(RulesView, {})));

    it('component renders correctly', async () => {
        // console.log(wrapper.html())
        expect(wrapper.findByTestId('text-rules-title').text()).toBe(
            'Adjudication Rules'
        );
        expect(wrapper.findByTestId('input-operator').exists()).toBe(true);
        expect(wrapper.findByTestId('btn-new-condition').exists()).toBe(true);
    });
});
