import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/vue';
import Table from '@/modules/administration/components/MenuTable.vue';
import { searchMenuMock } from '@/modules/administration/tests/mocks/Menu.service.mocks.js';
import { AllMenusMock } from '@/modules/administration/tests/mocks/AllMenus.service.mocks.js';
import { searchPermissionMock } from '@/modules/administration/tests/mocks/Permission.service.mocks.js';
import { updateAbility } from '@/plugins/ability';
import { MenuService } from '@/modules/administration/services';

vi.spyOn(MenuService, 'create').mockRejectedValue({
    response: {
        status: 422,
        data: {
            errors: {
                name: ['The name field is required.'],
                url: ['The url field is required.'],
                icon: ['The icon field is required.'],
                permission_ids: ['The permissions field is required.']
            }
        }
    }
});

describe('Menu Dialog Form', () => {
    beforeEach(() => {
        searchMenuMock();
        AllMenusMock();
        searchPermissionMock();
        updateAbility(['create menu items', 'update menu items']);
    });

    it('opens the dialog when clicking the "Create New" button', async () => {
        const { getByTestId } = render(Table);

        const button = getByTestId('add-new-menu-button');
        expect(button).not.toBeNull();

        await fireEvent.click(button);

        expect(getByTestId('dialog')).toBeTruthy();
    });

    it('closes the dialog when clicking the "Cancel" button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-menu-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('cancel-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('closes the dialog when clicking the "X" (close) button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-menu-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('dialog-close-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('renders the form with correct labels, input fields, and buttons', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-menu-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const dialogWithin = within(dialog);
        const getDialogByTestId = dialogWithin.getByTestId;
        expect(getDialogByTestId('dialog-title').textContent.trim()).toBe(
            'New Menu Item'
        );

        expect(getDialogByTestId('name-label').textContent.trim()).toBe('Name');
        expect(getDialogByTestId('url-label').textContent.trim()).toBe('URL');
        expect(getDialogByTestId('icon-label').textContent.trim()).toBe('Icon');
        expect(getDialogByTestId('permission-label').textContent.trim()).toBe(
            'Permission'
        );
        expect(getDialogByTestId('status-label').textContent.trim()).toBe(
            'Status'
        );

        expect(getDialogByTestId('name-input')).toBeTruthy();
        expect(getDialogByTestId('icon-input')).toBeTruthy();
        expect(getDialogByTestId('icon-input')).toBeTruthy();
        expect(getDialogByTestId('permission-input')).toBeTruthy();
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

        await fireEvent.click(getByTestId('add-new-menu-button'));

        expect(getByTestId('name-input')).to.have.property('type', 'text');
        expect(getByTestId('url-input')).to.have.property('type', 'text');
        expect(getByTestId('icon-input').querySelector('[role="combobox"]')).to
            .exist;
        expect(
            getByTestId('permission-input').querySelector('[role="combobox"]')
        ).to.exist;

        expect(
            within(getByTestId('status-input')).getByRole('switch')
        ).to.have.property('type', 'checkbox');
    });

    it('displays validation errors when required fields are missing', async () => {
        const { getByTestId, findByText } = render(Table);

        await fireEvent.click(getByTestId('add-new-menu-button'));

        const dialog = getByTestId('dialog');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.click(saveButton);

        expect(await findByText('The name field is required.')).toBeTruthy();
        expect(await findByText('The url field is required.')).toBeTruthy();
        expect(await findByText('The icon field is required.')).toBeTruthy();
        expect(
            await findByText('The permissions field is required.')
        ).toBeTruthy();

        expect(MenuService.create).toHaveBeenCalled();
    });
});
