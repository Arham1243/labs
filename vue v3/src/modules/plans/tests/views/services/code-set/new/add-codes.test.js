import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';

import AddCodes from '@/modules/plans/views/services/code-set/new/add-codes.vue';
import { searchTagsMock } from '@/../tests/mocks/Common.service.mocks';
import { searchEntityServiceCodesMock } from '@/modules/plans/tests/mocks/CodeSet.service.mocks';

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
        triggerCancelEdit: vi.fn()
    })
}));

describe('code-set/new/add codes view', () => {
    beforeEach(() => {
        searchTagsMock();
        searchEntityServiceCodesMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(AddCodes, { props: { id: '123' } });

        expect(
            wrapper.findComponent({ name: 'CodeSetsServiceCodes' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('continue-button').text()).toBe('Continue');
    });
});
