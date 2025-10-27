import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import BundlesForm from '@/modules/plans/components/plans/forms/BundlesForm.vue';
import { searchNonInsuranceProductMock } from '@/modules/plans/tests/mocks/NonInsuranceProduct.service.mocks';

// Mock the event bus
const mockEmit = vi.fn();
vi.mock('@/composables/event-bus', () => ({
    default: vi.fn(() => ({
        emit: mockEmit
    }))
}));

describe('BundlesForm - Rendering Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        searchNonInsuranceProductMock();
    });

    it('component renders correctly', async () => {
        const wrapper = mount(BundlesForm, {
            props: {
                modelValue: {}
            }
        });

        expect(
            wrapper
                .findByTestId('should-include-non-insurance-products-input')
                .exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('include-non-insurance-products-label').text()
        ).toBe('Include Non-Insurance Products');
    });

    it('does not show ApiMultiselect when shouldIncludeNonInsuranceProducts is false', async () => {
        const wrapper = mount(BundlesForm, {
            props: {
                modelValue: {
                    shouldIncludeNonInsuranceProducts: false
                }
            }
        });

        await nextTick();
        const multiselect = wrapper.findByTestId(
            'include-non-insurance-product-dropdown'
        );
        expect(multiselect.isVisible()).toBe(false);
    });

    it('shows ApiMultiselect when shouldIncludeMNonInsuranceProduct is true', async () => {
        const wrapper = mount(BundlesForm, {
            props: {
                modelValue: {
                    shouldIncludeNonInsuranceProducts: true
                }
            }
        });

        await nextTick();
        const multiselect = wrapper.findByTestId(
            'include-non-insurance-product-dropdown'
        );
        expect(multiselect.exists()).toBe(true);
    });
});

describe('BundlesForm - Interaction Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        searchNonInsuranceProductMock();
    });

    it('emits nonInsuranceProductChanged event when NonInsuranceProduct are added', async () => {
        const wrapper = mount(BundlesForm, {
            props: {
                modelValue: {
                    non_insurance_products: []
                }
            }
        });

        // Add NonInsuranceProduct
        await wrapper.setProps({
            modelValue: {
                non_insurance_products: [
                    {
                        id: '1736520641618864298',
                        name: { en: 'Test Non-Insurance Product' }
                    }
                ]
            }
        });

        // Check that event was emitted with correct action
        expect(wrapper.emitted('nonInsuranceProductChanged')).toBeTruthy();
        expect(wrapper.emitted('nonInsuranceProductChanged')[0][0]).toEqual({
            action: 'added',
            nonInsuranceProduct: [
                {
                    id: '1736520641618864298',
                    name: { en: 'Test Non-Insurance Product' }
                }
            ]
        });
    });

    it('emits nonInsuranceProductChanged event when non-insurance-product are removed', async () => {
        const wrapper = mount(BundlesForm, {
            props: {
                modelValue: {
                    non_insurance_products: [
                        {
                            id: '1736520641618864298',
                            name: { en: 'Test Non-Insurance Product' }
                        }
                    ]
                }
            }
        });

        // Remove all Non-Insurance Product
        await wrapper.setProps({
            modelValue: {
                non_insurance_products: []
            }
        });

        // Check that event was emitted with correct action
        expect(wrapper.emitted('nonInsuranceProductChanged')).toBeTruthy();
        expect(wrapper.emitted('nonInsuranceProductChanged')[0][0]).toEqual({
            action: 'removed'
        });
    });

    it('emits nonInsuranceProductChanged event when non-insurance-product are changed', async () => {
        const wrapper = mount(BundlesForm, {
            props: {
                modelValue: {
                    non_insurance_products: [
                        {
                            id: '1736520641618864298',
                            name: { en: 'Test Non-Insurance Product' }
                        }
                    ]
                }
            }
        });

        // Change to two NonInsuranceProduct
        await wrapper.setProps({
            modelValue: {
                non_insurance_products: [
                    {
                        id: '1736520641618864298',
                        name: { en: 'Test Non-Insurance Product' }
                    },
                    {
                        id: '1736520592100850377',
                        name: { en: 'Another Non-Insurance Product' }
                    }
                ]
            }
        });

        // Check that event was emitted with correct action
        expect(wrapper.emitted('nonInsuranceProductChanged')).toBeTruthy();
        expect(wrapper.emitted('nonInsuranceProductChanged')[0][0]).toEqual({
            action: 'changed',
            nonInsuranceProduct: [
                {
                    id: '1736520641618864298',
                    name: { en: 'Test Non-Insurance Product' }
                },
                {
                    id: '1736520592100850377',
                    name: { en: 'Another Non-Insurance Product' }
                }
            ]
        });
    });

    it('clears non-insurance-product when shouldIncludeNonInsuranceProducts is set to false', async () => {
        const wrapper = mount(BundlesForm, {
            props: {
                modelValue: {
                    shouldIncludeNonInsuranceProducts: true,
                    non_insurance_products: [
                        {
                            id: '1736520641618864298',
                            name: { en: 'Test Non-Insurance Product' }
                        }
                    ]
                }
            }
        });

        // Set shouldIncludeNonInsuranceProducts to false
        await wrapper.setProps({
            modelValue: {
                shouldIncludeNonInsuranceProducts: false,
                non_insurance_products: [
                    {
                        id: '1736520641618864298',
                        name: { en: 'Test Non-Insurance Product' }
                    }
                ]
            }
        });

        // Check that event was emitted with correct action
        expect(wrapper.emitted('nonInsuranceProductChanged')).toBeTruthy();
        expect(wrapper.emitted('nonInsuranceProductChanged')[0][0]).toEqual({
            action: 'disabled'
        });
    });

    it('initializes correctly when non-insurance-product are provided', async () => {
        // Mock the non-insurance-product data
        const nonInsuranceProduct = [
            {
                id: '1736520641618864298',
                name: {
                    en: 'Test copy Dicta est numquam Na Copy',
                    fr: 'null Copy'
                }
            }
        ];

        const wrapper = mount(BundlesForm, {
            props: {
                modelValue: {
                    non_insurance_products: nonInsuranceProduct,
                    shouldIncludeNonInsuranceProducts: true
                }
            }
        });

        await nextTick();

        // Check that the dropdown is visible, which indicates shouldIncludeMNonInsuranceProduct is true
        const dropdown = wrapper.findByTestId(
            'include-non-insurance-product-dropdown'
        );
        expect(dropdown.exists()).toBe(true);
        expect(dropdown.isVisible()).toBe(true);
    });
});
