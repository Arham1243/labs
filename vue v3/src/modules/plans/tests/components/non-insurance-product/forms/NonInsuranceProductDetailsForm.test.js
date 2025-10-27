import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import NonInsuranceProductDetailsForm from '@/modules/plans/components/non-insurance-product/forms/NonInsuranceProductDetailsForm.vue';

const mockCommonStore = {
    searchCompanyUsers: vi.fn()
};

const mockNonInsuranceProductStore = {
    getNonInsuranceProductType: vi.fn()
};

vi.mock('@/stores', () => ({
    useCommonStore: () => mockCommonStore
}));

vi.mock('@/modules/plans/stores/NonInsuranceProduct', () => ({
    useNonInsuranceProductStore: () => mockNonInsuranceProductStore
}));

describe('NonInsuranceProductDetailsForm', () => {
    const defaultProps = {
        modelValue: {
            name: {},
            description: {},
            type: null,
            plan_enabled: false,
            authorized: null
        },
        isNew: true
    };

    const mountOptions = {
        global: {
            mocks: {
                $t: (msg) => msg
            },
            stubs: {
                LocaleField: true,
                ApiDropdown: true,
                InputSwitch: true
            }
        },
        props: defaultProps
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockCommonStore.searchCompanyUsers.mockResolvedValue({ data: [] });
    });

    it('renders all form fields correctly', () => {
        const wrapper = mount(NonInsuranceProductDetailsForm, mountOptions);

        expect(wrapper.find('[data-testid="name-input"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="description-input"]').exists()).toBe(
            true
        );
        expect(wrapper.find('[data-testid="type-input"]').exists()).toBe(true);
        expect(
            wrapper.find('[data-testid="plan-enabled-input"]').exists()
        ).toBe(true);
        expect(
            wrapper.find('[data-testid="authorized-by-input"]').exists()
        ).toBe(true);
        expect(
            wrapper.find('[data-testid="integration-id-input"]').exists()
        ).toBe(true);
    });

    it('loads non-insurance-product types on mount', async () => {
        const wrapper = mount(NonInsuranceProductDetailsForm, mountOptions);
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.nonInsuranceProductType).toEqual([
            { type: 'FPI' },
            { type: 'Telehealth' }
        ]);
    });

    it('loads users on mount', async () => {
        const mockUsers = [
            { id: 1, name: 'User 1' },
            { id: 2, name: 'User 2' }
        ];

        mockCommonStore.searchCompanyUsers.mockResolvedValue({
            data: [
                { id: 1, name: 'User 1' },
                { id: 2, name: 'User 2' }
            ]
        });
        const wrapper = mount(NonInsuranceProductDetailsForm, mountOptions);
        await wrapper.vm.$nextTick();

        expect(mockCommonStore.searchCompanyUsers).toHaveBeenCalled();
        expect(wrapper.vm.users).toEqual(mockUsers);
    });

    it('emits update:modelValue when form data changes', async () => {
        const wrapper = mount(NonInsuranceProductDetailsForm, mountOptions);

        const newData = {
            ...defaultProps.modelValue,
            name: { en: 'New Name' }
        };

        wrapper.vm.formData = newData;
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0][0]).toEqual(newData);
    });

    it('handles user search correctly', async () => {
        const wrapper = mount(NonInsuranceProductDetailsForm, mountOptions);
        const searchTerm = 'test';

        await wrapper.vm.getUsers(searchTerm);

        expect(mockCommonStore.searchCompanyUsers).toHaveBeenCalledWith(
            {
                scopes: searchTerm
                    ? [{ name: 'fullNameLike', parameters: [searchTerm] }]
                    : []
            },
            { limit: 100 }
        );
    });

    it('sets loading states correctly during API calls', async () => {
        const wrapper = mount(NonInsuranceProductDetailsForm, mountOptions);

        mockCommonStore.searchCompanyUsers.mockImplementation(async () => {
            await new Promise((resolve) => setTimeout(resolve, 100));
            return { data: [] };
        });

        const getUsersPromise = wrapper.vm.getUsers('test');
        expect(wrapper.vm.loadingUsers).toBe(true);

        await getUsersPromise;
        expect(wrapper.vm.loadingUsers).toBe(false);
    });
});
