import { invoiceStatuses } from '@/config';
export const accountingComponents = [
    { label: 'Clients', type: 'multi_select', field: 'clients' },
    { label: 'Business Units', type: 'multi_select', field: 'business_units' },
    { label: 'Payment Date', type: 'date', field: 'payment_date' },
    { label: 'Invoice Date', type: 'date', field: 'invoice_date' },
    { label: 'Due Date', type: 'date', field: 'due_date' },
    { label: 'Total Amount', type: 'number', field: 'total_amount' },
    { label: 'Paid Amount', type: 'number', field: 'paid_amount' },
    { label: 'Due Amount', type: 'number', field: 'due_amount' },
    {
        label: 'Status',
        type: 'multi_select',
        field: 'status',
        selection_options: Object.values(invoiceStatuses).map((status) => ({
            name: { en: status.display_name, fr: status.display_name },
            id: status.value
        }))
    },
    { label: 'Underwriters', type: 'multi_select', field: 'underwriters' },
    {
        label: 'Account Manager',
        type: 'multi_select',
        field: 'account_managers'
    },
    { label: 'Group Name', type: 'string', field: 'group_name' },
    { label: 'PO#', type: 'string', field: 'policy_number' }
];
