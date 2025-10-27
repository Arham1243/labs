import { claimStatuses, submissionSources } from '@/config/index.js';

export const claimComponents = [
    { label: 'Created On', type: 'date', field: 'created_at' },
    { label: 'Reserved Amt', type: 'number', field: 'reserved_amount' },
    { label: 'Last Updated', type: 'date', field: 'updated_at' },
    {
        label: 'Status',
        type: 'multi_select',
        field: 'status',
        selection_options: Object.values(claimStatuses).map((status) => ({
            name: { en: status.display_name, fr: status.display_name },
            id: status.value
        }))
    }
];

export const assignedSubmissionComponents = [
    { label: 'Received Date', type: 'date', field: 'created_at' },
    { label: 'Last Updated', type: 'date', field: 'updated_at' },
    {
        label: 'Status',
        type: 'multi_select',
        field: 'status',
        selection_options: Object.values(claimStatuses).map((status) => ({
            name: { en: status.display_name, fr: status.display_name },
            id: status.value
        }))
    }
];

export const submissionComponents = [
    { label: 'Received Date', type: 'date', field: 'created_at' },
    { label: 'Last Updated', type: 'date', field: 'updated_at' },
    {
        label: 'Source',
        type: 'multi_select',
        field: 'source',
        selection_options: Object.values(submissionSources).map((source) => ({
            name: { en: source.display_name, fr: source.display_name },
            id: source.value
        }))
    },
    {
        label: 'Status',
        type: 'multi_select',
        field: 'status',
        selection_options: Object.values(claimStatuses).map((status) => ({
            name: { en: status.display_name, fr: status.display_name },
            id: status.value
        }))
    }
];

export const expenseComponents = [
    { label: 'Received Date', type: 'date', field: 'created_at' },
    { label: 'Service Date', type: 'date', field: 'service_date' },
    { label: 'Expense Amt', type: 'number', field: 'amount_claimed' },
    { label: 'Approved Amt', type: 'number', field: 'amount_approved' },
    { label: 'Last Updated', type: 'date', field: 'updated_at' },
    {
        label: 'Status',
        type: 'multi_select',
        field: 'status',
        selection_options: Object.values(claimStatuses).map((status) => ({
            name: { en: status.display_name, fr: status.display_name },
            id: status.value
        }))
    }
];
