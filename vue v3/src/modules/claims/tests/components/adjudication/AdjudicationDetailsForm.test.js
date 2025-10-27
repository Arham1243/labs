import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import AdjudicationDetailsForm from '@/modules/claims/components/adjudication/AdjudicationDetailsForm.vue';
import { useAdjudicationQueueStoreMock } from '@/modules/claims/tests/mocks/Adjudication.service.mock';

vi.mock('@/modules/claims/stores/AdjudicationQueue', () => ({
    useAdjudicationQueueStore: vi.fn(() => ({
        ...useAdjudicationQueueStoreMock()
    }))
}));

describe('AdjudicationDetailsForm', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(AdjudicationDetailsForm, {
            props: {}
        });
    });

    it('component renders correctly', () => {
        expect(wrapper.findByTestId('label-name').exists()).toBe(true);
        expect(wrapper.findByTestId('label-name').text()).toBe('Title *');
        expect(wrapper.findByTestId('text-audit-frequency').text()).toContain(
            'Send claims for audit, every'
        );
    });
});
