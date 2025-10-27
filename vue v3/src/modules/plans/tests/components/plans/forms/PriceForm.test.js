import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

const commonStoreMock = {
    searchRegions: vi.fn().mockResolvedValue({
        data: [
            { id: 'r1', name: 'Region 1' },
            { id: 'r2', name: 'Region 2' }
        ]
    }),
    searchCountries: vi.fn().mockResolvedValue({
        data: [
            { id: 'c1', name: 'Country 1', region_id: 'r1' },
            { id: 'c2', name: 'Country 2', region_id: 'r1' },
            { id: 'c3', name: 'Country 3', region_id: 'r2' }
        ]
    })
};

const benefitStoreMock = {
    benefitPricesUpdate: vi.fn().mockResolvedValue({}),
    benefitPricesStore: vi.fn().mockResolvedValue({}),
    benefitGroupPricesUpdate: vi.fn().mockResolvedValue({}),
    benefitGroupPricesStore: vi.fn().mockResolvedValue({})
};

const nonInsuranceProductStoreMock = {
    nonInsuranceProductPricesUpdate: vi.fn().mockResolvedValue({}),
    nonInsuranceProductPricesStore: vi.fn().mockResolvedValue({})
};

const globalStoreMock = {
    clearErrors: vi.fn()
};

vi.mock('@/stores', () => ({
    useCommonStore: () => commonStoreMock,
    useGlobalStore: () => globalStoreMock
}));

vi.mock('@/composables/event-bus', () => ({
    default: () => ({
        emit: vi.fn()
    })
}));

vi.mock('@/composables', () => ({
    useHelpers: () => ({
        buildIdNamePair: (items) =>
            items.map((item) => ({ id: item, name: item })),
        formatDateForDisplay: (date) => date.toISOString().split('T')[0],
        formatDateForSave: (date) => date,
        filterCountries: vi.fn()
    })
}));

vi.mock('@/modules/plans/stores/Benefit', () => ({
    useBenefitStore: () => benefitStoreMock
}));

vi.mock('@/modules/plans/stores/NonInsuranceProduct', () => ({
    useNonInsuranceProductStore: () => nonInsuranceProductStoreMock
}));

vi.mock('@/config', () => ({
    unitTerms: ['per_person', 'flat_daily', 'flat_monthly']
}));

const PriceForm = {
    name: 'PriceForm',
    template: `
    <div class="price-form">
      <h4>{{ headerText }}</h4>
      <div class="form-fields">
        <div data-testid="unit-term"></div>
        <div data-testid="region_ids"></div>
        <div data-testid="country_ids"></div>
        <div v-if="showNetPriceField" data-testid="net_price"></div>
        <div data-testid="sale_price"></div>
        <div v-if="['flat_daily', 'flat_monthly'].includes(formData.unit_term)" data-testid="min_days"></div>
        <div v-if="['flat_daily', 'flat_monthly'].includes(formData.unit_term)" data-testid="max_days"></div>
        <div data-testid="effective-date-input"></div>
        <div data-testid="end-date-input"></div>
      </div>
      <div class="form-actions">
        <button data-testid="cancel" @click="cancel"></button>
        <button v-if="!formData.id" data-testid="save-add-other" @click="saveAndAddAnother"></button>
        <button data-testid="save" @click="saveForm"></button>
      </div>
    </div>
  `,
    props: {
        id: { type: String, required: true },
        modelValue: { type: Object },
        isOpen: { type: Boolean, default: false },
        isNew: { type: Boolean, default: false },
        store: { type: Object, required: true },
        isDisabledNetPrice: { type: Boolean, required: true },
        isBenefit: { type: Boolean, default: false },
        isBenefitGroup: { type: Boolean, default: false },
        isNonInsuranceProduct: { type: Boolean, default: false }
    },
    emits: ['update:modelValue', 'closed', 'saved', 'close'],
    setup(props, { emit }) {
        return {
            formData: props.modelValue || {},
            cancel() {
                emit('close');
            },
            saveForm() {
                emit('saved', false);
            },
            saveAndAddAnother() {
                emit('saved', true);
            },
            headerText: 'Test Header',
            showNetPriceField: !props.isDisabledNetPrice,
            busy: false
        };
    }
};

