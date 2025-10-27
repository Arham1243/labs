import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddNonInsuranceProductDialog from '@/modules/policies/components/dialogs/AddNonInsuranceProductDialog.vue';

// Mock the composables and stores
vi.mock(
    '@/modules/plans/composables/non-insurance-product/searchNonInsuranceProduct',
    () => ({
        useSearchNonInsuranceProduct: () => ({
            loadingNonInsuranceProducts: { value: false },
            nonInsuranceProducts: { value: [] },
            getNonInsuranceProducts: vi.fn()
        })
    })
);

vi.mock('@/stores', () => ({
    useGlobalStore: () => ({
        showSuccess: vi.fn()
    })
}));

vi.mock('@/modules/policies/stores/Insureds', () => ({
    useInsuredsStore: () => ({
        addNonInsuranceProduct: vi.fn().mockResolvedValue({})
    })
}));

vi.mock('@/modules/clients/stores/Client', () => ({
    useClientStore: () => ({
        searchClients: vi.fn().mockResolvedValue({ data: [] }),
        searchBusinessUnits: vi.fn().mockResolvedValue({ data: [] })
    })
}));

describe('AddNonInsuranceProductDialog.vue', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(AddNonInsuranceProductDialog, {
            props: {
                modelValue: false,
                insuredId: '123' // Add the required insuredId prop
            },
            global: {
                mocks: {
                    // Mock the missing property
                    isBusinessUnitFieldDisabled: false
                }
            }
        });
    });

    it('renders dialog and reacts to prop change', async () => {
        await wrapper.setProps({ modelValue: true, insuredId: '123' });

        expect(wrapper.vm.dialog).toBe(true);
    });

    it('resets form when dialog is closed', async () => {
        await wrapper.setProps({ modelValue: true, insuredId: '123' });

        wrapper.vm.dialog = false;

        expect(wrapper.vm.selectedNonInsuranceProduct).toBe(null);
        expect(wrapper.vm.startDate).toBe(null);
        expect(wrapper.vm.endDate).toBe(null);
    });
});
