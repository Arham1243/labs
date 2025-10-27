import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InvoiceStatusTag from '@/modules/accounting/components/invoices/InvoiceStatusTag.vue';

describe('InvoiceStatusTag.vue', () => {
    let wrapper;

    const createWrapper = (status) => {
        wrapper = mount(InvoiceStatusTag, {
            props: {
                status
            }
        });
    };

    it('renders the tag with the correct status "unpaid"', () => {
        createWrapper('unpaid');
        const tag = wrapper.find('[data-testid="invoice-status-tag"]');

        expect(tag.exists()).toBe(true);
        expect(tag.text()).toBe('UNPAID');
        expect(tag.classes()).toContain('unpaid');
    });

    it('renders the tag with the correct status "overdue"', () => {
        createWrapper('overdue');
        const tag = wrapper.find('[data-testid="invoice-status-tag"]');

        expect(tag.exists()).toBe(true);
        expect(tag.text()).toBe('OVERDUE');
        expect(tag.classes()).toContain('overdue');
    });

    it('renders the tag with the correct status "cancelled"', () => {
        createWrapper('cancelled');
        const tag = wrapper.find('[data-testid="invoice-status-tag"]');

        expect(tag.exists()).toBe(true);
        expect(tag.text()).toBe('CANCELLED');
        expect(tag.classes()).toContain('cancelled');
    });

    it('renders the tag with the correct status "void"', () => {
        createWrapper('void');
        const tag = wrapper.find('[data-testid="invoice-status-tag"]');

        expect(tag.exists()).toBe(true);
        expect(tag.text()).toBe('VOID');
        expect(tag.classes()).toContain('void');
    });

    it('renders the tag with the correct status "partial_pymt"', () => {
        createWrapper('partial_pymt');
        const tag = wrapper.find('[data-testid="invoice-status-tag"]');

        expect(tag.exists()).toBe(true);
        expect(tag.text()).toBe('PARTIAL PYMT');
        expect(tag.classes()).toContain('partial_pymt');
    });

    it('does not render the tag if no status is provided', () => {
        wrapper = mount(InvoiceStatusTag, {
            props: {
                status: null
            }
        });

        const tag = wrapper.find('[data-testid="invoice-status-tag"]');
        expect(tag.exists()).toBe(false);
    });
});
