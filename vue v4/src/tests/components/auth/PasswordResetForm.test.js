import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import PasswordResetForm from '@/components/auth/PasswordResetForm.vue';

describe('PasswordResetForm Component', () => {
    it('renders correctly', () => {
        const component = mount(PasswordResetForm);

        expect(component.find('[data-testid="page-title"]').text()).toBe(
            "Let's reset your account password"
        );
        expect(component.find('[data-testid="password-label"]').text()).toBe(
            'New Password'
        );
        expect(
            component.find('[data-testid="confirm-password-label"]').text()
        ).toBe('Confirm Password');
        expect(
            component.find('[data-testid="reset-password-button"]').text()
        ).toBe('Reset Password');

        expect(component.find('[data-testid="password-input"]').exists()).toBe(
            true
        );
        expect(
            component.find('[data-testid="confirm-password-input"]').exists()
        ).toBe(true);
    });

    it('updates the password when user types', async () => {
        // Preparation
        const component = mount(PasswordResetForm);
        const input = component.find('[data-testid="password-input"] input');

        // Act
        await input.setValue('Test@123');

        // Assertion
        expect(input.element.value).toBe('Test@123');
    });

    it('updates the confirm password when user types', async () => {
        // Preparation
        const component = mount(PasswordResetForm);
        const input = component.find(
            '[data-testid="confirm-password-input"] input'
        );

        // Act
        await input.setValue('Test@123');

        // Assertion
        expect(input.element.value).toBe('Test@123');
    });
});
