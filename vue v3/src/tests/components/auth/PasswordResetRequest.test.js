import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi } from 'vitest';
import PasswordResetRequest from '@/components/auth/PasswordResetRequest.vue';
import { AuthService } from '@/services';

describe('PasswordResetRequest Component', () => {
    it('renders correctly', () => {
        const component = mount(PasswordResetRequest);

        expect(component.findByTestId('page-title').text()).toBe(
            'Forgot Password'
        );
        expect(component.findByTestId('page-subtitle').text()).toBe(
            "Enter your registered email address you'd like your password reset information sent to"
        );
        expect(component.findByTestId('continue-button').text()).toBe(
            'Continue'
        );
    });

    it('updates the email when user types', async () => {
        const component = mount(PasswordResetRequest);
        const emailInput = component.find('[data-testid="email-input"]');

        await emailInput.setValue('test@test.com');

        expect(emailInput.element.value).toBe('test@test.com');
    });

    it('displays error message when forgot password request fails', async () => {
        const mock = vi.spyOn(AuthService, 'forgotPassword').mockRejectedValue({
            response: {
                status: 422,
                data: {
                    message: 'The email field is required.',
                    errors: {
                        email: 'The email field is required.'
                    }
                }
            }
        });
        const component = mount(PasswordResetRequest);

        await component.findByTestId('email-input').setValue('test@test.com');
        await component.findByTestId('continue-button').trigger('click');
        await flushPromises();
        expect(mock).toHaveBeenCalledWith({ email: 'test@test.com' });
        expect(component.text()).toContain('The email field is required.');
    });
});
