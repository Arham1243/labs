import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
    render,
    fireEvent,
    screen,
    within,
    waitFor
} from '@testing-library/vue';
import Table from '@/modules/administration/components/VendorTable.vue';
import { searchMock } from '@/modules/administration/tests/mocks/Vendor.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { VendorService } from '@/modules/administration/services';

vi.spyOn(VendorService, 'create').mockRejectedValue({
    response: {
        status: 422,
        data: {
            errors: {
                name: ['The name field is required.']
            }
        }
    }
});

describe('Vendor Dialog Form', () => {
    beforeEach(() => {
        searchMock();
        updateAbility(['create vendors', 'update vendors']);
    });

    it('opens the dialog when clicking the "Create New" button', async () => {
        const { getByTestId } = render(Table);

        const button = getByTestId('add-new-vendor-button');
        expect(button).not.toBeNull();

        await fireEvent.click(button);

        expect(getByTestId('dialog')).toBeTruthy();
    });

    it('closes the dialog when clicking the "Cancel" button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-vendor-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('cancel-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('closes the dialog when clicking the "X" (close) button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-vendor-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('dialog-close-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('renders the form with correct labels, input fields, and buttons', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-vendor-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const dialogWithin = within(dialog);
        const getDialogByTestId = dialogWithin.getByTestId;
        expect(getDialogByTestId('dialog-title').textContent.trim()).toBe(
            'New Vendor'
        );

        expect(getDialogByTestId('vendor-name-label').textContent.trim()).toBe(
            'Vendor Name'
        );
        expect(getDialogByTestId('status-label').textContent.trim()).toBe(
            'Status'
        );

        expect(getDialogByTestId('vendor-name-input')).toBeTruthy();
        expect(getDialogByTestId('status-input')).toBeTruthy();

        expect(getDialogByTestId('cancel-button').textContent.trim()).toBe(
            'Cancel'
        );
        expect(getDialogByTestId('save-button').textContent.trim()).toBe(
            'Save'
        );
    });

    it('ensures input fields have the correct types', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-vendor-button'));

        expect(getByTestId('vendor-name-input')).to.have.property(
            'type',
            'text'
        );

        const switchInput = within(getByTestId('status-input')).getByRole(
            'switch'
        );
        expect(switchInput).to.have.property('type', 'checkbox');
    });

    it('displays validation errors when required fields are missing', async () => {
        const { getByTestId, findByText } = render(Table);

        await fireEvent.click(getByTestId('add-new-vendor-button'));

        const dialog = getByTestId('dialog');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.click(saveButton);

        expect(await findByText('The name field is required.')).toBeTruthy();

        expect(VendorService.create).toHaveBeenCalled();
    });

    it('closes the dialog after successfully submitting the form', async () => {
        const { getByTestId, queryByTestId } = render(Table);

        vi.spyOn(VendorService, 'create').mockResolvedValue({});

        await fireEvent.click(getByTestId('add-new-vendor-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const nameInput = within(dialog).getByTestId('vendor-name-input');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.update(nameInput, 'Unit Test');

        await fireEvent.click(saveButton);

        await waitFor(() => {
            expect(queryByTestId('dialog')).to.equal(null);
        });

        expect(VendorService.create).toHaveBeenCalledWith({
            name: 'Unit Test',
            status: 'active'
        });
    });
});
