import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PolicyDetails from '@/modules/policies/components/policies/PolicyDetails.vue';
import { useCommonStore } from '@/stores';
import { nextTick } from 'vue';
import { useUserStore } from '@/modules/administration/stores';

vi.mock('@/composables', () => ({
    useHelpers: () => ({
        formatDate: (date) => date || '-'
    })
}));

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key) => key
    })
}));

describe('PolicyDetails.vue', () => {
    let wrapper;
    let commonStore;

    beforeEach(() => {
        wrapper = mount(PolicyDetails, {
            props: {
                data: {
                    id: 1,
                    client_id: 123,
                    policy_number: 'POL12345',
                    order_number: 'ORD-12345',
                    created_at: '2024-02-24',
                    booking_date: '2024-02-20',
                    start_date: '2024-03-01',
                    end_date: '2024-03-31',
                    group_name: 'Test Group',
                    student_number: 'STU12345',
                    address: '123 Test Street',
                    destination_country_id: 'CA'
                }
            }
        });

        commonStore = useCommonStore();

        commonStore.showCountry = vi.fn(() =>
            Promise.resolve({
                data: {
                    id: 'CA',
                    name: 'Canada',
                    region_id: 'NA'
                }
            })
        );

        const userStore = useUserStore();
        userStore.search = vi.fn(() =>
            Promise.resolve({
                data: [
                    {
                        id: '123456',
                        name: 'test user'
                    }
                ]
            })
        );
    });

    it('renders correctly', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('displays policy details', async () => {
        await nextTick();
        expect(wrapper.text()).toContain('ORD-12345');
        expect(wrapper.text()).toContain('STU12345');
        expect(wrapper.text()).toContain('123 Test Street');
    });
});
