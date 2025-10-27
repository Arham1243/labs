import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import ViewPricingDialog from '@/modules/plans/components/plans/associated/dialogs/ViewPricingDialog.vue';
import * as AssociatedPlanStore from '@/modules/plans/stores/AssociatedPlan';

// Mock the AssociatedPlanStore
vi.mock('@/modules/plans/stores/AssociatedPlan');

// Mock the PaginationOptions and SortFilterOptions
vi.mock('@/config', () => ({
    PaginationOptions: class {
        constructor() {
            this.page = 1;
            this.limit = 10;
        }
        getPageParams = () => ({ page: this.page, limit: this.limit });
    },
    SortFilterOptions: class {
        constructor() {
            this.search = '';
            this.sort = [];
            this.filters = [];
        }
        getSortFilters = () => ({
            search: { value: this.search },
            sort: this.sort,
            filters: this.filters
        });
    }
}));

// Mock the useHelpers composable and useI18n
vi.mock('@/composables', () => ({
    useHelpers: () => ({
        formatDate: (date) => (date ? new Date(date).toLocaleDateString() : ''),
        moneyFormat: (amount) => `$${amount.toFixed(2)}`
    })
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => {
            if (key === 'common.all_countries') return 'All Countries';
            return key;
        }
    })
}));

describe('ViewPricingDialog', () => {
    let wrapper;
    const mockSearchPlanPrices = vi.fn().mockResolvedValue({
        data: [
            {
                id: '1',
                unit_term: 'monthly',
                effective_date: '2023-01-01',
                end_date: '2023-12-31',
                net_price: 100,
                sale_price: 120,
                rules: [
                    {
                        origin_country_id: { id: 'c1', name: 'Country 1' },
                        destination_country_id: { id: 'c1', name: 'Country 1' },
                        residency_country_id: { id: 'c1', name: 'Country 1' }
                    }
                ]
            },
            {
                id: '2',
                unit_term: 'yearly',
                effective_date: '2023-01-01',
                end_date: null,
                net_price: 1000,
                sale_price: 1200,
                priceRules: [],
                rules: []
            }
        ]
    });

    const mockItem = {
        percentage: 10,
        condition: { name: 'More than', code: 'more_than' },
        num_of_dependants: 2
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        vi.mocked(AssociatedPlanStore.useAssociatedPlanStore).mockReturnValue({
            searchPlanPrices: mockSearchPlanPrices
        });

        wrapper = mount(ViewPricingDialog, {
            props: {
                modelValue: true,
                id: 'test-id',
                item: mockItem
            },
            global: {
                stubs: {
                    Dialog: {
                        template:
                            '<div :data-testid="$attrs[\'data-testid\']"><div class="dialog-header">{{ header }}</div><div class="dialog-content"><slot /></div></div>',
                        props: ['visible', 'header', 'modal', 'style'],
                        inheritAttrs: false,
                        emits: ['update:visible']
                    },
                    Loader: {
                        template: '<div>Loading...</div>'
                    }
                },
                mocks: {
                    $t: (key, params) => {
                        if (key === 'plans.discount_applied' && params) {
                            return `${params.percentage}% discount ${params.condition} ${params.num_of_dependants} dependants`;
                        }
                        if (key === 'unit_terms.monthly') return 'Monthly';
                        if (key === 'unit_terms.yearly') return 'Yearly';
                        return key;
                    }
                }
            }
        });

        // Wait for the component to mount and fetch data
        await nextTick();
    });

    it('renders the dialog when modelValue is true', () => {
        expect(wrapper.find('[data-testid="pricing-dialog"]').exists()).toBe(
            true
        );
    });

    it('calls searchPlanPrices on mount', () => {
        expect(mockSearchPlanPrices).toHaveBeenCalledWith(
            'test-id',
            expect.objectContaining({
                includes: expect.arrayContaining([{ relation: 'priceRules' }])
            }),
            expect.objectContaining({
                limit: 500
            })
        );
    });

    it('displays the discount message', () => {
        const discountMessage = wrapper.find(
            '[data-testid="discount-message"]'
        );
        expect(discountMessage.exists()).toBe(true);
        expect(discountMessage.text()).toContain(
            '10% discount More than 2 dependants'
        );
    });

    it('renders the pricing table with correct data', async () => {
        const table = wrapper.find('[data-testid="pricing-table"]');
        expect(table.exists()).toBe(true);

        // Check table headers
        const headers = table.findAll('th');
        expect(headers.length).toBe(9);
        expect(headers[0].text()).toBe('Unit Term');
        expect(headers[1].text()).toBe('Origin');
        expect(headers[2].text()).toBe('Destination');
        expect(headers[3].text()).toBe('Residency');
        expect(headers[6].text()).toBe('Net Price');

        // Check table rows
        const rows = table.findAll('tbody tr');
        expect(rows.length).toBe(2);

        // Check first row data
        const firstRowCells = rows[0].findAll('td');
        expect(firstRowCells[0].text()).toContain('Monthly');
        expect(firstRowCells[1].text()).toContain('Country 1');
        expect(firstRowCells[2].text()).toContain('Country 1');
        expect(firstRowCells[3].text()).toContain('Country 1');
        expect(firstRowCells[6].text()).toContain('$100.00');
        expect(firstRowCells[7].text()).toContain('$120.00');
        expect(firstRowCells[8].text()).toContain('$108.00'); // 120 - (120 * 10%)

        // Check second row data
        const secondRowCells = rows[1].findAll('td');
        expect(secondRowCells[0].text()).toContain('Yearly');
        expect(secondRowCells[1].text()).toContain('-'); // No origin country
        expect(secondRowCells[2].text()).toContain('-'); // No destination country
        expect(secondRowCells[3].text()).toContain('-'); // No residency country
        expect(secondRowCells[5].text()).toContain('-'); // No end date
        expect(secondRowCells[8].text()).toContain('$1080.00'); // 1200 - (1200 * 10%)
    });

    it('handles no discount case correctly', async () => {
        await wrapper.setProps({
            item: {
                ...mockItem,
                percentage: 0
            }
        });

        const discountMessage = wrapper.find(
            '[data-testid="discount-message"]'
        );
        expect(discountMessage.text()).toContain(
            'plans.no_discount_applied_yet'
        );

        // Check that dependant price shows '-' when no discount
        const rows = wrapper.findAll('tbody tr');
        const firstRowCells = rows[0].findAll('td');
        expect(firstRowCells[8].text()).toContain('-');
    });

    it('emits update:modelValue when dialog is closed', async () => {
        // Simulate dialog closing
        wrapper.vm.dialog = false;
        await nextTick();

        expect(wrapper.emitted('update:modelValue')).toBeTruthy();
        expect(wrapper.emitted('update:modelValue')[0]).toEqual([false]);
    });
});
