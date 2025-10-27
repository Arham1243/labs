import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/vue';
import Table from '@/modules/administration/components/country/CountryTable.vue';
import {
    searchCurrenciesMock,
    searchRegionsMock
} from '@/../tests/mocks/Common.service.mocks';
import { searchItemsMock } from '@/modules/administration/tests/mocks/Country.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { CountryService } from '@/modules/administration/services';

vi.spyOn(CountryService, 'searchItems').mockRejectedValue({
    response: {
        status: 422,
        data: {
            errors: {
                name: ['The country name field is required.'],
                phone_code: ['The calling code field is required.'],
                risk_level: ['The risk level field is required.'],
                id: ['The code field is required.']
            }
        }
    }
});

describe('Country Dialog Form', () => {
    beforeEach(() => {
        searchItemsMock();
        searchCurrenciesMock();
        searchRegionsMock();
        updateAbility(['create countries', 'update countries']);
    });

    it('opens the dialog when clicking the "Create New" button', async () => {
        const { getByTestId } = render(Table);

        const button = getByTestId('add-new-country-button');
        expect(button).not.toBeNull();

        await fireEvent.click(button);

        expect(getByTestId('dialog')).toBeTruthy();
    });

    it('closes the dialog when clicking the "Cancel" button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-country-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('cancel-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('closes the dialog when clicking the "X" (close) button', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-country-button'));

        const dialogWithin = within(getByTestId('dialog'));
        await fireEvent.click(dialogWithin.getByTestId('dialog-close-button'));

        expect(screen.queryByTestId('dialog')).to.be.null;
    });

    it('renders the form with correct labels, input fields, and buttons', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-country-button'));

        const dialog = getByTestId('dialog');
        expect(dialog).toBeTruthy();
        const dialogWithin = within(dialog);
        const getDialogByTestId = dialogWithin.getByTestId;
        expect(getDialogByTestId('dialog-title').textContent.trim()).toBe(
            'New Country'
        );

        expect(getDialogByTestId('name-label').textContent.trim()).toBe(
            'Country Name'
        );
        expect(getDialogByTestId('code-label').textContent.trim()).toBe('Code');
        expect(getDialogByTestId('currency-label').textContent.trim()).toBe(
            'Currency'
        );
        expect(getDialogByTestId('region-label').textContent.trim()).toBe(
            'Region'
        );
        expect(getDialogByTestId('calling-code-label').textContent.trim()).toBe(
            'Calling Code'
        );
        expect(getDialogByTestId('risk-level-label').textContent.trim()).toBe(
            'Risk Level'
        );
        expect(getDialogByTestId('status-label').textContent.trim()).toBe(
            'Status'
        );

        expect(getDialogByTestId('name-input')).toBeTruthy();
        expect(getDialogByTestId('code-input')).toBeTruthy();
        expect(getDialogByTestId('currency-input')).toBeTruthy();
        expect(getDialogByTestId('region-input')).toBeTruthy();
        expect(getDialogByTestId('calling-code-input')).toBeTruthy();
        expect(getDialogByTestId('risk-level-input')).toBeTruthy();
        expect(getDialogByTestId('status-input')).toBeTruthy();

        expect(getDialogByTestId('cancel-button').textContent.trim()).toBe(
            'Cancel'
        );
        expect(getDialogByTestId('save-button').textContent.trim()).toBe(
            'Create'
        );
    });

    it('ensures input fields have the correct types', async () => {
        const { getByTestId } = render(Table);

        await fireEvent.click(getByTestId('add-new-country-button'));

        expect(getByTestId('name-input')).to.have.property('type', 'text');
        expect(getByTestId('code-input')).to.have.property('type', 'text');
        expect(getByTestId('calling-code-input')).to.have.property(
            'type',
            'text'
        );

        expect(
            getByTestId('risk-level-input').querySelector('[role="combobox"]')
        ).to.exist;
        expect(getByTestId('currency-input').querySelector('[role="combobox"]'))
            .to.exist;
        expect(getByTestId('region-input').querySelector('[role="combobox"]'))
            .to.exist;
        const switchInput = within(getByTestId('status-input')).getByRole(
            'switch'
        );
        expect(switchInput).to.have.property('type', 'checkbox');
    });
});
