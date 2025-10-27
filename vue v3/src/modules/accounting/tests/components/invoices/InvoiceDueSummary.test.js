import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import InvoiceDueSummary from '@/modules/accounting/components/invoices/InvoiceDueSummary.vue';
import helpers from '@/utils/helpers';

describe('InvoiceDueSummary.vue', () => {
    let wrapper;

    const summaryMock = [
        {
            title: '1-30 Days Past Due',
            amount: 490,
            currency: 'CAD',
            currency_sign: '$'
        },
        {
            title: '31-60 Days Past Due',
            amount: 492,
            currency: 'CAD',
            currency_sign: '$'
        },
        {
            title: '61-90 Days Past Due',
            amount: 1202,
            currency: 'CAD',
            currency_sign: '$'
        },
        {
            title: '90+ Days Past Due',
            amount: 0,
            currency: 'CAD',
            currency_sign: '$'
        }
    ];

    beforeEach(() => {
        wrapper = mount(InvoiceDueSummary, {
            props: {
                summary: summaryMock
            }
        });
    });

    it('renders the invoice due summary section', () => {
        const summarySection = wrapper.find(
            '[data-testid="invoice-due-summary"]'
        );
        expect(summarySection.exists()).toBe(true);
    });

    it('renders the correct number of summary blocks', () => {
        const blocks = wrapper.findAll(
            '[data-testid^="amount-due-range-label-"]'
        );
        expect(blocks).toHaveLength(summaryMock.length);
    });

    it('renders correct labels and amounts for each summary entry', () => {
        summaryMock.forEach((item, index) => {
            const label = wrapper.get(
                `[data-testid="amount-due-range-label-${index}"]`
            );
            const amount = wrapper.get(
                `[data-testid="amount-due-value-${index}"]`
            );

            expect(label.text()).toBe(item.title);
            expect(amount.text()).toBe(helpers.moneyFormat(item.amount));
        });
    });
});
