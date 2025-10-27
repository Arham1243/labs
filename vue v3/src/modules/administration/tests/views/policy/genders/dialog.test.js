import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
    render,
    fireEvent,
    screen,
    within,
    waitFor
} from '@testing-library/vue';
import Table from '@/modules/administration/components/policy/tables/GenderTable.vue';
import { searchGenderMock } from '@/modules/administration/tests/mocks/Gender.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { GenderService } from '@/modules/administration/services';

vi.spyOn(GenderService, 'create').mockRejectedValue({
    response: {
        status: 422,
        data: {
            errors: {
                name: ['The name field is required.']
            }
        }
    }
});

describe('Gender Dialog Form', () => {
    beforeEach(() => {
        searchGenderMock();
        updateAbility(['create genders', 'update genders']);
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
            'New Gender'
        );

        expect(getDialogByTestId('gender-label').textContent.trim()).toBe(
            'Gender Name'
        );
        expect(getDialogByTestId('status-label').textContent.trim()).toBe(
            'Status'
        );

        expect(getDialogByTestId('gender-input')).toBeTruthy();
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
        expect(getByTestId('gender-input')).to.have.property('type', 'text');
        const switchInput = within(getByTestId('status-input')).getByRole(
            'switch'
        );
        expect(switchInput).to.have.property('type', 'checkbox');
    });

    it('displays validation errors when required fields are missing', async () => {
        const { getByTestId, findByText } = render(Table);

        await fireEvent.click(getByTestId('create-new-button'));

        const dialog = getByTestId('dialog');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.click(saveButton);

        expect(await findByText('The name field is required.')).toBeTruthy();

        expect(GenderService.create).toHaveBeenCalled();
    });

    it('closes the dialog after successfully submitting the form', async () => {
        const { getByTestId, queryByTestId } = render(Table);

        vi.spyOn(GenderService, 'create').mockResolvedValue({});

        await fireEvent.click(getByTestId('create-new-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const nameInput = within(dialog).getByTestId('gender-input');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.update(nameInput, 'Unit Test');

        await fireEvent.click(saveButton);

        await waitFor(() => {
            expect(queryByTestId('dialog')).to.equal(null);
        });

        expect(GenderService.create).toHaveBeenCalledWith({
            name: 'Unit Test',
            status: 'active'
        });
    });
});
