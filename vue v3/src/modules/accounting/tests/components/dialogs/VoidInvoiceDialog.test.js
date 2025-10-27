import { describe, it, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import VoidInvoiceDialog from '@/modules/accounting/components/dialogs/VoidInvoiceDialog.vue';
import { componentExists } from '../../../../../../tests/utils/helpers.js';

describe('VoidInvoiceDialog.vue', () => {
    let wrapper;

    beforeEach(async () => {
        wrapper = mount(VoidInvoiceDialog, {
            props: {
                invoice: {
                    id: '760136367444152320',
                    status: 'unpaid',
                    invoice_status: 'unpaid',
                    date: '2025-05-06',
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
                reload: () => {
                    /* empty */
                }
            },
            global: {
                stubs: {
                    Dialog: {
                        template: `<div data-testid="void-invoice-dialog"><slot /> <slot name="footer"></slot></div>`
                    },
                    InputText: true,
                    Button: true
                }
            }
        });
    });

    it('should render the dialog when dialog prop is true', async () => {
        await componentExists(wrapper, 'void-invoice-dialog');
    });

    it('renders components', async () => {
        await componentExists(wrapper, 'dialog-message');
        await componentExists(wrapper, 'reason-label');
        await componentExists(wrapper, 'reason-textarea');
    });
});
