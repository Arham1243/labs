import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { componentExists } from '../../../../../../tests/utils/helpers.js';
import InvoiceDetails from '@/modules/accounting/components/invoices/InvoiceDetails.vue';
import { InvoiceService } from '@/modules/accounting/services';

describe('InvoiceDetails.vue', () => {
    let wrapper;

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    beforeEach(() => {
        vi.spyOn(InvoiceService, 'getInvoiceItems').mockResolvedValue({
            data: {
                data: [
                    {
                        id: 816899848708767744,
                        product_id: 816899742478970880,
                        amount: 5,
                        invoice_id: 816899851191795712,
                        tax: null,
                        tax_percent: null,
                        created_at: '2025-10-09T13:16:29.000000Z',
                        product: {
                            id: 816899742478970880,
                            first_name: 'Vvuscroosj',
                            last_name: 'Zo',
                            date_of_birth: '2000-11-11 00:00:00',
                            student_number: '11234',
                            start_date: '2025-10-10',
                            end_date: '2025-10-10',
                            term: 1,
                            net_price: 0,
                            sale_price: 5,
                            status: null,
                            policy_number: null,
                            er_date: null,
                            optout_date: null,
                            add_on: 0,
                            membership: 0,
                            tax: 0
                        }
                    }
                ],
                links: {
                    first: 'http://api.horus.test/api/v1/invoices/search?page=1',
                    last: 'http://api.horus.test/api/v1/invoices/search?page=2',
                    prev: null,
                    next: 'http://api.horus.test/api/v1/invoices/search?page=2'
                },
                meta: {
                    current_page: 1,
                    from: 1,
                    last_page: 2,
                    links: [
                        { url: null, label: '« Previous', active: false },
                        {
                            url: 'http://api.horus.test/api/v1/invoices/search?page=1',
                            label: '1',
                            active: true
                        },
                        {
                            url: 'http://api.horus.test/api/v1/invoices/search?page=2',
                            label: '2',
                            active: false
                        },
                        {
                            url: 'http://api.horus.test/api/v1/invoices/search?page=2',
                            label: 'Next »',
                            active: false
                        }
                    ],
                    path: 'http://api.horus.test/api/v1/invoices/search',
                    per_page: 10,
                    to: 10,
                    total: 13
                }
            }
        });

        wrapper = mount(InvoiceDetails, {
            props: {
                invoice: {
                    purchase_order_number: '876799',
                    client: { name: { en: 'Sheridan College at CCTT' } },
                    business_unit: {
                        name: {
                            en: 'Canadian College of technology and Trades'
                        }
                    },
                    billing_address: {
                        address: '7 Tait Avenue',
                        address2: 'Fort Erie, ON L2A0G1 Canada'
                    },
                    billing_payment_contacts: [
                        {
                            first_name: 'David',
                            last_name: 'Smith',
                            phone_number: '416-123-4567',
                            email: 'email@email.com'
                        }
                    ],
                    group_name: 'Some Group',
                    total_number_of_policies: 2,
                    total_number_of_enrollments: 2,
                    total_term: '10 days',
                    account_manager: { name: 'Jane Doe' },
                    charges: {
                        insurance_total: 326,
                        add_on_total: 126,
                        admin_fee: 126,
                        sales_tax: { amount: 0 },
                        grand_total: 126,
                        balance_due: 726
                    },
                    invoice: {
                        invoice_status: 'paid',
                        invoice_number: '9865467',
                        created_at: '2025-08-30T00:00:00Z',
                        due_date: '2025-09-15T00:00:00Z',
                        currency: 'CAD'
                    },
                    billing_details: {
                        payment_type: 'net',
                        payment_terms: 'Net 30'
                    },
                    primary_contact: null
                },
                policies: [
                    {
                        id: '1',
                        product: {
                            first_name: 'John',
                            last_name: 'Doe',
                            policy_number: '1223455',
                            student_number: '332',
                            status: 'Unpaid',
                            start_date: '2025-01-10T00:00:00Z',
                            end_date: '2025-01-20T00:00:00Z',
                            er_date: '2025-01-05T00:00:00Z',
                            opt_out_date: '2025-01-08T00:00:00Z',
                            term: '10',
                            price: 154.15,
                            add_on: 0,
                            membership: 0,
                            tax: 0,
                            sale_price: 154.15
                        }
                    }
                ],
                invoiceId: 816899742478970880
            }
        });
    });

    it('renders the component', async () => {
        await componentExists(wrapper, 'invoice-details-card');
    });

    it('renders the company logo', () => {
        const logo = wrapper.find('img.app-logo-normal');
        expect(logo.exists()).toBe(true);
        expect(logo.attributes('src')).toContain('new_logo.png');
    });

    it('renders the office address lines', () => {
        const addressLine1 = wrapper.find(
            '[data-testid="label-office-address-1"]'
        );
        const addressLine2 = wrapper.find(
            '[data-testid="label-office-address-2"]'
        );
        const addressLine3 = wrapper.find(
            '[data-testid="label-office-address-3"]'
        );

        expect(addressLine1.exists()).toBe(true);
        expect(addressLine1.text()).toBe('Guard.me International Insurance');

        expect(addressLine2.exists()).toBe(true);
        expect(addressLine2.text()).toBe('80 Allstate Parkway, 3rd Floor');

        expect(addressLine3.exists()).toBe(true);
        expect(addressLine3.text()).toBe('Markham, ON CANADA L3R 6H3');
    });

    it('renders the status badge with correct text', async () => {
        await flushPromises();
        const statusBadge = wrapper.find('[data-testid="status-badge"]');
        expect(statusBadge.exists()).toBe(true);
        expect(statusBadge.text()).toBe('PAID');
    });

    it('renders the invoice title', () => {
        const invoiceTitle = wrapper.find('[data-testid="invoice-title"]');
        expect(invoiceTitle.exists()).toBe(true);
        expect(invoiceTitle.text()).toBe('Invoice');
    });

    it('renders the invoice info table', () => {
        const infoTable = wrapper.find('[data-testid="invoice-info-table"]');
        expect(infoTable.exists()).toBe(true);
    });

    it('renders the PO number row with correct label and value', () => {
        const poNumberLabel = wrapper.find('[data-testid="po-number-label"]');
        const poNumberValue = wrapper.find('[data-testid="po-number-value"]');

        expect(poNumberLabel.exists()).toBe(true);
        expect(poNumberLabel.text()).toBe('PO #');

        expect(poNumberValue.exists()).toBe(true);
        //TODO: make PO number test dynamic
        expect(poNumberValue.text()).toBe('876799');
    });

    it('renders the invoice number row with correct label and value', () => {
        const invoiceNumberLabel = wrapper.find(
            '[data-testid="invoice-number-label"]'
        );
        const invoiceNumberValue = wrapper.find(
            '[data-testid="invoice-number-value"]'
        );

        expect(invoiceNumberLabel.exists()).toBe(true);
        expect(invoiceNumberLabel.text()).toBe('Invoice #');

        expect(invoiceNumberValue.exists()).toBe(true);
        //TODO: make invoice number test dynamic
        expect(invoiceNumberValue.text()).toBe('9865467');
    });

    it('renders the invoice date row with correct label and value', () => {
        const invoiceDateLabel = wrapper.find(
            '[data-testid="invoice-date-label"]'
        );
        const invoiceDateValue = wrapper.find(
            '[data-testid="invoice-date-value"]'
        );

        expect(invoiceDateLabel.exists()).toBe(true);
        expect(invoiceDateLabel.text()).toBe('Invoice Date');

        expect(invoiceDateValue.exists()).toBe(true);
        //TODO: make date test dynamic
        expect(invoiceDateValue.text()).toBe('30-Aug-2025');
    });

    it('renders the "Invoice To" section with correct label and value', () => {
        const invoiceToSection = wrapper.find(
            '[data-testid="invoice-to-section"]'
        );
        const invoiceToLabel = wrapper.find('[data-testid="invoice-to-label"]');
        const invoiceToValue = wrapper.find('[data-testid="invoice-to-value"]');

        expect(invoiceToSection.exists()).toBe(true);

        expect(invoiceToLabel.exists()).toBe(true);
        expect(invoiceToLabel.text()).toBe('Invoice To');

        expect(invoiceToValue.exists()).toBe(true);
        expect(invoiceToValue.html()).toContain('Sheridan College at CCTT');
        expect(invoiceToValue.html()).toContain(
            'Canadian College of technology and Trades'
        );
        expect(invoiceToValue.html()).toContain('7 Tait Avenue');
        expect(invoiceToValue.html()).toContain('Fort Erie, ON L2A0G1 Canada');
    });

    it('renders the "Attention To" section with correct label and value', () => {
        const attentionToSection = wrapper.find(
            '[data-testid="attention-to-section"]'
        );
        const attentionToLabel = wrapper.find(
            '[data-testid="attention-to-label"]'
        );
        const attentionToValue = wrapper.find(
            '[data-testid="attention-to-value"]'
        );

        expect(attentionToSection.exists()).toBe(true);

        expect(attentionToLabel.exists()).toBe(true);
        expect(attentionToLabel.text()).toBe('Attention To');

        expect(attentionToValue.exists()).toBe(true);
        expect(attentionToValue.html()).toContain('David Smith');
        expect(attentionToValue.html()).toContain('416-123-4567');
        expect(attentionToValue.html()).toContain('email@email.com');
    });

    it('renders the invoice summary table', () => {
        const table = wrapper.find('[data-testid="invoice-summary-table"]');
        expect(table.exists()).toBe(true);
    });

    it('renders the total policies row with correct label and value', () => {
        const row = wrapper.find('[data-testid="total-policies-row"]');
        const label = wrapper.find('[data-testid="total-policies-label"]');
        const value = wrapper.find('[data-testid="total-policies-value"]');

        expect(row.exists()).toBe(true);

        expect(label.exists()).toBe(true);
        expect(label.text()).toBe('Total # Of Policies');

        expect(value.exists()).toBe(true);
    });

    it('renders the invoice items table', () => {
        const table = wrapper.find('[data-testid="invoice-items-table"]');
        expect(table.exists()).toBe(true);
    });

    it('renders the description column with correct values', async () => {
        await flushPromises();
        const descriptionName = wrapper.find(
            '[data-testid="description-name"]'
        );
        const descriptionDetails = wrapper.find(
            '[data-testid="description-details"]'
        );

        expect(descriptionName.exists()).toBe(true);
        expect(descriptionName.text()).toBe('Zo, Vvuscroosj');

        expect(descriptionDetails.exists()).toBe(true);
        expect(descriptionDetails.text()).toBe('Student # 11234');
    });

    it('renders the status column with correct value', async () => {
        await flushPromises();
        const statusValue = wrapper.find('[data-testid="status-value"]');
        expect(statusValue.exists()).toBe(true);
        expect(statusValue.text()).toBe('-');
    });

    it('renders the start date column with correct value', async () => {
        await flushPromises();
        const startDateValue = wrapper.find('[data-testid="start-date-value"]');
        expect(startDateValue.exists()).toBe(true);
        expect(startDateValue.text()).toBe('10-Oct-2025');
    });

    it('renders the end date column with correct value', async () => {
        await flushPromises();
        const endDateValue = wrapper.find('[data-testid="end-date-value"]');
        expect(endDateValue.exists()).toBe(true);
        expect(endDateValue.text()).toBe('10-Oct-2025');
    });

    it('renders the total column with correct value', async () => {
        await flushPromises();
        const totalValue = wrapper.find('[data-testid="total-value"]');
        expect(totalValue.exists()).toBe(true);
        expect(totalValue.text()).toBe('$5.00');
    });

    it('renders the cheque payable section with correct details', () => {
        const label = wrapper.find('[data-testid="cheque-payable-label"]');
        const address = wrapper.find('[data-testid="cheque-payable-address"]');

        expect(label.exists()).toBe(true);
        expect(label.text()).toBe('Please make cheque payable to:');

        expect(address.exists()).toBe(true);
        expect(address.html()).toContain(
            'Travel Healthcare Insurance Solutions Inc.'
        );
        expect(address.html()).toContain(
            'o/a guard.me International Insurance'
        );
        expect(address.html()).toContain('80 Allstate Parkway, 3rd Floor');
        expect(address.html()).toContain('Markham, ON CANADA L3R 6H3');
    });

    it('renders the payment accept section with correct details', () => {
        const title = wrapper.find('[data-testid="payment-accept-title"]');
        const line1 = wrapper.find('[data-testid="payment-accept-line1"]');
        const line2 = wrapper.find('[data-testid="payment-accept-line2"]');
        const line3 = wrapper.find('[data-testid="payment-accept-line3"]');

        expect(title.exists()).toBe(true);
        expect(title.text()).toBe('We also accept:');

        expect(line1.exists()).toBe(true);
        expect(line1.text()).toContain(
            'Online Banking/ Wire transfer (Use Acct no: 2931)'
        );

        expect(line2.exists()).toBe(true);
        expect(line2.text()).toContain('PAY by Credit Card');

        expect(line3.exists()).toBe(true);
        expect(line3.text()).toContain('PayPal');
    });

    it('renders the summary table with correct values', () => {
        const insuranceCost = wrapper.find(
            '[data-testid="insurance-total-value"]'
        );
        const adminFee = wrapper.find('[data-testid="admin-fee-value"]');
        const grandTotal = wrapper.find('[data-testid="grand-total-value"]');
        const balanceDue = wrapper.find('[data-testid="balance-due-value"]');

        expect(insuranceCost.exists()).toBe(true);
        expect(insuranceCost.text()).toBe('$326.00 CAD');

        expect(adminFee.exists()).toBe(true);
        expect(adminFee.text()).toBe('$126.00 CAD');

        expect(grandTotal.exists()).toBe(true);
        expect(grandTotal.text()).toBe('$126.00 CAD');

        expect(balanceDue.exists()).toBe(true);
        expect(balanceDue.text()).toBe('$726.00 CAD');
    });

    it('renders the footer section with correct details', () => {
        const footerSection = wrapper.find('[data-testid="footer-section"]');
        const footerLine1 = wrapper.find('[data-testid="footer-line1"]');
        const footerLine2 = wrapper.find('[data-testid="footer-line2"]');
        const footerLine3 = wrapper.find('[data-testid="footer-line3"]');

        expect(footerSection.exists()).toBe(true);

        expect(footerLine1.exists()).toBe(true);
        expect(footerLine1.text()).toContain(
            'Tel: (905) 752-6200 • Toll Free: 1-877-873-8447 • Fax: (905) 752-6225 • Toll Free Fax: 1-866-329-8447'
        );
        expect(footerLine1.text()).toContain('• accounting@guard.me');
        expect(footerLine1.text()).toContain('• https://www.guard.me');

        expect(footerLine2.exists()).toBe(true);
        expect(footerLine2.text()).toBe(
            'ISO9001: 2008 Registered Underwritten by: Old Republic Insurance Company of Canada'
        );

        expect(footerLine3.exists()).toBe(true);
        expect(footerLine3.text()).toBe('HST NO:800902928 RT0001');
    });
});
