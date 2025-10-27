import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AttachPricing from '../../../components/shared/AttachPricing/AttachPricingInit.vue';

const PriceTable = {
    name: 'PriceTable',
    template: '<div class="price-table-stub"></div>',
    props: [
        'id',
        'isEditable',
        'store',
        'hasPriceBreakdown',
        'canRecalculatePricings'
    ]
};

const PriceForm = {
    name: 'PriceForm',
    template: '<div class="price-form-stub"></div>',
    props: [
        'modelValue',
        'id',
        'isOpen',
        'isDisabledNetPrice',
        'store',
        'isBenefit',
        'isBenefitGroup',
        'isNonInsuranceProduct'
    ]
};

const eventBusMock = {
    value: {
        get: vi.fn()
    }
};

const editStateMock = {
    activeEditComponent: { value: null },
    setActiveComponent: vi.fn(),
    clearActiveComponent: vi.fn(),
    registerCancelCallback: vi.fn(),
    unregisterCancelCallback: vi.fn()
};

vi.mock('@/composables/event-bus', () => ({
    default: () => ({ bus: eventBusMock })
}));

vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: () => editStateMock
}));

vi.mock('@/modules/plans/stores/Benefit', () => ({
    useBenefitStore: () => ({
        getPlan: vi.fn().mockResolvedValue({ data: {} }),
        searchBenefitGroupPrices: vi.fn().mockResolvedValue({ data: [] }),
        benefitGroupPricesStore: vi.fn().mockResolvedValue({}),
        benefitGroupPricesUpdate: vi.fn().mockResolvedValue({}),
        benefitGroupPricesDelete: vi.fn().mockResolvedValue({}),
        detachBenefitGroupWithPrices: vi.fn().mockResolvedValue({}),
        syncPrices: vi.fn().mockResolvedValue({ data: null })
    })
}));

vi.mock('@/modules/plans/stores/NonInsuranceProduct', () => ({
    useNonInsuranceProductStore: () => ({
        getPlan: vi.fn().mockResolvedValue({ data: {} }),
        searchNonInsuranceProductPrices: vi
            .fn()
            .mockResolvedValue({ data: [] }),
        nonInsuranceProductPricesStore: vi.fn().mockResolvedValue({}),
        nonInsuranceProductPricesUpdate: vi.fn().mockResolvedValue({}),
        nonInsuranceProductPricesDelete: vi.fn().mockResolvedValue({}),
        detachNonInsuranceProductWithPrices: vi.fn().mockResolvedValue({}),
        syncPrices: vi.fn().mockResolvedValue({ data: null })
    })
}));

describe('AttachPricing.vue', () => {
    let wrapper;
    const mockStore = {
        getPlan: vi.fn().mockResolvedValue({
            data: { effective_date: '2024-01-01', end_date: '2024-12-31' }
        }),
        searchPlanPrices: vi.fn().mockResolvedValue({ data: [] }),
        planPricesStore: vi.fn().mockResolvedValue({}),
        planPricesUpdate: vi.fn().mockResolvedValue({}),
        planPricesDelete: vi.fn().mockResolvedValue({}),
        detachPlanWithPrices: vi.fn().mockResolvedValue({}),
        syncPrices: vi.fn().mockResolvedValue({ data: null })
    };

    const createWrapper = (props = {}) => {
        return mount(AttachPricing, {
            global: {
                stubs: {
                    Button: true,
                    Confirmation: true,
                    PlanPriceGapChecker: true,
                    PriceTable: true,
                    PriceForm: true,
                    CopyFromParentDialog: true,
                    SyncPricesDialog: true
                },
                mocks: {
                    $t: (key) => key,
                    $ability: { can: () => true }
                },
                components: {
                    PriceTable,
                    PriceForm
                }
            },
            props: {
                id: 'test-id',
                title: 'Test Pricing',
                store: mockStore,
                isNew: false,
                componentId: 'attach-pricing-1',
                ...props
            },

            data() {
                return {
                    isEditing: false,
                    openDialog: false,
                    openCopyDialog: false,
                    item: {
                        unit_term: null,
                        regions: [],
                        countries: [],
                        net_price: null,
                        sale_price: null,
                        min_days: null,
                        max_days: null,
                        effective_date: null,
                        end_date: null
                    },
                    itemToUpdate: {
                        unit_term: null,
                        regions: [],
                        countries: [],
                        net_price: null,
                        sale_price: null,
                        min_days: null,
                        max_days: null,
                        effective_date: null,
                        end_date: null
                    },
                    discardDialog: false,
                    currentPlan: { value: null },
                    planPrices: [],
                    openSyncPricesDialog: false
                };
            }
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        wrapper = createWrapper();
    });

    it('renders the component with the correct title', () => {
        expect(wrapper.find('h5').text()).toBe('Test Pricing');
    });

    it('renders the edit button when not in edit mode', () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        expect(editButton.exists()).toBe(true);
    });
    it('calls store methods on mount', () => {
        expect(mockStore.searchPlanPrices).toHaveBeenCalledWith(
            'test-id',
            expect.any(Object),
            expect.any(Object)
        );
    });

    it('toggles edit mode when edit button is clicked', async () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');
        expect(wrapper.vm.isEditing).toBe(true);
    });

    it('creates a new price when createNewPrice is called', async () => {
        await wrapper.vm.createNewPrice();
        expect(wrapper.vm.openDialog).toBe(true);
    });
});
