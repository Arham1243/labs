import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NonInsuranceProductable from '@/modules/plans/components/non-insurance-product/tables/NonInsuranceProductable.vue';

const mockNonInsuranceProductStore = {
    searchNonInsuranceProduct: vi.fn(),
    deleteNonInsuranceProduct: vi.fn(),
    updateNonInsuranceProductStatus: vi.fn()
};

const mockHelpers = {
    getLocaleValue: vi.fn((val) => val?.en || '')
};

const mockI18n = {
    t: (key) => key,
    locale: { value: 'en' },
    availableLocales: ['en', 'fr']
};

vi.mock('@/modules/plans/stores/NonInsuranceProduct', () => ({
    useNonInsuranceProductStore: () => mockNonInsuranceProductStore
}));

vi.mock('@/composables', () => ({
    useHelpers: () => mockHelpers
}));

vi.mock('vue-i18n', () => ({
    useI18n: () => mockI18n
}));

describe('NonInsuranceProductTable', () => {
    const mockItems = [
        {
            id: 1,
            name: { en: 'Non-Insurance Product 1' },
            type: 'basic',
            plan_enabled: true,
            status: 'active'
        },
        {
            id: 2,
            name: { en: 'Non-Insurance Product 2' },
            type: 'premium',
            plan_enabled: false,
            status: 'inactive'
        }
    ];

    const mountOptions = {
        global: {
            mocks: {
                $t: (msg) => msg
            },
            stubs: {
                BaseTable: true,
                Column: true,
                Search: true,
                Button: true,
                Menu: true,
                StatusTag: true,
                Label: true,
                Confirmation: true
            }
        }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockNonInsuranceProductStore.searchNonInsuranceProduct.mockResolvedValue(
            {
                data: mockItems,
                meta: { total: mockItems.length }
            }
        );
    });

    it('loads non-insurance-product data on mount', async () => {
        const wrapper = mount(NonInsuranceProductable, mountOptions);
        await wrapper.vm.$nextTick();

        expect(
            mockNonInsuranceProductStore.searchNonInsuranceProduct
        ).toHaveBeenCalled();
        expect(wrapper.vm.items).toEqual(mockItems);
        expect(wrapper.vm.totalRecords).toBe(mockItems.length);
    });

    it('handles search functionality', async () => {
        const wrapper = mount(NonInsuranceProductable, mountOptions);
        await wrapper.vm.$nextTick();

        wrapper.vm.searchText = 'test';
        await wrapper.vm.search();

        expect(
            mockNonInsuranceProductStore.searchNonInsuranceProduct
        ).toHaveBeenCalledWith(
            expect.objectContaining({
                search: { value: 'test' }
            }),
            expect.any(Object)
        );
    });

    it('handles status update correctly', async () => {
        const wrapper = mount(NonInsuranceProductable, mountOptions);
        await wrapper.vm.$nextTick();

        wrapper.vm.selectedItem = mockItems[0];

        await wrapper.vm.updateStatus();

        expect(
            mockNonInsuranceProductStore.updateNonInsuranceProductStatus
        ).toHaveBeenCalledWith(
            1,
            expect.objectContaining({
                status: 'inactive'
            })
        );
    });

    it('handles delete functionality', async () => {
        const wrapper = mount(NonInsuranceProductable, mountOptions);
        await wrapper.vm.$nextTick();

        wrapper.vm.selectedItem = mockItems[0];

        await wrapper.vm.deleteItem();

        expect(
            mockNonInsuranceProductStore.deleteNonInsuranceProduct
        ).toHaveBeenCalledWith(1);
        expect(
            mockNonInsuranceProductStore.searchNonInsuranceProduct
        ).toHaveBeenCalled();
    });

    it('computes correct dialog content based on item status', async () => {
        const wrapper = mount(NonInsuranceProductable, mountOptions);

        wrapper.vm.selectedItem = mockItems[0];
        expect(wrapper.vm.statusDialogHeader).toBe(
            'non_insurance_products.make_non_insurance_product_inactive'
        );

        wrapper.vm.selectedItem = mockItems[1];
        expect(wrapper.vm.statusDialogHeader).toBe(
            'non_insurance_products.make_non_insurance_product_active'
        );
    });
});
