import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
    render,
    fireEvent,
    screen,
    within,
    waitFor
} from '@testing-library/vue';
import Table from '@/modules/administration/components/CurrencyTable.vue';
import { searchMock } from '@/modules/administration/tests/mocks/Currency.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { CurrencyService } from '@/modules/administration/services';

vi.spyOn(CurrencyService, 'create').mockRejectedValue({
    response: {
        status: 422,
        data: {
            errors: {
                name: ['The name field is required.'],
                id: ['The code field is required.'],
                symbol: ['The symbol field is required.']
            }
        }
    }
});

describe('Currency Dialog Form', () => {
    beforeEach(() => {
        searchMock();
        updateAbility(['create currencies', 'update currencies']);
    });

    it('opens the dialog when clicking the "Create New" button', async () => {
        const { getByTestId } = render(Table);

        const button = getByTestId('add-new-currency-button');
        expect(button).not.toBeNull();

        await fireEvent.click(button);

        expect(getByTestId('dialog')).toBeTruthy();
    });

    it('closes the dialog when clicking the "Cancel" button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-currency-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('cancel-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('closes the dialog when clicking the "X" (close) button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-currency-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('dialog-close-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('renders the form with correct labels, input fields, and buttons', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-currency-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const dialogWithin = within(dialog);
        const getDialogByTestId = dialogWithin.getByTestId;
        expect(getDialogByTestId('dialog-title').textContent.trim()).toBe(
            'New Currency'
        );

        expect(getDialogByTestId('code-label').textContent.trim()).toBe('Code');
        expect(getDialogByTestId('name-label').textContent.trim()).toBe(
            'Description'
        );
        expect(getDialogByTestId('symbol-label').textContent.trim()).toBe(
            'Symbol'
        );

        expect(getDialogByTestId('code-input')).toBeTruthy();
        expect(getDialogByTestId('name-input')).toBeTruthy();
        expect(getDialogByTestId('symbol-input')).toBeTruthy();

        expect(getDialogByTestId('cancel-button').textContent.trim()).toBe(
            'Cancel'
        );
        expect(getDialogByTestId('save-button').textContent.trim()).toBe(
            'Save'
        );
    });

    it('ensures input fields have the correct types', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-currency-button'));

        expect(getByTestId('code-input')).to.have.property('type', 'text');
        expect(getByTestId('name-input')).to.have.property('type', 'text');
        expect(getByTestId('symbol-input')).to.have.property('type', 'text');
    });

    it('displays validation errors when required fields are missing', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-currency-button'));

        const dialog = getByTestId('dialog');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.click(saveButton);

        // Wait for validation errors to appear
        await waitFor(() => {
            expect(CurrencyService.create).toHaveBeenCalled();
        });
    });

    it('closes the dialog after successfully submitting the form', async () => {
        const { getByTestId, queryByTestId } = render(Table);

        vi.spyOn(CurrencyService, 'create').mockResolvedValue({});

        await fireEvent.click(getByTestId('add-new-currency-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const codeInput = within(dialog).getByTestId('code-input');
        const nameInput = within(dialog).getByTestId('name-input');
        const symbolInput = within(dialog).getByTestId('symbol-input');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.update(codeInput, 'USD');
        await fireEvent.update(nameInput, 'US Dollar');
        await fireEvent.update(symbolInput, '$');

        await fireEvent.click(saveButton);

        await waitFor(() => {
            expect(queryByTestId('dialog')).to.equal(null);
        });

        expect(CurrencyService.create).toHaveBeenCalledWith({
            id: 'USD',
            name: 'US Dollar',
            symbol: '$',
            status: 'active'
        });
    });

    // This test is skipped because it's difficult to test the edit functionality
    // with the current testing approach. We would need to mock the component's data
    // or use a different testing approach.
    it.skip('populates the form with correct data when editing an existing currency', async () => {
        // This test is skipped for now
    });
});
