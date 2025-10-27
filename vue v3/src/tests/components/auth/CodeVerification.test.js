import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';

import CodeVerification from '@/components/auth/CodeVerification.vue';

describe('CodeVerification Component', () => {
    it('renders correctly', () => {
        // Preparation
        const component = mount(CodeVerification);

        // Assertion
        expect(component.findByTestId('page-title').text()).toBe(
            'OTP Verification'
        );
        expect(component.findByTestId('verify-button').text()).toBe('Verify');
        expect(component.findByTestId('resend-button').text()).toBe('Resend');
        expect(component.findByTestId('not-receive-text').text()).toBe(
            'Didn’t receive the OTP?'
        );

        expect(component.findByTestId('otp-input').exists()).toBe(true);
    });
});
