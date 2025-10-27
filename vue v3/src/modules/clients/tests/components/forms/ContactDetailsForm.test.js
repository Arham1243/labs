import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ContactDetailsForm from '@/modules/clients/components/forms/ContactDetailsForm.vue';

describe('ContactDetailsForm', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(ContactDetailsForm, {
            props: {
                modelValue: {
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone_number: ''
                }
            }
        });

        expect(wrapper.findByTestId('first-name-label').text()).toBe(
            'First Name'
        );
        expect(wrapper.findByTestId('first-name-input').exists()).toBe(true);
        expect(wrapper.findByTestId('last-name-label').text()).toBe(
            'Last Name'
        );
        expect(wrapper.findByTestId('last-name-input').exists()).toBe(true);
        expect(wrapper.findByTestId('email-label').text()).toBe(
            'Email Address'
        );
        expect(wrapper.findByTestId('email-input').exists()).toBe(true);
        expect(wrapper.findByTestId('phone-label').text()).toBe('Phone #');
        expect(wrapper.findByTestId('phone-input').exists()).toBe(true);
    });
});