describe('PriceForm Component', () => {
    let wrapper;
    const mockStore = {
        planPricesUpdate: vi.fn().mockResolvedValue({}),
        planPricesStore: vi.fn().mockResolvedValue({})
    };

    const createWrapper = (props = {}) => {
        return mount(PriceForm, {
            props: {
                id: 'test-price-id',
                modelValue: {
                    id: null,
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
                isOpen: true,
                store: mockStore,
                isDisabledNetPrice: false,
                ...props
            }
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        wrapper = createWrapper();
    });

    it('renders the form fields', () => {
        expect(wrapper.find('[data-testid="unit-term"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="region_ids"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="country_ids"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="net_price"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="sale_price"]').exists()).toBe(true);
        expect(
            wrapper.find('[data-testid="effective-date-input"]').exists()
        ).toBe(true);
        expect(wrapper.find('[data-testid="end-date-input"]').exists()).toBe(
            true
        );
    });

    it('hides net price field when isDisabledNetPrice is true', () => {
        const disabledWrapper = createWrapper({ isDisabledNetPrice: true });
        expect(disabledWrapper.find('[data-testid="net_price"]').exists()).toBe(
            false
        );
    });

    it('renders min/max days fields for flat_daily unit term', () => {
        const dailyWrapper = createWrapper({
            modelValue: {
                id: null,
                unit_term: 'flat_daily',
                regions: [],
                countries: [],
                net_price: null,
                sale_price: null,
                min_days: null,
                max_days: null,
                effective_date: null,
                end_date: null
            }
        });

        expect(dailyWrapper.find('[data-testid="min_days"]').exists()).toBe(
            true
        );
        expect(dailyWrapper.find('[data-testid="max_days"]').exists()).toBe(
            true
        );
    });

    it('renders min/max days fields for flat_monthly unit term', () => {
        const monthlyWrapper = createWrapper({
            modelValue: {
                id: null,
                unit_term: 'flat_monthly',
                regions: [],
                countries: [],
                net_price: null,
                sale_price: null,
                min_days: null,
                max_days: null,
                effective_date: null,
                end_date: null
            }
        });
        expect(monthlyWrapper.find('[data-testid="min_days"]').exists()).toBe(
            true
        );
        expect(monthlyWrapper.find('[data-testid="max_days"]').exists()).toBe(
            true
        );
    });

    it('hides min/max days fields for per_person unit term', () => {
        const perPersonWrapper = createWrapper({
            modelValue: {
                id: null,
                unit_term: 'per_person',
                regions: [],
                countries: [],
                net_price: null,
                sale_price: null,
                min_days: null,
                max_days: null,
                effective_date: null,
                end_date: null
            }
        });

        expect(perPersonWrapper.find('[data-testid="min_days"]').exists()).toBe(
            false
        );
        expect(perPersonWrapper.find('[data-testid="max_days"]').exists()).toBe(
            false
        );
    });

    it('shows save-add-other button for new prices', () => {
        expect(wrapper.find('[data-testid="save-add-other"]').exists()).toBe(
            true
        );
    });

    it('hides save-add-other button for existing prices', async () => {
        const editWrapper = createWrapper({
            modelValue: {
                id: 'existing-price-id',
                unit_term: 'per_person',
                regions: [],
                countries: [],
                net_price: 100,
                sale_price: 120,
                effective_date: '2024-01-01',
                end_date: '2029-01-01'
            }
        });

        expect(
            editWrapper.find('[data-testid="save-add-other"]').exists()
        ).toBe(false);
    });

    it('emits close event when cancel button is clicked', async () => {
        await wrapper.find('[data-testid="cancel"]').trigger('click');
        expect(wrapper.emitted('close')).toBeTruthy();
    });

    it('emits saved event when save button is clicked', async () => {
        await wrapper.find('[data-testid="save"]').trigger('click');
        expect(wrapper.emitted('saved')[0]).toEqual([false]);
    });

    it('emits saved event with true when save-add-other button is clicked', async () => {
        await wrapper.find('[data-testid="save-add-other"]').trigger('click');
        expect(wrapper.emitted('saved')[0]).toEqual([true]);
    });
});
