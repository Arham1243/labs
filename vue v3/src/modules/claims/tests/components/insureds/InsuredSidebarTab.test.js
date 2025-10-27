import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import InsuredSidebarTab from '@/modules/claims/components/insureds/InsuredSidebarTab.vue';
import { useGeneralStoreMock } from '@/modules/claims/tests/mocks/General.service.mock';

vi.mock('@/modules/claims/stores/General', () => ({
    useGeneralStore: vi.fn(() => useGeneralStoreMock())
}));

describe('InsuredSidebarTab', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(InsuredSidebarTab, {
            props: {
                insured: {
                    client_id: 123321123321,
                    first_name: 'Allen',
                    last_name: 'Smith',
                    date_of_birth: '1992-02-06',
                    gender: 'male',
                    email: 'test@testttt.com',
                    passport_number: 'MU12346587',
                    phone_number: '6471234567',
                    address: '1 country road',
                    address2: '',
                    city: 'Toronto',
                    country_id: 'CA',
                    postal_code: 'M1M 1M1',
                    policies: [
                        {
                            policy_number: '1520000',
                            start_date: '2024-12-01',
                            end_date: '2024-12-31',
                            duration: 30,
                            status: 'active'
                        }
                    ]
                }
            }
        });

        // ! TEST if insured details div are rendered correctly
        expect(wrapper.findByTestId('label-insured-details').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('label-insured-client-id').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-insured-client-id').text()).toBe(
            '123321123321'
        );

        expect(wrapper.findByTestId('label-insured-firstname').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-insured-firstname').text()).toBe(
            'Allen'
        );

        expect(wrapper.findByTestId('label-insured-lastname').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-insured-lastname').text()).toBe(
            'Smith'
        );

        expect(
            wrapper.findByTestId('label-insured-date-of-birth').exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('text-insured-date-of-birth-and-age').text()
        ).toBe('Feb 06, 1992 (33 years old)');

        expect(wrapper.findByTestId('label-insured-gender').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-insured-gender').text()).toBe('male');

        expect(
            wrapper.findByTestId('label-insured-passport-number').exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('text-insured-passport-number').text()
        ).toBe('MU12346587');

        // * Test if message component exists
        // expect(wrapper.findComponent({ name: 'Message' }).exists()).toBe(true);

        // ! TEST if insured contact details div are rendered correctly
        expect(
            wrapper.findByTestId('label-insured-contact-details').exists()
        ).toBe(true);

        expect(
            wrapper.findByTestId('label-insured-primary-email').exists()
        ).toBe(true);
        expect(wrapper.findByTestId('text-insured-primary-email').text()).toBe(
            'test@testttt.com'
        );

        expect(
            wrapper.findByTestId('label-insured-secondary-email').exists()
        ).toBe(true);

        expect(wrapper.findByTestId('label-insured-phone').exists()).toBe(true);
        expect(wrapper.findByTestId('text-insured-phone').text()).toBe(
            '6471234567'
        );

        expect(wrapper.findByTestId('label-insured-alt-phone').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-insured-alt-phone').text()).toBe('-');

        // ! TEST if insured current address div are rendered correctly
        expect(
            wrapper.findByTestId('label-insured-current-address').exists()
        ).toBe(true);

        expect(wrapper.findByTestId('label-insured-address').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-insured-address').text()).toBe(
            '1 country road'
        );

        expect(wrapper.findByTestId('label-insured-address-2').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-insured-address-2').text()).toBe('-');

        expect(wrapper.findByTestId('label-insured-country').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('label-insured-province').exists()).toBe(
            true
        );

        expect(wrapper.findByTestId('label-insured-city').exists()).toBe(true);
        expect(wrapper.findByTestId('text-insured-city').text()).toBe(
            'Toronto'
        );

        expect(wrapper.findByTestId('label-insured-postal-code').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('text-insured-postal-code').text()).toBe(
            'M1M 1M1'
        );
    });
});
