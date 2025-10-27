import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent, within } from '@testing-library/vue';
import { mount } from '@vue/test-utils';
import OrderView from '@/modules/policies/views/order/index.vue';
import { useHelpers } from '@/composables';
import { usePoliciesStore } from '@/modules/policies/stores/Policies';

vi.mock('@/modules/policies/stores/Policies', () => ({
    usePoliciesStore: vi.fn(() => ({
        client: {
            id: 'de4e4e9d-68a5-4410-ad82-15efcd838de0',
            name: { en: 'et quo tempore', fr: 'voluptates sit cupiditate' },
            short_name: {
                en: 'nulla veritatis fugiat',
                fr: 'non quibusdam consequuntur'
            },
            client_sector_id: '407ba05d-cc9f-4786-89f6-82b0b0dbfa00',
            client_sector: {
                id: '407ba05d-cc9f-4786-89f6-82b0b0dbfa00',
                name: 'Prof. Pietro Champlin',
                status: 'active',
                created_at: '2024-11-29T21:23:38.000000Z',
                updated_at: '2024-11-29T21:23:38.000000Z'
            },
            enrollment_type: 'api',
            phone_number: '+201203131319',
            website_url: null,
            country_id: null,
            address: 'Voluptatem qui libero minus distinctio at et beatae.',
            address2:
                'Et molestiae impedit corrupti debitis accusamus facere ut.',
            city: 'Alexandria',
            postal_code: null,
            status: 'active',
            type: 'shared',
            client: 'shared',
            provisioning_status: 'unprovisioned',
            preferred_language: 'en',
            logo: null
        },
        businessUnit: {
            id: '14f5b089-d4d8-4eef-9861-89d6269674a3',
            name: {
                en: 'et molestiae reprehenderit',
                fr: 'deserunt aut aliquam'
            },
            short_name: {
                en: 'distinctio enim deserunt',
                fr: 'ipsum autem cum'
            },
            client_id: 'de4e4e9d-68a5-4410-ad82-15efcd838de0',
            client: {
                id: 'de4e4e9d-68a5-4410-ad82-15efcd838de0',
                name: { en: 'et quo tempore', fr: 'voluptates sit cupiditate' },
                short_name: {
                    en: 'nulla veritatis fugiat',
                    fr: 'non quibusdam consequuntur'
                },
                client_sector_id: '407ba05d-cc9f-4786-89f6-82b0b0dbfa00',
                client_sector: {
                    id: '407ba05d-cc9f-4786-89f6-82b0b0dbfa00',
                    name: 'Prof. Pietro Champlin',
                    status: 'active',
                    created_at: '2024-11-29T21:23:38.000000Z',
                    updated_at: '2024-11-29T21:23:38.000000Z'
                },
                enrollment_type: 'api',
                phone_number: '+201203131319',
                website_url: null,
                country_id: null,
                address: 'Voluptatem qui libero minus distinctio at et beatae.',
                address2:
                    'Et molestiae impedit corrupti debitis accusamus facere ut.',
                city: 'Alexandria',
                postal_code: null,
                status: 'active',
                type: 'shared',
                client: 'shared',
                provisioning_status: 'unprovisioned',
                preferred_language: 'en',
                logo: null
            },
            is_enrollment_type_same_as_client: false,
            enrollment_type: 'api',
            billing_access_status: true,
            is_phone_number_same_as_client: false,
            phone_number: '+201203131319',
            is_website_url_same_as_client: false,
            website_url: 'phoenix@phoenix.com',
            account_manager_user_id: null,
            is_location_details_same_as_client: false,
            location_details: {
                country_id: null,
                address:
                    'Non distinctio commodi voluptatem nobis incidunt excepturi veniam.',
                address2:
                    'Labore illo qui id mollitia aspernatur rerum animi corrupti.',
                city: 'Alexandria',
                postal_code: null
            },
            active_plans_count: 0,
            status: 'draft'
        },
        contactSource: { id: 'email', name: 'E-mail' },
        message: null,
        setOrderDetails: vi.fn(),
        clearOrderDetails: vi.fn()
    }))
}));

vi.mock('@/composables', () => ({
    useHelpers: vi.fn(() => ({
        getLocaleValue: (value) => value?.en || ''
    }))
}));

describe('Policies > Order index view', () => {
    it('page renders correctly', async () => {
        const wrapper = mount(OrderView);
        const policiesStore = usePoliciesStore();
        const helpers = useHelpers();
        expect(wrapper.findByTestId('page-title').text()).toBe(
            'Order Policies'
        );
        const orderPolicyButton = wrapper.findByTestId('order-details-button');
        expect(orderPolicyButton.exists()).toBe(true);
        expect(orderPolicyButton.text()).toBe(
            helpers.getLocaleValue(policiesStore.client?.name)
        );
        expect(wrapper.findByTestId('close-button').exists()).toBe(true);
        expect(wrapper.findComponent({ name: 'Confirmation' }).exists()).toBe(
            true
        );
    });

    it('should open order details dialog and display elements correctly', async () => {
        const { getByTestId } = render(OrderView);

        const orderPolicyButton = getByTestId('order-details-button');
        await fireEvent.click(orderPolicyButton);

        const dialog = getByTestId('order-dialog');
        expect(dialog).toBeTruthy();

        const { getByTestId: getDialogTestId } = within(dialog);

        // Assert dialog title
        const dialogTitle = getDialogTestId('order-dialog-title');
        expect(dialogTitle).toBeTruthy();
        expect(dialogTitle.textContent.trim()).toBe('Order Details');

        // Assert dialog close button
        expect(getDialogTestId('order-dialog-close')).toBeTruthy();

        // Assert labels
        expect(getDialogTestId('order-client-label')).toBeTruthy();
        expect(getDialogTestId('order-client-label').textContent.trim()).toBe(
            'Client Name'
        );

        expect(getDialogTestId('order-business-unit-label')).toBeTruthy();
        expect(
            getDialogTestId('order-business-unit-label').textContent.trim()
        ).toBe('Business Unit');

        expect(getDialogTestId('order-contact-source-label')).toBeTruthy();
        expect(
            getDialogTestId('order-contact-source-label').textContent.trim()
        ).toBe('Contact Source');

        // Assert Value
        expect(getDialogTestId('order-client-value')).toBeTruthy();
        expect(getDialogTestId('order-business-unit-value')).toBeTruthy();
        expect(getDialogTestId('order-contact-source-value')).toBeTruthy();
    });
});
