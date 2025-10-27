import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/vue';
import Table from '@/modules/administration/components/users/tables/UserTable.vue';
import { searchMock } from '@/modules/administration/tests/mocks/User.service.mocks';
import { getSettingsMock } from '@/modules/administration/tests/mocks/Setting.service.mocks';
import {
    searchCountriesMock,
    searchProvincesMock,
    searchLanguagesMock
} from '@/../tests/mocks/Common.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { UserService } from '@/modules/administration/services';

vi.spyOn(UserService, 'create').mockRejectedValue({
    response: {
        status: 422,
        data: {
            errors: {
                first_name: ['The first name field is required.'],
                last_name: ['The last name field is required.'],
                email: ['The email field is required.'],
                phone_number: ['The phone number field is required.']
            }
        }
    }
});

describe('User Dialog Form', () => {
    beforeEach(() => {
        searchMock();
        getSettingsMock();
        searchCountriesMock();
        searchProvincesMock();
        searchLanguagesMock();
        updateAbility(['create users', 'update users']);
    });

    it('opens the dialog when clicking the "Create New" button', async () => {
        const { getByTestId } = render(Table);

        const button = getByTestId('add-new-user-button');
        expect(button).not.toBeNull();

        await fireEvent.click(button);

        expect(getByTestId('dialog')).toBeTruthy();
    });

    it('closes the dialog when clicking the "Cancel" button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-user-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('cancel-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('closes the dialog when clicking the "X" (close) button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-user-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('dialog-close-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('renders the form with correct labels, input fields, and buttons', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-user-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const dialogWithin = within(dialog);
        const getDialogByTestId = dialogWithin.getByTestId;
        expect(getDialogByTestId('dialog-title').textContent.trim()).toBe(
            'Create User'
        );

        expect(getDialogByTestId('first-name-label').textContent.trim()).toBe(
            'First Name'
        );
        expect(getDialogByTestId('last-name-label').textContent.trim()).toBe(
            'Last Name'
        );
        expect(
            getDialogByTestId('email-address-label').textContent.trim()
        ).toBe('Email Address');
        expect(
            getDialogByTestId('mobile-number-label').textContent.trim()
        ).toBe('Mobile Number');
        expect(
            getDialogByTestId('preferred-language-label').textContent.trim()
        ).toBe('Preferred Language');
        expect(getDialogByTestId('address-label').textContent.trim()).toBe(
            'Address'
        );
        expect(getDialogByTestId('address2-label').textContent.trim()).toBe(
            'Address 2'
        );
        expect(getDialogByTestId('city-label').textContent.trim()).toBe('City');
        expect(getDialogByTestId('province-label').textContent.trim()).toBe(
            'Province'
        );
        expect(getDialogByTestId('postal-code-label').textContent.trim()).toBe(
            'Postal/Zip code'
        );
        expect(getDialogByTestId('country-label').textContent.trim()).toBe(
            'Country'
        );

        expect(getDialogByTestId('first-name-input')).toBeTruthy();
        expect(getDialogByTestId('last-name-input')).toBeTruthy();
        expect(getDialogByTestId('email-address-input')).toBeTruthy();
        expect(getDialogByTestId('mobile-number-input')).toBeTruthy();
        expect(getDialogByTestId('preferred-language-input')).toBeTruthy();
        expect(getDialogByTestId('address-input')).toBeTruthy();
        expect(getDialogByTestId('address2-input')).toBeTruthy();
        expect(getDialogByTestId('city-input')).toBeTruthy();
        expect(getDialogByTestId('province-input')).toBeTruthy();
        expect(getDialogByTestId('postal-code-input')).toBeTruthy();
        expect(getDialogByTestId('country-input')).toBeTruthy();

        expect(getDialogByTestId('cancel-button').textContent.trim()).toBe(
            'Cancel'
        );
        expect(getDialogByTestId('save-button').textContent.trim()).toBe(
            'Save'
        );
    });

    it('ensures input fields have the correct types', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-user-button'));

        expect(getByTestId('first-name-input')).to.have.property(
            'type',
            'text'
        );
        expect(getByTestId('last-name-input')).to.have.property('type', 'text');
        expect(getByTestId('email-address-input')).to.have.property(
            'type',
            'email'
        );
        expect(
            getByTestId('mobile-number-input').querySelector('input')
        ).to.have.property('type', 'text');

        expect(
            getByTestId('preferred-language-input').querySelector(
                '[role="combobox"]'
            )
        ).to.exist;
        expect(getByTestId('province-input').querySelector('[role="combobox"]'))
            .to.exist;
        expect(getByTestId('country-input').querySelector('[role="combobox"]'))
            .to.exist;
        expect(getByTestId('address-input')).to.have.property('type', 'text');
        expect(getByTestId('address2-input')).to.have.property('type', 'text');
        expect(getByTestId('city-input')).to.have.property('type', 'text');
        expect(getByTestId('postal-code-input')).to.have.property(
            'type',
            'text'
        );
    });

    it('displays validation errors when required fields are missing', async () => {
        const { getByTestId, findByText } = render(Table);

        await fireEvent.click(getByTestId('add-new-user-button'));

        const dialog = getByTestId('dialog');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.click(saveButton);

        expect(
            await findByText('The first name field is required.')
        ).toBeTruthy();
        expect(
            await findByText('The last name field is required.')
        ).toBeTruthy();
        expect(await findByText('The email field is required.')).toBeTruthy();
        expect(
            await findByText('The phone number field is required.')
        ).toBeTruthy();

        expect(UserService.create).toHaveBeenCalled();
    });
});
