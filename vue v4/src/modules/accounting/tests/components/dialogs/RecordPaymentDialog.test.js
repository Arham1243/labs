import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RecordPaymentDialog from '@/modules/accounting/components/dialogs/RecordPaymentDialog.vue';
import MultiSelect from 'primevue/multiselect';
import { componentExists } from '../../../../../../tests/utils/helpers.js';

describe('RecordPaymentDialog.vue', () => {
    let wrapper;

    beforeEach(async () => {
        const invoiceMock = {
            amount_due: 1234.56
        };
        wrapper = mount(RecordPaymentDialog, {
            props: {
                modelValue: true,
                invoice: invoiceMock
            },
            components: {
                MultiSelect
            },
            global: {
                stubs: {
                    Dialog: {
                        template: `<div data-testid="record-payment-dialog"><slot /> <slot name="footer"></slot></div>`
                    },
                    InputText: true,
                    Button: true,
                    DateSelection: true
                }
            }
        });
    });

    it('should render the dialog when dialog prop is true', async () => {
        await componentExists(wrapper, 'record-payment-dialog');
    });

    it('renders components', async () => {
        await componentExists(wrapper, 'payment-date-calendar');
        await componentExists(wrapper, 'payment-date-label');
        await componentExists(wrapper, 'payment-method-dropdown');
        await componentExists(wrapper, 'payment-amount-label');
        await componentExists(wrapper, 'payment-amount-input');
        await componentExists(wrapper, 'balance-due-text');
        await componentExists(wrapper, 'memo-label');
        await componentExists(wrapper, 'memo-textarea');
        await componentExists(wrapper, 'record-payment-cancel-button');
        await componentExists(wrapper, 'record-payment-save-button');
    });
});
