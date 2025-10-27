import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import AppCenter from '@/modules/administration/components/app-center/AppCenter.vue';
import { updateAbility } from '@/plugins/ability';

describe('AppCenter Component', () => {
    it('renders correctly', async () => {
        updateAbility(['create app centers', 'update app centers']);

        const wrapper = mount(AppCenter, {
            props: {
                items: [
                    {
                        id: 'adobe_crm',
                        name: 'Adobe CRM',
                        description:
                            'Adobe CRM, part of Adobe Experience Cloud, offers AI-powered customer relationship management solutions, enabling businesses to personalize customer interactions and optimize marketing strategies.',
                        features: [
                            'AI-driven customer insights',
                            'Automated marketing and sales workflows',
                            'Multi-channel engagement and analytics'
                        ],
                        image: 'https://horus-appcenter-develop.s3.ca-central-1.amazonaws.com/apps/adobe.png?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDGNhLWNlbnRyYWwtMSJIMEYCIQDEUGuzP9Ym4SvGfk3JVfySUl5jTXM27XFfcsEhP6i%2FjQIhAJErsUO5qirdAzuoOcj3Ovk9n%2BdYImmV8LjU%2FatxZWivKqEDCMX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQAhoMNjIwNzUyMDgxMjg0Igzatw2ch%2FsTJMiaER4q9QJz1ny29u0u0qPhdULVB3z%2FC7A%2FQzbXD1Lt2Ka0FRRi%2B1PAtXXqWRQ4ZsqMqH8YynBnMjsDWfzvsdnQ7ePkIMQgkCmTtxIhugGM776f0iCDPok3JSJKkKlrPR44x7EyBx%2Ft3FPtIk9TCzIZhdZnBhp0c2F4Q3d%2F5jtNOW0iJzqCi5zmeapbGfFQbXly5rzP6nym7lCBPSdOqmIDe6KJDhJOUYHdKAZJ7wV0QBSk8sj38G0ZAmWqPVTLXLFMekOzM36PKO1jwfPIKnMWmVgDmQbZPHojwhWzPsDwKwIZcS6ZfEiPpHqS8sWRw2lGPTfqdgBhrYvmiYw5jPFLg0iZMDCGwVtGRdG9776lqwvaGFHrOy2JpsCjzQW%2F4Y%2BKRjRWBVSY1NkiIJ4OgmMQatw3x5s%2B%2FaPiOcihQl7KToPSAfeAp1wNlFL25%2BD%2FtcX0701hC6vJTl1p9tHI7cQV7OK%2FYVjE9S3te44ui3s6fUkkYxP17p7QLFXLMNayqb0GOpwBLhPxlZ%2F%2F8rcBfLQXQ%2BcS5opLepLoL6NYqfBQoUxvJ4v96Zi4yeU7u7h%2FhmUknXwZjIGpKPuAVY5D3LnVYnAswQv8k9ZAgIIdE7wTBwYbmPcDhTEDU2Ti0d8MTWs%2FquFfpBMw%2BPO2jJXaUotBbs0p1nMH7u8oXQihnGpPUXOB4vzqxbKml7yzSijysQ%2BjLQbk5TVavuRHNoYNjZc4&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAZBB5VCGCIUKKVA4X%2F20250210%2Fca-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250210T195844Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=dda70d392c872570ccfe74217179f31fcfb5327f801c1057d4a886e88fb0ffd2',
                        category: 'crm',
                        category_label: 'CRM',
                        company_app: {
                            config: [
                                {
                                    name: 'mode',
                                    label: 'Mode',
                                    type: 'select',
                                    value: 'live',
                                    options: {
                                        sandbox: 'Sandbox',
                                        live: 'Live'
                                    },
                                    placeholder:
                                        'Select the environment mode (Sandbox or Live)'
                                },
                                {
                                    name: 'client_id',
                                    label: 'Client ID',
                                    type: 'text',
                                    value: 'Rei**************mqu',
                                    placeholder:
                                        'Enter your Adobe CRM Client ID (e.g., ABC123XYZ456)'
                                },
                                {
                                    name: 'client_secret',
                                    label: 'Client Secret',
                                    type: 'text',
                                    value: 'Rer***************add',
                                    placeholder:
                                        'Enter your Adobe CRM Client Secret (e.g., XYZ789LMN012)'
                                }
                            ],
                            status: 'active',
                            created_at: '2025-02-10T19:47:46.000000Z',
                            updated_at: '2025-02-10T19:47:55.000000Z'
                        }
                    },
                    {
                        id: 'berkeley',
                        name: 'Berkeley',
                        description:
                            'Berkeley Payment is a modern payment gateway offering real-time processing, robust security, and customizable checkout solutions.',
                        features: [
                            'Real-time payment processing',
                            'Robust security and compliance',
                            'Customizable checkout solutions',
                            'API integration for seamless connectivity'
                        ],
                        image: 'https://horus-appcenter-develop.s3.ca-central-1.amazonaws.com/apps/berkeley.png?X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEKz%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDGNhLWNlbnRyYWwtMSJIMEYCIQDEUGuzP9Ym4SvGfk3JVfySUl5jTXM27XFfcsEhP6i%2FjQIhAJErsUO5qirdAzuoOcj3Ovk9n%2BdYImmV8LjU%2FatxZWivKqEDCMX%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQAhoMNjIwNzUyMDgxMjg0Igzatw2ch%2FsTJMiaER4q9QJz1ny29u0u0qPhdULVB3z%2FC7A%2FQzbXD1Lt2Ka0FRRi%2B1PAtXXqWRQ4ZsqMqH8YynBnMjsDWfzvsdnQ7ePkIMQgkCmTtxIhugGM776f0iCDPok3JSJKkKlrPR44x7EyBx%2Ft3FPtIk9TCzIZhdZnBhp0c2F4Q3d%2F5jtNOW0iJzqCi5zmeapbGfFQbXly5rzP6nym7lCBPSdOqmIDe6KJDhJOUYHdKAZJ7wV0QBSk8sj38G0ZAmWqPVTLXLFMekOzM36PKO1jwfPIKnMWmVgDmQbZPHojwhWzPsDwKwIZcS6ZfEiPpHqS8sWRw2lGPTfqdgBhrYvmiYw5jPFLg0iZMDCGwVtGRdG9776lqwvaGFHrOy2JpsCjzQW%2F4Y%2BKRjRWBVSY1NkiIJ4OgmMQatw3x5s%2B%2FaPiOcihQl7KToPSAfeAp1wNlFL25%2BD%2FtcX0701hC6vJTl1p9tHI7cQV7OK%2FYVjE9S3te44ui3s6fUkkYxP17p7QLFXLMNayqb0GOpwBLhPxlZ%2F%2F8rcBfLQXQ%2BcS5opLepLoL6NYqfBQoUxvJ4v96Zi4yeU7u7h%2FhmUknXwZjIGpKPuAVY5D3LnVYnAswQv8k9ZAgIIdE7wTBwYbmPcDhTEDU2Ti0d8MTWs%2FquFfpBMw%2BPO2jJXaUotBbs0p1nMH7u8oXQihnGpPUXOB4vzqxbKml7yzSijysQ%2BjLQbk5TVavuRHNoYNjZc4&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAZBB5VCGCIUKKVA4X%2F20250210%2Fca-central-1%2Fs3%2Faws4_request&X-Amz-Date=20250210T195844Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Signature=b476e3ee898b67cd3e8da9cd89069315ef9e5f70ef0a3de5554293c46a3780a9',
                        category: 'payment',
                        category_label: 'Payment Gateway',
                        company_app: {
                            config: [
                                {
                                    name: 'mode',
                                    label: 'Mode',
                                    type: 'select',
                                    value: null,
                                    options: {
                                        sandbox: 'Sandbox',
                                        live: 'Live'
                                    },
                                    placeholder:
                                        'Select environment mode (Sandbox or Live)'
                                },
                                {
                                    name: 'accounts',
                                    label: 'Accounts',
                                    type: 'list',
                                    value: [
                                        [
                                            {
                                                name: 'account_name',
                                                label: 'Account Name',
                                                type: 'select',
                                                value: null,
                                                options: {
                                                    clients: 'Clients',
                                                    clinics: 'Clinics'
                                                },
                                                placeholder:
                                                    'Select the associated account'
                                            },
                                            {
                                                name: 'business_entity_id',
                                                label: 'Business Entity ID',
                                                type: 'text',
                                                value: null,
                                                placeholder:
                                                    'Enter the Business Entity ID (e.g., 4988)'
                                            },
                                            {
                                                name: 'physical_package_id',
                                                label: 'Physical Package ID',
                                                type: 'text',
                                                value: null,
                                                placeholder:
                                                    'Enter the Physical Package ID (e.g., 2167)'
                                            },
                                            {
                                                name: 'package_id',
                                                label: 'Package ID',
                                                type: 'text',
                                                value: null,
                                                placeholder:
                                                    'Enter the Package ID (e.g., 2168)'
                                            },
                                            {
                                                name: 'purse_id',
                                                label: 'Purse ID',
                                                type: 'text',
                                                value: null,
                                                placeholder:
                                                    'Enter the Purse ID (e.g., 14)'
                                            },
                                            {
                                                name: 'username',
                                                label: 'Username',
                                                type: 'text',
                                                value: null,
                                                placeholder:
                                                    'Enter your Berkeley username (e.g., johndoe)'
                                            },
                                            {
                                                name: 'password',
                                                label: 'Password',
                                                type: 'text',
                                                value: null,
                                                placeholder:
                                                    'Enter your Berkeley account password'
                                            }
                                        ]
                                    ]
                                }
                            ],
                            status: null,
                            created_at: null,
                            updated_at: null
                        }
                    }
                ]
            }
        });
        await wrapper.vm.$nextTick();

        // Test static elements
      const searchWrapper = wrapper.findByTestId('search-input');
expect(searchWrapper.find('input').exists()).toBe(true);
expect(searchWrapper.find('input').attributes('placeholder')).toBe(
    'Search'
);

        wrapper.props('items').forEach((item, index) => {
            // Card and basic info
            expect(wrapper.findByTestId(`payment-card-${index}`).exists()).toBe(
                true
            );
            expect(
                wrapper.findByTestId(`provider-image-${index}`).exists()
            ).toBe(true);
            expect(wrapper.findByTestId(`provider-name-${index}`).text()).toBe(
                item.name
            );
            expect(
                wrapper.findByTestId(`provider-category-${index}`).text()
            ).toBe(item.category_label);
            expect(
                wrapper.findByTestId(`provider-description-${index}`).text()
            ).toBe(item.description);

            // Features
            item.features.forEach((_, featureIndex) => {
                expect(
                    wrapper
                        .findByTestId(
                            `provider-feature-${index}-${featureIndex}`
                        )
                        .exists()
                ).toBe(true);
            });

            // Action elements
            if (item.company_app?.status !== 'active') {
                expect(
                    wrapper.findByTestId(`activate-button-${index}`).exists()
                ).toBe(true);
            }

            if (item.company_app?.status === 'active') {
                expect(
                    wrapper.findByTestId(`actions-button-${index}`).exists()
                ).toBe(true);
            }
        });

        const berkeleyIndex = 1;
        const activateButton = wrapper.findByTestId(
            `activate-button-${berkeleyIndex}`
        );
        expect(activateButton.exists()).toBe(true);

        const adobeIndex = 0;
        const actionsButton = wrapper.findByTestId(
            `actions-button-${adobeIndex}`
        );
        expect(actionsButton.exists()).toBe(true);
    });
});
