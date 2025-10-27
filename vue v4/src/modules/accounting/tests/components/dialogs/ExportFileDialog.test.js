import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ExportFileDialog from '@/modules/accounting/components/dialogs/ExportFileDialog.vue';
import MultiSelect from 'primevue/multiselect';
import { componentExists } from '../../../../../../tests/utils/helpers.js';

describe('ExportFileDialog.vue', () => {
    let wrapper;

    beforeEach(async () => {
        wrapper = mount(ExportFileDialog, {
            props: {
                modelValue: true
            },
            components: {
                MultiSelect
            },
            global: {
                stubs: {
                    Dialog: {
                        template: `<div data-testid="export-file-dialog"><slot /> <slot name="footer"></slot></div>`
                    },
                    InputText: true,
                    Button: true,
                    DateSelection: true
                }
            }
        });
    });

    it('should render the dialog when dialog prop is true', async () => {
        expect(
            wrapper.find('[data-testid="export-file-dialog"]').exists()
        ).toBe(true);
    });
});
