import { describe, it, expect, beforeEach, vi } from 'vitest';
import IndexView from '@/modules/claims/views/adjudication/new/index.vue';
import { useAdjudicationQueueStoreMock } from '@/modules/claims/tests/mocks/Adjudication.service.mock';
import { mount } from '@vue/test-utils';
import { useGeneralStoreMock } from '@/modules/claims/tests/mocks/General.service.mock';

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

describe('IndexView', () => {
    let wrapper;

    beforeEach(() => (wrapper = mount(IndexView, {})));

    it('component renders correctly', async () => {
        // expect(wrapper.findByTestId('text-title').text()).toBe(
        //     'Auto Adjudication'
        // );
        //
        expect(wrapper.findByTestId('text-title').text()).toBe(
            'New Adjudication Queue'
        );
        //
        expect(wrapper.findByTestId('btn-back').exists()).toBe(true);
        expect(wrapper.findByTestId('btn-next').exists()).toBe(true);
    });
});
