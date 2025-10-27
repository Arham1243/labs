import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import BenefitHistoryCard from '@/modules/claims/components/benefits/BenefitHistoryCard.vue';

describe('BenefitHistoryCard', () => {
    let wrapper;

    beforeEach(() => {
        wrapper = mount(BenefitHistoryCard, {
            props: {
                clientId: '12345',
                insuredId: '67890'
            }
        });
    });

    it('component BenefitHistoryTable renders correctly', () => {
        const columnTitles = wrapper.findAll('.p-column-title');

        expect(columnTitles).toHaveLength(9);
        expect(columnTitles[0].text()).toBe('Benefits');
        expect(columnTitles[1].text()).toBe('Total Expenses');
        expect(columnTitles[2].text()).toBe('Approved');
        expect(columnTitles[3].text()).toBe('Declined');
        expect(columnTitles[4].text()).toBe('Returned');
        expect(columnTitles[5].text()).toBe('Total Expense Amt');
        expect(columnTitles[6].text()).toBe('Approved Amt');
        expect(columnTitles[7].text()).toBe('Coverage Limit');
        expect(columnTitles[8].text()).toBe('Remaining');
    });
});
