import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NonInsuranceProductDetails from '@/modules/plans/components/non-insurance-product/NonInsuranceProductDetails.vue';
import { ref } from 'vue';

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

const mockHelpers = {
    getLocaleValue: vi.fn((val) => val?.en || '')
};

const mockNonInsuranceProductStore = {
    updateNonInsuranceProduct: vi.fn(),
    getNonInsuranceProduct: vi.fn(),
    setCurrentNonInsuranceProduct: vi.fn()
};

const mockGlobalStore = {
    clearErrors: vi.fn()
};

vi.mock('@/composables', () => ({
    useHelpers: () => mockHelpers
}));

vi.mock('@/modules/plans/stores/NonInsuranceProduct', () => ({
    useNonInsuranceProductStore: () => mockNonInsuranceProductStore
}));

vi.mock('@/stores', () => ({
    useGlobalStore: () => mockGlobalStore
}));

describe('NonInsuranceProductDetails', () => {
    const defaultProps = {
        data: {
            id: '123',
            name: { en: 'Test Non-Insurance Product' },
            description: { en: 'Test Description' },
            type: 'basic',
            plan_enabled: true,
            authorized: {
                id: '1',
                name: 'John Doe'
            }
        },
        isNew: false,
        isHide: false,
        componentId: 'non-insurance-product-details'
    };

    const mountOptions = {
        global: {
            mocks: {
                $t: (msg) => msg
            },
            stubs: {
                Button: true,
                NonInsuranceProductDetailsForm: true
            }
        },
        props: defaultProps
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders non-insurance-product details correctly in view mode', async () => {
        mockHelpers.getLocaleValue.mockImplementation((val) => val?.en);
        const wrapper = mount(NonInsuranceProductDetails, mountOptions);

        await wrapper.vm.$nextTick();
    });

    it('handles save correctly', async () => {
        const wrapper = mount(NonInsuranceProductDetails, mountOptions);
        await wrapper.vm.$nextTick();

        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        mockNonInsuranceProductStore.updateNonInsuranceProduct.mockResolvedValue(
            {
                success: true
            }
        );
        mockNonInsuranceProductStore.getNonInsuranceProduct.mockResolvedValue({
            data: {
                ...defaultProps.data,
                name: { en: 'Updated Name' }
            }
        });

        wrapper.vm.itemToUpdate = {
            ...defaultProps.data,
            name: { en: 'Updated Name' }
        };

        await wrapper.find('[data-testid="save-button"]').trigger('click');
        await wrapper.vm.$nextTick();

        expect(
            mockNonInsuranceProductStore.updateNonInsuranceProduct
        ).toHaveBeenCalledWith('123', {
            ...defaultProps.data,
            name: { en: 'Updated Name' },
            type: 'basic',
            authorized_by_id: '1'
        });
    });

    it('shows confirmation dialog when canceling with unsaved changes', async () => {
        const wrapper = mount(NonInsuranceProductDetails, mountOptions);
        await wrapper.vm.$nextTick();

        await wrapper.find('[data-testid="edit-button"]').trigger('click');

        wrapper.vm.itemToUpdate = {
            ...defaultProps.data,
            name: { en: 'Changed Name' }
        };

        await wrapper.find('[data-testid="cancel-button"]').trigger('click');
        await wrapper.vm.$nextTick();
    });

    it('hides edit button when isHide prop is true', async () => {
        const wrapper = mount(NonInsuranceProductDetails, {
            ...mountOptions,
            props: {
                ...defaultProps,
                isHide: true
            }
        });
        await wrapper.vm.$nextTick();

        expect(wrapper.find('[data-testid="edit-button"]').exists()).toBe(
            false
        );
    });

    it('exits edit mode and clears errors when confirmed in discard dialog', async () => {
        const wrapper = mount(NonInsuranceProductDetails, mountOptions);
        await wrapper.vm.$nextTick();

        await wrapper.find('[data-testid="edit-button"]').trigger('click');
        wrapper.vm.itemToUpdate = {
            ...defaultProps.data,
            name: { en: 'Changed Name' }
        };

        await wrapper.vm.exitEditing();
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.isEditing).toBe(false);
        expect(mockGlobalStore.clearErrors).toHaveBeenCalled();
    });
});
