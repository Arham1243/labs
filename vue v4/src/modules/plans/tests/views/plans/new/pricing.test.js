import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, ref } from 'vue';

import PricingView from '@/modules/plans/views/plans/new/pricing.vue';
import { searchPlanPricesMock } from '@/modules/plans/tests/mocks/Plan.service.mocks';

vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: () => ({
        activeEditComponent: ref(null),
        showUnsavedDialog: ref(false),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn(),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        registerCancelCallback: vi.fn(),
        unregisterCancelCallback: vi.fn(),
        triggerCancelEdit: vi.fn(),
        isAnyComponentEditing: computed(() => false),
        shouldUseLazy: computed(() => true)
    }),
    provideEditState: vi.fn().mockReturnValue({
        activeEditComponent: ref(null),
        showUnsavedDialog: ref(false),
        setActiveComponent: vi.fn(),
        clearActiveComponent: vi.fn(),
        handleUnsavedChanges: vi.fn(),
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        registerCancelCallback: vi.fn(),
        unregisterCancelCallback: vi.fn(),
        triggerCancelEdit: vi.fn(),
        isAnyComponentEditing: computed(() => false),
        shouldUseLazy: computed(() => true)
    })
}));

describe('Plan details view', () => {
    beforeEach(() => {
        searchPlanPricesMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(PricingView, { props: { id: '-1' } });

        expect(
            wrapper.findComponent({ name: 'AttachPricingInit' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('back-button').text()).toBe('Back');

        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );
    });
});
