import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import SectionPlanDetails from '@/modules/plans/components/plans/associated/partials/SectionPlanDetails.vue';

// Mock the useHelpers composable
vi.mock('@/composables', () => ({
    useHelpers: () => ({
        formatDate: (date) => (date ? new Date(date).toLocaleDateString() : ''),
        getLocaleValue: (value) => value?.en || value
    })
}));

describe('SectionPlanDetails', () => {
    let wrapper;
    const mockPlan = {
        id: '1',
        name: { en: 'Test Plan' },
        business_unit: { name: { en: 'Test Business Unit' } },
        bound: 'inbound',
        type: 'individual',
        is_cancellations: true,
        is_extensions: false,
        is_early_returns: true,
        is_opt_out: false,
        is_refundable: true,
        is_overlap: false,
        effective_date: '2023-01-01',
        end_date: '2023-12-31'
    };

    beforeEach(() => {
        wrapper = mount(SectionPlanDetails, {
            props: {
                plan: mockPlan
            },
            global: {
                stubs: {
                    Tag: {
                        template: '<span class="tag">{{ value }}</span>',
                        props: ['value', 'class']
                    }
                },
                mocks: {
                    $t: (key) => {
                        const translations = {
                            'plans.inbound': 'Inbound',
                            'plans.individual': 'Individual',
                            'common.cancellations': 'Cancellations',
                            'common.early_returns': 'Early Returns',
                            'common.refundable': 'Refundable',
                            'common.effective_date': 'Effective Date',
                            'common.end_date': 'End Date'
                        };
                        return translations[key] || key;
                    }
                }
            }
        });
    });

    it('renders the component with plan details', () => {
        expect(
            wrapper.find('[data-testid="plan-details-container"]').exists()
        ).toBe(true);
    });

    it('displays the business unit name', () => {
        const businessUnitName = wrapper.find(
            '[data-testid="business-unit-name"]'
        );
        expect(businessUnitName.exists()).toBe(true);
        expect(businessUnitName.text()).toBe('Test Business Unit');
    });

    it('displays the plan name', () => {
        const planName = wrapper.find('[data-testid="plan-name"]');
        expect(planName.exists()).toBe(true);
        expect(planName.text().trim()).toBe('Test Plan');
    });

    it('displays plan details with correct flags', () => {
        const planDetails = wrapper.find('[data-testid="plan-details"]');
        expect(planDetails.exists()).toBe(true);

        const detailsText = planDetails.text();
        expect(detailsText).toContain('Inbound');
        expect(detailsText).toContain('Individual');
        expect(detailsText).toContain('Cancellations');
        expect(detailsText).not.toContain('Extensions');
        expect(detailsText).toContain('Early Returns');
        expect(detailsText).not.toContain('Opt Out');
        expect(detailsText).toContain('Refundable');
        expect(detailsText).not.toContain('Overlap');
    });

    it('displays plan dates', () => {
        const planDates = wrapper.find('[data-testid="plan-dates"]');
        expect(planDates.exists()).toBe(true);

        const datesText = planDates.text();
        expect(datesText).toContain('Effective Date');
        expect(datesText).toContain('End Date');
    });

    it('handles plan without end date', async () => {
        await wrapper.setProps({
            plan: {
                ...mockPlan,
                end_date: null
            }
        });

        const planDates = wrapper.find('[data-testid="plan-dates"]');
        const datesText = planDates.text();
        expect(datesText).toContain('Effective Date');
        expect(datesText).not.toContain('End Date');
    });
});
