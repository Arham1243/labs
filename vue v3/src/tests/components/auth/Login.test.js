import { mount, flushPromises } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import router from '@/routes';

import Login from '@/components/auth/Login.vue';

describe('Login Component', () => {
    it('renders correctly', () => {
        // Preparation
        const component = mount(Login);

        // Assertion
        expect(component.find('[data-testid="page-title"]').text()).toBe(
            'Login'
        );
        expect(component.find('[data-testid="email-label"]').text()).toBe(
            'Email'
        );
        expect(component.find('[data-testid="password-label"]').text()).toBe(
            'Password'
        );
        expect(component.find('[data-testid="rememberme-text"]').text()).toBe(
            'Remember me'
        );
        expect(component.find('[data-testid="login-button"]').text()).toBe(
            'Login'
        );

        expect(component.find('[data-testid="email-input"]').exists()).toBe(
            true
        );
        expect(component.find('[data-testid="password-input"]').exists()).toBe(
            true
        );
        expect(
            component.find('[data-testid="rememberme-checkbox"]').exists()
        ).toBe(true);
    });
    it('updates the email when user types', async () => {
        // Preparation
        const component = mount(Login);
        const emailInput = component.find('[data-testid="email-input"]');

        // Act
        await emailInput.setValue('test@test.com');

        // Assertion
        expect(emailInput.element.value).toBe('test@test.com');
    });

    it('updates the password when user types', async () => {
        // Preparation
        const component = mount(Login);
        const passwordInput = component.find('input[type=password]');

        // Act
        await passwordInput.setValue('123@Abc');

        // Assertion
        expect(passwordInput.element.value).toBe('123@Abc');
    });

    it('redirects to the forget password route on forget password link click', async () => {
        // Preparation
        const component = mount(Login);
        let pusMock = vi.spyOn(router, 'push');

        // Act
        await component
            .find('[data-testid="forgot-password-link"]')
            .trigger('click');

        // Assertion
        await flushPromises();
        expect(pusMock).toHaveBeenCalledWith({
            name: 'Password Reset Request'
        });
    });
});
