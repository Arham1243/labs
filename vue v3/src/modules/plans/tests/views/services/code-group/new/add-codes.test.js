import { ref } from 'vue';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import AddCodes from '@/modules/plans/views/services/code-group/new/add-codes.vue';
import { searchTagsMock } from '@/../tests/mocks/Common.service.mocks';
import {
    getCodeGroupMock,
    getCodeSetTagsMock,
    searchEntityServiceCodesMock,
    searchExcludedServicesCodesMock
} from '@/modules/plans/tests/mocks/CodeSet.service.mocks';

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

describe('code-group/new/add codes view', () => {
    beforeEach(() => {
        getCodeSetTagsMock();
        searchExcludedServicesCodesMock();
        searchEntityServiceCodesMock();
        getCodeGroupMock();
        searchTagsMock();
    });

    it('renders correctly', async () => {
        const wrapper = mount(AddCodes, {
            props: { id: '123', codeSetId: '567' }
        });

        await wrapper.vm.$nextTick();
        await flushPromises();

        expect(
            wrapper.findComponent({ name: 'CodeGroupsServiceCodes' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('continue-button').text()).toBe(
            'Save & Continue'
        );
    });
});
