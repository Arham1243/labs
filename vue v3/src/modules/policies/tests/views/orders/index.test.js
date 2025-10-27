import { describe, expect, it, beforeEach } from 'vitest';
import { render, fireEvent, within } from '@testing-library/vue';
import { updateAbility } from '@/plugins/ability';
import { PolicyModulePermission } from '@/config';
import IndexView from '@/modules/policies/views/orders/index.vue';
import { searchClientsMock } from '@/modules/policies/tests/mocks/Client.service.mocks';

describe('Order List View', () => {
    beforeEach(() => {
        searchClientsMock();
        updateAbility([PolicyModulePermission.POLICIES.CREATE]);
    });

    it('page renders correctly', async () => {
        const { getByTestId } = render(IndexView);

        expect(getByTestId('page-title').textContent.trim()).toBe('Orders');
        const orderPolicyButton = getByTestId('order-new-policy-button');
        expect(orderPolicyButton).toBeTruthy();
        expect(orderPolicyButton.textContent.trim()).toBe('Order Policies');
    });

    it('should open order dialog and display elements correctly', async () => {
        const { getByTestId } = render(IndexView);

        const orderPolicyButton = getByTestId('order-new-policy-button');
        await fireEvent.click(orderPolicyButton);

        const dialog = getByTestId('order-dialog');
        expect(dialog).toBeTruthy();

        const { getByTestId: getDialogTestId } = within(dialog);

        const dialogTitle = getDialogTestId('order-dialog-title');
        expect(dialogTitle).toBeTruthy();
        expect(dialogTitle.textContent.trim()).toBe('Order Details');

        expect(getDialogTestId('order-dialog-close-button')).toBeTruthy();

        expect(getDialogTestId('client-name-label')).toBeTruthy();
        expect(getDialogTestId('client-name-label').textContent.trim()).toBe(
            'Client Name'
        );

        expect(getDialogTestId('business-unit-label')).toBeTruthy();
        expect(getDialogTestId('business-unit-label').textContent.trim()).toBe(
            'Business Unit'
        );

        expect(getDialogTestId('contact-source-label')).toBeTruthy();
        expect(getDialogTestId('contact-source-label').textContent.trim()).toBe(
            'Contact Source'
        );

        expect(getDialogTestId('link-to-message-label')).toBeTruthy();
        expect(
            getDialogTestId('link-to-message-label').textContent.trim()
        ).toBe('Link to Message');

        expect(getDialogTestId('client-name-input')).toBeTruthy();
        expect(getDialogTestId('business-unit-input')).toBeTruthy();
        expect(getDialogTestId('contact-source-input')).toBeTruthy();
        expect(getDialogTestId('link-to-message-input')).toBeTruthy();

        expect(getDialogTestId('cancel-button')).toBeTruthy();
        expect(getDialogTestId('continue-button')).toBeTruthy();
    });
});
