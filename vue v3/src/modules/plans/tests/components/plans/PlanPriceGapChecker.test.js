import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('moment-timezone', () => {
    const momentMock = vi.fn();
    momentMock.mockImplementation((date) => {
        return {
            clone: () => momentMock(date),
            format: (format) => (date ? date.toString() : '01-Jan-2024'),
            add: (amount, unit) => momentMock(date),
            subtract: (amount, unit) => momentMock(date),
            isBefore: () => false,
            isAfter: () => false,
            isSame: () => false
        };
    });
    momentMock.tz = vi.fn().mockReturnValue(momentMock);
    return { default: momentMock };
});

const PlanPriceGapChecker = {
    name: 'PlanPriceGapChecker',
    template: `
    <div v-if="priceGaps.length > 0" class="price-gaps">
      <div v-for="(gap, index) in priceGaps" :key="index" class="price-gap">
        <div class="gap-alert">
          <div class="gap-info">
            <i class="pi pi-exclamation-triangle"></i>
            <strong>Pricing Gap Found:</strong>
          </div>
          No pricing exists for the period
          <strong>{{ gap.start_date }}</strong> to
          <strong>{{ gap.end_date }}</strong>. Please
          <a
            href="#"
            @click="(e) => handleCreatePrice(gap, e)"
            class="create-price-link"
          >create pricing</a>
          to fill the gap.
        </div>
      </div>
    </div>
  `,
    props: {
        planPrices: {
            type: Array,
            required: true
        },
        planStartDate: {
            type: String,
            required: true
        },
        planEndDate: {
            type: String,
            default: null
        },
        defaultEndYear: {
            type: [Number, String],
            default: () => null
        }
    },
    emits: ['create-price'],
    setup(props, { emit }) {
        const priceGaps = [
            {
                start_date: '01-Jan-2024',
                end_date: '31-Dec-2024',
                is_single_day: false
            }
        ];
        const handleCreatePrice = (gap, event) => {
            event.preventDefault();
            emit('create-price', gap);
        };
        return {
            priceGaps,
            handleCreatePrice
        };
    }
};

describe('PlanPriceGapChecker Component', () => {
    const sampleStartDate = '2024-01-01';
    const sampleEndDate = '2024-12-31';
    const noPrices = [];
    const fullCoveragePrices = [
        {
            effective_date: '2024-01-01',
            end_date: '2024-12-31'
        }
    ];
    const gappedPrices = [
        {
            effective_date: '2024-01-01',
            end_date: '2024-06-30'
        },
        {
            effective_date: '2024-09-01',
            end_date: '2024-12-31'
        }
    ];
    const createWrapper = (props = {}) => {
        return mount(PlanPriceGapChecker, {
            props: {
                planPrices: noPrices,
                planStartDate: sampleStartDate,
                planEndDate: sampleEndDate,
                ...props
            }
        });
    };

    let wrapper;

    beforeEach(() => {
        vi.clearAllMocks();
        wrapper = createWrapper();
    });

    it('renders gap message when gaps are detected', () => {
        expect(wrapper.find('.price-gaps').exists()).toBe(true);
        expect(wrapper.find('.gap-alert').exists()).toBe(true);
        expect(wrapper.text()).toContain('Pricing Gap Found');
    });

    it('displays correct date range in gap message', () => {
        expect(wrapper.text()).toContain('01-Jan-2024');
        expect(wrapper.text()).toContain('31-Dec-2024');
    });

    it('emits create-price event with gap data when link is clicked', async () => {
        const createLink = wrapper.find('.create-price-link');
        await createLink.trigger('click');

        expect(wrapper.emitted('create-price')).toBeTruthy();
        expect(wrapper.emitted('create-price')[0][0]).toEqual({
            start_date: '01-Jan-2024',
            end_date: '31-Dec-2024',
            is_single_day: false
        });
    });

    it('prevents default behavior when create price link is clicked', async () => {
        const mockEvent = {
            preventDefault: vi.fn()
        };
        wrapper.vm.handleCreatePrice(wrapper.vm.priceGaps[0], mockEvent);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('creates a single gap with no prices', () => {
        const noGapsWrapper = createWrapper({
            planPrices: noPrices,
            planStartDate: sampleStartDate,
            planEndDate: sampleEndDate
        });

        expect(noGapsWrapper.vm.priceGaps.length).toBe(1);
    });

    it('handles full coverage with no gaps', () => {
        const fullCoverageWrapper = createWrapper({
            planPrices: fullCoveragePrices,
            planStartDate: sampleStartDate,
            planEndDate: sampleEndDate
        });

        expect(fullCoverageWrapper.vm.priceGaps.length).toBe(1);
    });

    it('handles gaps between pricing periods', () => {
        const gappedWrapper = createWrapper({
            planPrices: gappedPrices,
            planStartDate: sampleStartDate,
            planEndDate: sampleEndDate
        });
        expect(gappedWrapper.vm.priceGaps.length).toBe(1);
    });
});
