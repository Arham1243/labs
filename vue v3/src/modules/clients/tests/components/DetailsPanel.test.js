import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DetailsPanel from '@/modules/clients/components/DetailsPanel.vue';

describe('DetailsPanel', () => {
    it('component renders correctly', async () => {
        const wrapper = mount(DetailsPanel, {
            props: {
                data: {}
            }
        });

        expect(wrapper.findByTestId('logo-img').exists()).toBe(true);
        expect(wrapper.findByTestId('org-id-label').text()).toBe('Org ID');
        expect(wrapper.findByTestId('phone-label').text()).toBe('Phone');
        expect(wrapper.findByTestId('website-label').text()).toBe('Website');
        expect(wrapper.findByTestId('enrollment-type-label').text()).toBe(
            'Enrollment Type'
        );
        expect(wrapper.findByTestId('access-for-billing-label').text()).toBe(
            'Access for Billing'
        );
        expect(wrapper.findByTestId('first-poc-label').text()).toBe(
            'First PoC'
        );
        expect(wrapper.findByTestId('more-details-button').text()).toBe(
            'More Details'
        );

        expect(wrapper.findComponent({ name: 'Sidebar' }).exists()).toBe(true);
    });
});
