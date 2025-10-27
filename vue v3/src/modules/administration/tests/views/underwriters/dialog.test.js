import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
    render,
    fireEvent,
    screen,
    within,
    waitFor
} from '@testing-library/vue';
import Table from '@/modules/administration/components/UnderwritersTable.vue';
import { searchUnderwritersMock } from '@/modules/administration/tests/mocks/Underwriter.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { UnderwriterService } from '@/modules/administration/services';

vi.spyOn(UnderwriterService, 'createUnderwriter').mockRejectedValue({
    response: {
        status: 422,
        data: {
            errors: {
                name: ['The name field is required.'],
                code: ['The code field is required.']
            }
        }
    }
});

describe('Underwriter Dialog Form', () => {
    beforeEach(() => {
        searchUnderwritersMock();
        updateAbility(['create underwriters', 'update underwriters']);
    });

    it('opens the dialog when clicking the "Create New" button', async () => {
        const { getByTestId } = render(Table);

        const button = getByTestId('create-new-button');
        expect(button).not.toBeNull();

        await fireEvent.click(button);

        expect(getByTestId('dialog')).toBeTruthy();
    });

    it('closes the dialog when clicking the "Cancel" button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('create-new-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('cancel-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('closes the dialog when clicking the "X" (close) button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('create-new-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('dialog-close-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('renders the form with correct labels, input fields, and buttons', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('create-new-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const dialogWithin = within(dialog);
        const getDialogByTestId = dialogWithin.getByTestId;
        expect(getDialogByTestId('dialog-title').textContent.trim()).toBe(
            'New Underwriter'
        );

        expect(getDialogByTestId('name-label').textContent.trim()).toBe('Name');
        expect(getDialogByTestId('code-label').textContent.trim()).toBe('Code');
        expect(getDialogByTestId('status-label').textContent.trim()).toBe(
            'Status'
        );

        expect(getDialogByTestId('name-input')).toBeTruthy();
        expect(getDialogByTestId('code-input')).toBeTruthy();
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

        await fireEvent.click(getByTestId('create-new-button'));

        expect(getByTestId('name-input')).to.have.property('type', 'text');
        expect(getByTestId('code-input')).to.have.property('type', 'text');

        const switchInput = within(getByTestId('status-input')).getByRole(
            'switch'
        );
        expect(switchInput).to.have.property('type', 'checkbox');
    });

    it('displays validation errors when required fields are missing', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('create-new-button'));

        const dialog = getByTestId('dialog');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.click(saveButton);

        const nameField = within(dialog).getByTestId('name-field');
        const codeField = within(dialog).getByTestId('code-field');

        expect(
            await within(nameField).findByText('The name field is required.')
        ).toBeTruthy();
        expect(
            await within(codeField).findByText('The code field is required.')
        ).toBeTruthy();

        expect(UnderwriterService.createUnderwriter).toHaveBeenCalled();
    });

    it('closes the dialog after successfully submitting the form', async () => {
        const { getByTestId, queryByTestId } = render(Table);

        vi.spyOn(UnderwriterService, 'createUnderwriter').mockResolvedValue({});

        await fireEvent.click(getByTestId('create-new-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const nameInput = within(dialog).getByTestId('name-input');
        const codeInput = within(dialog).getByTestId('code-input');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.update(nameInput, 'Test Underwriter');
        await fireEvent.update(codeInput, 'FRH');

        await fireEvent.click(saveButton);

        await waitFor(() => {
            expect(queryByTestId('dialog')).to.equal(null);
        });

        expect(UnderwriterService.createUnderwriter).toHaveBeenCalledWith({
            name: 'Test Underwriter',
            code: 'FRH',
            status: 'active'
        });
    });
});
