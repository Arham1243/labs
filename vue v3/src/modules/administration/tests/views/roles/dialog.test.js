import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/vue';
import Table from '@/modules/administration/components/roles/tables/RoleTable.vue';
import { searchMock } from '@/modules/administration/tests/mocks/Role.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { RoleService } from '@/modules/administration/services';

vi.spyOn(RoleService, 'create').mockRejectedValue({
    response: {
        status: 422,
        data: {
            errors: {
                name: ['The name field is required.'],
                type: ['The type field is required.']
            }
        }
    }
});

describe('Role Dialog Form', () => {
    beforeEach(() => {
        searchMock();
        updateAbility(['create roles', 'update roles']);
    });

    it('opens the dialog when clicking the "Create New" button', async () => {
        const { getByTestId } = render(Table);

        const button = getByTestId('add-new-role-button');
        expect(button).not.toBeNull();

        await fireEvent.click(button);

        expect(getByTestId('dialog')).toBeTruthy();
    });

    it('closes the dialog when clicking the "Cancel" button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-role-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('cancel-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('closes the dialog when clicking the "X" (close) button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-role-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('dialog-close-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('renders the form with correct labels, input fields, and buttons', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-role-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const dialogWithin = within(dialog);
        const getDialogByTestId = dialogWithin.getByTestId;
        expect(getDialogByTestId('dialog-title').textContent.trim()).toBe(
            'New Role'
        );

        expect(getDialogByTestId('name-label').textContent.trim()).toBe(
            'Role Name'
        );
        expect(getDialogByTestId('type-label').textContent.trim()).toBe('Type');
        expect(getDialogByTestId('description-label').textContent.trim()).toBe(
            'Description'
        );

        expect(getDialogByTestId('name-input')).toBeTruthy();
        expect(getDialogByTestId('type-input')).toBeTruthy();
        expect(getDialogByTestId('description-input')).toBeTruthy();

        expect(getDialogByTestId('cancel-button').textContent.trim()).toBe(
            'Cancel'
        );
        expect(getDialogByTestId('save-button').textContent.trim()).toBe(
            'Save'
        );
    });

    it('ensures input fields have the correct types', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-role-button'));

        expect(getByTestId('name-input')).to.have.property('type', 'text');
        expect(getByTestId('description-input')).to.have.property(
            'type',
            'text'
        );
        expect(getByTestId('type-input').querySelector('[role="combobox"]')).to
            .exist;
    });

    it('displays validation errors when required fields are missing', async () => {
        const { getByTestId, findByText } = render(Table);

        await fireEvent.click(getByTestId('add-new-role-button'));

        const dialog = getByTestId('dialog');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.click(saveButton);

        expect(await findByText('The name field is required.')).toBeTruthy();
        expect(await findByText('The type field is required.')).toBeTruthy();

        expect(RoleService.create).toHaveBeenCalled();
    });
});
