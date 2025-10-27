import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/vue';
import Table from '@/modules/administration/components/country/ProvinceTable.vue';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Province.service.mocks';
import {
    searchCountriesMock,
    getTaxTypesMock
} from '@/../tests/mocks/Common.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { ProvinceService } from '@/modules/administration/services';

vi.spyOn(ProvinceService, 'create').mockRejectedValue({
    response: {
        status: 422,
        data: {
            errors: {
                country_id: ['The country field is required.'],
                name: ['The name field is required.'],
                code: ['The code field is required.']
            }
        }
    }
});

describe('Province Dialog Form', () => {
    beforeEach(() => {
        searchItemsMock();
        searchCountriesMock();
        getTaxTypesMock();
        updateAbility(['create provinces', 'update provinces']);
    });

    it('opens the dialog when clicking the "Create New" button', async () => {
        const { getByTestId } = render(Table);

        const button = getByTestId('add-new-province-button');
        expect(button).not.toBeNull();

        await fireEvent.click(button);

        expect(getByTestId('dialog')).toBeTruthy();
    });

    it('closes the dialog when clicking the "Cancel" button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-province-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('cancel-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('closes the dialog when clicking the "X" (close) button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-province-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('dialog-close-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('renders the form with correct labels, input fields, and buttons', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-province-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const dialogWithin = within(dialog);
        const getDialogByTestId = dialogWithin.getByTestId;
        expect(getDialogByTestId('dialog-title').textContent.trim()).toBe(
            'New Province/State'
        );

        expect(
            getDialogByTestId('province-state-name-label').textContent.trim()
        ).toBe('Province/State Name');
        expect(getDialogByTestId('code-label').textContent.trim()).toBe('Code');
        expect(getDialogByTestId('country-label').textContent.trim()).toBe(
            'Country'
        );

        expect(getDialogByTestId('province-state-name-input')).toBeTruthy();
        expect(getDialogByTestId('code-input')).toBeTruthy();
        expect(getDialogByTestId('country-input')).toBeTruthy();

        expect(getDialogByTestId('cancel-button').textContent.trim()).toBe(
            'Cancel'
        );
        expect(getDialogByTestId('save-button').textContent.trim()).toBe(
            'Create'
        );
    });

    it('ensures input fields have the correct types', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-province-button'));

        expect(getByTestId('province-state-name-input')).to.have.property(
            'type',
            'text'
        );
        expect(getByTestId('code-input')).to.have.property('type', 'text');

        expect(getByTestId('country-input').querySelector('[role="combobox"]'))
            .to.exist;
    });

    it('displays validation errors when required fields are missing', async () => {
        const { getByTestId, findByText } = render(Table);

        await fireEvent.click(getByTestId('add-new-province-button'));

        const dialog = getByTestId('dialog');
        const saveButton = within(dialog).getByTestId('save-button');

        await fireEvent.click(saveButton);

        expect(await findByText('The country field is required.')).toBeTruthy();
        expect(await findByText('The name field is required.')).toBeTruthy();
        expect(await findByText('The code field is required.')).toBeTruthy();

        expect(ProvinceService.create).toHaveBeenCalled();
    });
});
