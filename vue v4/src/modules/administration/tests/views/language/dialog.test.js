import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
    render,
    fireEvent,
    screen,
    within,
    waitFor
} from '@testing-library/vue';
import Table from '@/modules/administration/components/LanguageTable.vue';
import { searchMock } from '@/modules/administration/tests/mocks/PreferredLanguage.service.mocks.js';
import { updateAbility } from '@/plugins/ability';
import { PreferredLanguageService } from '@/modules/administration/services';

vi.spyOn(PreferredLanguageService, 'create').mockRejectedValue({
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

describe('Language Dialog Form', () => {
    beforeEach(() => {
        searchMock();
        updateAbility(['create languages', 'update languages']);
    });

    it('opens the dialog when clicking the "Create New" button', async () => {
        const { getByTestId } = render(Table);

        const button = getByTestId('add-new-language-button');
        expect(button).not.toBeNull();

        await fireEvent.click(button);

        expect(getByTestId('dialog')).toBeTruthy();
    });

    it('closes the dialog when clicking the "Cancel" button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-language-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('cancel-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('closes the dialog when clicking the "X" (close) button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-language-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('dialog-close-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('renders the form with correct labels, input fields, and buttons', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-language-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const dialogWithin = within(dialog);
        const getDialogByTestId = dialogWithin.getByTestId;
        expect(getDialogByTestId('dialog-title').textContent.trim()).toBe(
            'New Language'
        );

        expect(getDialogByTestId('name-label').textContent.trim()).toBe(
            'Language'
        );
        expect(getDialogByTestId('code-label').textContent.trim()).toBe('Code');
        expect(getDialogByTestId('status-label').textContent.trim()).toBe(
            'Status'
        );

        expect(getDialogByTestId('name-input')).toBeTruthy();
        expect(getDialogByTestId('code-input')).toBeTruthy();
        expect(getDialogByTestId('status-input')).toBeTruthy();
        expect(getDialogByTestId('default-input')).toBeTruthy();

        expect(getDialogByTestId('cancel-button').textContent.trim()).toBe(
            'Cancel'
        );
        expect(getDialogByTestId('save-button').textContent.trim()).toBe(
            'Save'
        );
    });

    it('ensures input fields have the correct types', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-language-button'));

        expect(getByTestId('name-input')).to.have.property('type', 'text');
        expect(getByTestId('code-input')).to.have.property('type', 'text');

        expect(
            within(getByTestId('status-input')).getByRole('switch')
        ).to.have.property('type', 'checkbox');
        expect(
            within(getByTestId('default-input')).getByRole('switch')
        ).to.have.property('type', 'checkbox');
    });

    it('displays validation errors when required fields are missing', async () => {
        const { getByTestId, findByText } = render(Table);

        await fireEvent.click(getByTestId('add-new-language-button'));

        const dialog = getByTestId('dialog');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.click(saveButton);

        expect(await findByText('The name field is required.')).toBeTruthy();
        expect(await findByText('The code field is required.')).toBeTruthy();

        expect(PreferredLanguageService.create).toHaveBeenCalled();
    });

    it('closes the dialog after successfully submitting the form', async () => {
        const { getByTestId, queryByTestId } = render(Table);

        vi.spyOn(PreferredLanguageService, 'create').mockResolvedValue({});

        await fireEvent.click(getByTestId('add-new-language-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.update(within(dialog).getByTestId('code-input'), 'EN');
        await fireEvent.update(
            within(dialog).getByTestId('name-input'),
            'English'
        );

        await fireEvent.click(saveButton);
        await waitFor(() => {
            expect(queryByTestId('dialog')).to.equal(null);
        });

        expect(PreferredLanguageService.create).toHaveBeenCalledWith({
            code: 'EN',
            name: 'English',
            default: false,
            status: 'active'
        });
    });
});
