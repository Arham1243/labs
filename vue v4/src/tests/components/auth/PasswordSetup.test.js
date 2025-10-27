import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import PasswordSetup from '@/components/auth/PasswordSetup.vue';

describe('PasswordSetup Component', () => {
    it('renders correctly', () => {
        // Preparation
        const component = mount(PasswordSetup);

        // Assertion
        expect(component.find('[data-testid="page-title"]').text()).toBe(
            "Let's set a password for your account"
        );
        expect(component.find('[data-testid="password-label"]').text()).toBe(
            'Password'
        );
        expect(
            component.find('[data-testid="confirm-password-label"]').text()
        ).toBe('Confirm Password');
        expect(
            component.find('[data-testid="phone-number-label"]').text()
        ).toBe('Confirm your mobile number');
        expect(
            component.find('[data-testid="set-password-button"]').text()
        ).toBe('Set Password');

        expect(component.find('[data-testid="password-input"]').exists()).toBe(
            true
        );
        expect(
            component.find('[data-testid="confirm-password-input"]').exists()
        ).toBe(true);
        expect(
            component.find('[data-testid="phone-number-input"]').exists()
        ).toBe(true);
    });

    it('updates the password when user types', async () => {
        // Preparation
        const component = mount(PasswordSetup);
        const input = component.find('[data-testid="password-input"] input');

        // Act
        await input.setValue('Test@123');

        // Assertion
        expect(input.element.value).toBe('Test@123');
    });

    it('updates the confirm password when user types', async () => {
        // Preparation
        const component = mount(PasswordSetup);
        const input = component.find(
            '[data-testid="confirm-password-input"] input'
        );

        // Act
        await input.setValue('Test@123');

        // Assertion
        expect(input.element.value).toBe('Test@123');
    });

    it('updates the phone number when user types', async () => {
        // Preparation
        const component = mount(PasswordSetup);
        const input = component.find(
            '[data-testid="phone-number-input"] input'
        );

        // Act
        await input.setValue('12345678');

        // Assertion
        expect(input.element.value).toBe('12345678');
    });
});
