import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import { ref } from 'vue';

import SelectServicesView from '@/modules/plans/views/benefits/benefit/new/select-services.vue';
import {
    getBenefitCodeServicesGroupsMock,
    searchBenefitEntityServiceCodesMock
} from '@/modules/plans/tests/mocks/Benefit.service.mocks';
import { searchCodeSetsMock } from '@/modules/plans/tests/mocks/CodeSet.service.mocks';

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

describe('Select Services view', () => {
    beforeEach(() => {
        searchCodeSetsMock();

        vi.mock('@/modules/plans/stores/Benefit', async (importOriginal) => {
            const mod = await importOriginal();
            return {
                ...mod,
                useBenefitStore: () => ({
                    currentBenefit: { individual_service_codes_count: null },
                    getBenefitCodeServicesGroups: async () =>
                        (await getBenefitCodeServicesGroupsMock()()).data,
                    searchBenefitEntityServiceCodes: async () =>
                        (await searchBenefitEntityServiceCodesMock()()).data
                })
            };
        });
    });

    it('renders correctly', async () => {
        const wrapper = mount(SelectServicesView, {
            props: { id: '7e9cefff-c0e8-4e7d-864d-08a8b3148a73' }
        });
        await flushPromises();

        expect(
            wrapper.findComponent({ name: 'BenefitServices' }).exists()
        ).toBe(true);

        expect(wrapper.findByTestId('back-button').text()).toBe('Back');
        expect(wrapper.findByTestId('save-continue-button').text()).toBe(
            'Save & Continue'
        );
    });
});
