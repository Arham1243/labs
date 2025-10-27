import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ExportFileDialog from '@/modules/accounting/components/dialogs/ExportFileDialog.vue'; // Adjust path

describe('ExportFileDialog.vue', () => {
    it('should render the dialog when dialog prop is true', async () => {
        const wrapper = mount(ExportFileDialog, {
            props: {
                modelValue: true
            },
            global: {
                stubs: ['Dialog']
            }
        });

        expect(
            wrapper.find('[data-testid="export-file-dialog"]').exists()
        ).toBe(true);
    });
});
