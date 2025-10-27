import { describe, it, expect, beforeEach, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import InvoicesTable from '@/modules/accounting/components/tables/InvoicesTable.vue';
import { InvoiceService } from '@/modules/accounting/services';

describe('InvoicesTable.vue', () => {
    let wrapper;

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    beforeEach(async () => {
        vi.spyOn(InvoiceService, 'searchInvoices').mockResolvedValue({
            data: {
                data: [
                    {
                        id: '760136367444152320',
                        status: 'unpaid',
                        invoice_status: 'unpaid',
                        created_at: '2025-05-06',
                        invoice_number: 'pgX6tH1WVS',
                        currency: 'CAD',
                        amount: '8392.00',
                        amount_due: 3454.43,
                        due_date: '2025-02-03',
                        business_unit: {
                            id: '758631799797166080',
                            name: { en: 'Cambridge Campus', fr: null },
                            account_type: 'pay_later'
                        },
                        client: {
                            id: '758600859987255296',
                            name: { en: 'Cambridge University', fr: null }
                        }
                    },
                    {
                        id: '760136382667948032',
                        status: 'unpaid',
                        invoice_status: 'unpaid',
                        created_at: '2025-05-06',
                        invoice_number: 'YXGq3BjMj1',
                        currency: 'CAD',
                        amount: '4061.00',
                        amount_due: 3454.43,
                        due_date: null,
                        business_unit: {
                            id: '758631799797166080',
                            name: { en: 'Cambridge Campus', fr: null },
                            account_type: 'pay_later'
                        },
                        client: {
                            id: '758600859987255296',
                            name: { en: 'Cambridge University', fr: null }
                        }
                    },
                    {
                        id: '760136385830535170',
                        status: 'unpaid',
                        invoice_status: 'unpaid',
                        created_at: '2025-05-06',
                        invoice_number: '1oexB6uhos',
                        currency: 'CAD',
                        amount: '7595.00',
                        amount_due: 3454.43,
                        due_date: null,
                        business_unit: {
                            id: '758633752670588928',
                            name: {
                                en: 'molestias ea error',
                                fr: 'veritatis amet neque'
                            },
                            account_type: 'pay_later'
                        },
                        client: {
                            id: '758633752632840192',
                            name: {
                                en: 'qui occaecati placeat',
                                fr: 'labore doloribus id'
                            }
                        }
                    },
                    {
                        id: '760136388762234880',
                        status: 'unpaid',
                        invoice_status: 'unpaid',
                        created_at: '2025-05-06',
                        invoice_number: 'bO0jNYIz1g',
                        currency: 'CAD',
                        amount: '6489.00',
                        amount_due: 3454.43,
                        due_date: null,
                        business_unit: {
                            id: '758631799797166080',
                            name: { en: 'Cambridge Campus', fr: null },
                            account_type: 'pay_later'
                        },
                        client: {
                            id: '758600859987255296',
                            name: { en: 'Cambridge University', fr: null }
                        }
                    },
                    {
                        id: '760136391388971008',
                        status: 'unpaid',
                        invoice_status: 'unpaid',
                        created_at: '2025-05-06',
                        invoice_number: 'YoDi69lB23',
                        currency: 'CAD',
                        amount: '5202.00',
                        amount_due: 3454.43,
                        due_date: null,
                        business_unit: {
                            id: '758631799797166080',
                            name: { en: 'Cambridge Campus', fr: null },
                            account_type: 'pay_later'
                        },
                        client: {
                            id: '758600859987255296',
                            name: { en: 'Cambridge University', fr: null }
                        }
                    },
                    {
                        id: '760136393520623616',
                        status: 'unpaid',
                        invoice_status: 'unpaid',
                        created_at: '2025-05-06',
                        invoice_number: 'SCfWtZGI18',
                        currency: 'CAD',
                        amount: '9662.00',
                        amount_due: 3454.43,
                        due_date: null,
                        business_unit: {
                            id: '758631799797166080',
                            name: { en: 'Cambridge Campus', fr: null },
                            account_type: 'pay_later'
                        },
                        client: {
                            id: '758600859987255296',
                            name: { en: 'Cambridge University', fr: null }
                        }
                    },
                    {
                        id: '760715040885874688',
                        status: 'unpaid',
                        invoice_status: 'unpaid',
                        created_at: '2025-05-07',
                        invoice_number: 'Xa7WXHmOTo',
                        currency: 'CAD',
                        amount: '7544.00',
                        amount_due: 3454.43,
                        due_date: null,
                        business_unit: {
                            id: '758631799797166080',
                            name: { en: 'Cambridge Campus', fr: null },
                            account_type: 'pay_later'
                        },
                        client: {
                            id: '758600859987255296',
                            name: { en: 'Cambridge University', fr: null }
                        }
                    },
                    {
                        id: '760715913279426560',
                        status: 'unpaid',
                        invoice_status: 'unpaid',
                        created_at: '2025-05-07',
                        invoice_number: 'xUkIsp1K5F',
                        currency: 'CAD',
                        amount: '9065.00',
                        amount_due: 3454.43,
                        due_date: null,
                        business_unit: {
                            id: '758631799797166080',
                            name: { en: 'Cambridge Campus', fr: null },
                            account_type: 'pay_later'
                        },
                        client: {
                            id: '758600859987255296',
                            name: { en: 'Cambridge University', fr: null }
                        }
                    },
                    {
                        id: '760716537953087488',
                        status: 'unpaid',
                        invoice_status: 'unpaid',
                        created_at: '2025-05-07',
                        invoice_number: 'Peg2dLis0Z',
                        currency: 'CAD',
                        amount: '9915.00',
                        amount_due: 3454.43,
                        due_date: null,
                        business_unit: {
                            id: '758631799797166080',
                            name: { en: 'Cambridge Campus', fr: null },
                            account_type: 'pay_later'
                        },
                        client: {
                            id: '758600859987255296',
                            name: { en: 'Cambridge University', fr: null }
                        }
                    },
                    {
                        id: '760716708585340928',
                        status: 'unpaid',
                        invoice_status: 'unpaid',
                        created_at: '2025-05-07',
                        invoice_number: '01yFxYGeB7',
                        currency: 'CAD',
                        amount: '2720.00',
                        amount_due: 3454.43,
                        due_date: null,
                        business_unit: {
                            id: '758631799797166080',
                            name: { en: 'Cambridge Campus', fr: null },
                            account_type: 'pay_later'
                        },
                        client: {
                            id: '758600859987255296',
                            name: { en: 'Cambridge University', fr: null }
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
        wrapper = mount(InvoicesTable, {});
    });

    it('renders the table header', () => {
        const header = wrapper.find('[data-testid="table-header"]');
        expect(header.exists()).toBe(true);
    });

    it('renders the bulk actions button', () => {
        const bulkActionsButton = wrapper.find(
            '[data-testid="bulk-actions-button"]'
        );
        expect(bulkActionsButton.exists()).toBe(true);
        expect(bulkActionsButton.text()).toBe('Bulk Actions');
    });

    it('renders the filter button', () => {
        const filterButton = wrapper.find('[data-testid="filter-button"]');
        expect(filterButton.exists()).toBe(true);
        expect(filterButton.text()).toBe('Filter');
    });

    it('renders the search input', () => {
        const searchInput = wrapper.find('[data-testid="search-input"]');
        expect(searchInput.exists()).toBe(true);
    });

    it('renders the empty table message when no invoices are available', async () => {
        //await wrapper.setProps({ invoices: [] });
        const emptyMessage = wrapper.find('[data-testid="empty-data-table"]');
        expect(emptyMessage.exists()).toBe(true);
        expect(emptyMessage.text()).toBe('No results found');
    });

    it('renders the loading message when loading is true', async () => {
        wrapper.vm.loading = true;
        await wrapper.vm.$nextTick();
        const loadingMessage = wrapper.find(
            '[data-testid="loading-data-table"]'
        );
        expect(loadingMessage.exists()).toBe(true);
        expect(loadingMessage.text()).toBe('Loading');
    });

    it('renders the status column with correct value', async () => {
        await flushPromises();
        const statusTags = wrapper.findAll('[data-testid="status-tag"]');
        statusTags.forEach((statusTag) => {
            expect(['UNPAID']).toContain(statusTag.text());
        });
    });

    it('renders the invoice date column with correct value', async () => {
        await flushPromises();
        const invoiceDateValues = wrapper.findAll(
            '[data-testid="invoice-date-value"]'
        );
        const expectedDates = ['06-May-2025', '07-May-2025'];

        invoiceDateValues.forEach((dateElement) => {
            expect(expectedDates).toContain(dateElement.text());
        });
    });

    it('renders the invoice number column with correct value', async () => {
        await flushPromises();
        const invoiceNumberValues = wrapper.findAll(
            '[data-testid="invoice-number-value"]'
        );
        const expectedNumbers = [
            'pgX6tH1WVS',
            'YXGq3BjMj1',
            '1oexB6uhos',
            'bO0jNYIz1g',
            'YoDi69lB23',
            'SCfWtZGI18',
            'Xa7WXHmOTo',
            'xUkIsp1K5F',
            'Peg2dLis0Z',
            '01yFxYGeB7'
        ];

        invoiceNumberValues.forEach((numberElement) => {
            expect(expectedNumbers).toContain(numberElement.text());
        });
    });

    it('renders the client column with correct values for all rows', async () => {
        await flushPromises();
        const clientNames = wrapper.findAll('[data-testid="client-name"]');
        const expectedClients = [
            'Cambridge University',
            'Cambridge University',
            'qui occaecati placeat',
            'Cambridge University',
            'Cambridge University'
        ];

        clientNames.forEach((clientElement, index) => {
            const name = clientElement.text();
            expect(expectedClients).toContain(name);
        });
    });

    it('renders the account type column with correct values for all rows', async () => {
        await flushPromises();

        const accountTypeValues = wrapper.findAll(
            '[data-testid="account-type-value"]'
        );
        const expectedAccountTypes = ['Pay Later', 'COD'];

        accountTypeValues.forEach((accountTypeElement, index) => {
            expect(expectedAccountTypes).toContain(accountTypeElement.text());
        });
    });

    it('renders the business unit column with correct values for all rows', async () => {
        await flushPromises();

        const businessUnitNames = wrapper.findAll(
            '[data-testid="business-unit-name"]'
        );

        const expectedBusinessUnits = [
            'molestias ea error',
            'Cambridge Campus'
        ];

        businessUnitNames.forEach((businessUnitElement, index) => {
            expect(expectedBusinessUnits).toContain(businessUnitElement.text());
        });
    });

    it('renders the amount column with correct values for all rows', async () => {
        await flushPromises();

        const amountValues = wrapper.findAll('[data-testid="amount-value"]');

        const expectedAmounts = [
            '$8,392.00',
            '$4,061.00',
            '$7,595.00',
            '$6,489.00',
            '$5,202.00',
            '$9,662.00',
            '$7,544.00',
            '$9,065.00',
            '$9,915.00',
            '$2,720.00'
        ];

        // Assert that each rendered amount matches the expected value
        amountValues.forEach((amountElement, index) => {
            expect(expectedAmounts).toContain(amountElement.text());
        });
    });

    it('renders the amount due column with correct values for all rows', async () => {
        await flushPromises();

        const amountDueValues = wrapper.findAll(
            '[data-testid="amount-due-value"]'
        );
        const expectedAmountsDue = ['$3,454.43'];
        amountDueValues.forEach((amountDueElement, index) => {
            expect(expectedAmountsDue).toContain(amountDueElement.text());
        });
    });

    it('renders the due date column with correct values for all rows', async () => {
        await flushPromises();

        const dueDateValues = wrapper.findAll('[data-testid="due-date-value"]');
        const expectedDueDates = [null, '03-Feb-2025'];
        dueDateValues.forEach((dueDateElement, index) => {
            expect(expectedDueDates).toContain(dueDateElement.text());
        });
    });

    it('displays the correct bulk actions text', async () => {
        await wait(200);
        expect(wrapper.find('[data-testid="bulk-actions-button"]').text()).toBe(
            'Bulk Actions'
        );
        await flushPromises();

        wrapper.vm.selectAllOnCurrentPage();
        await wrapper.vm.$nextTick();
        expect(wrapper.find('[data-testid="bulk-actions-button"]').text()).toBe(
            'Bulk Actions (10/13 selected)'
        );
    });

    it('renders the actions column with the correct button', async () => {
        await wait(200);
        await flushPromises();
        const actionsButton = wrapper.find('[data-testid="actions-button-0"]');
        expect(actionsButton.exists()).toBe(true);
        expect(actionsButton.text()).toBe('Actions');
    });

    it('sets the record payment dialog to true', async () => {
        wrapper.vm.showRecordPaymentDialog = false;
        wrapper.vm.openRecordPaymentDialog();
        expect(wrapper.vm.showRecordPaymentDialog).toBe(true);
    });

    it('sets the filter dialog to true', async () => {
        wrapper.vm.showFilterDialog = false;
        wrapper.vm.openFilterDialog();
        expect(wrapper.vm.showFilterDialog).toBe(true);
    });
});
