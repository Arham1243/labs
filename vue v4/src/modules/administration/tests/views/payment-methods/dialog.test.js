import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, within } from '@testing-library/vue';
import Table from '@/modules/administration/components/PaymentMethodsTable.vue';
import { searchPaymentMethodsMock } from '@/modules/administration/tests/mocks/PaymentMethods.service.mocks';
import { getAppsByCategoryMock } from '@/../tests/mocks/Common.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { PaymentMethodsService } from '@/modules/administration/services';

vi.spyOn(PaymentMethodsService, 'create').mockRejectedValue({
    response: {
        status: 422,
        data: {
            errors: {
                enrollment_types: ['The enrollment type field is required.'],
                payment_provider_id: [
                    'The payment provider field is required.'
                ],
                payment_type: ['The payment type field is required.']
            }
        }
    }
});

describe('Payment Methods Dialog Form', () => {
    beforeEach(() => {
        searchPaymentMethodsMock();
        getAppsByCategoryMock();
        updateAbility(['create payment methods', 'update payment methods']);
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
            'New Payment Method'
        );

        expect(
            getDialogByTestId('payment-provider-label').textContent.trim()
        ).toBe('Payment Provider');
        expect(getDialogByTestId('payment-type-label').textContent.trim()).toBe(
            'Payment Type'
        );
        expect(
            getDialogByTestId('payment-enrollment-label').textContent.trim()
        ).toBe('Enrollment Type');

        expect(getDialogByTestId('status-label').textContent.trim()).toBe(
            'Status'
        );

        expect(getDialogByTestId('payment-provider-input')).toBeTruthy();
        expect(getDialogByTestId('payment-type-input')).toBeTruthy();
        expect(getDialogByTestId('payment-enrollment-input')).toBeTruthy();
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

        expect(
            getByTestId('payment-provider-input').querySelector(
                '[role="combobox"]'
            )
        ).to.exist;
        expect(
            getByTestId('payment-type-input').querySelector('[role="combobox"]')
        ).to.exist;
        expect(
            getByTestId('payment-enrollment-input').querySelector(
                '[role="combobox"]'
            )
        ).to.exist;
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

        expect(
            await findByText('The enrollment type field is required.')
        ).toBeTruthy();
        expect(
            await findByText('The payment provider field is required.')
        ).toBeTruthy();
        expect(
            await findByText('The payment type field is required.')
        ).toBeTruthy();

        expect(PaymentMethodsService.create).toHaveBeenCalled();
    });
});
