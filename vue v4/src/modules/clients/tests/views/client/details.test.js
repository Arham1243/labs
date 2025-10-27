import { beforeEach, describe, expect, it, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import Details from '@/modules/clients/views/client/details.vue';
import {
    getClientMock,
    searchClientsMock
} from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Details view', () => {
    beforeEach(() => {
        getClientMock();
        searchClientsMock();

        updateAbility([
            'view clients',
            'view business units',
            'view client users',
            'delete clients'
        ]);
    });

    it('renders correctly', async () => {
        const wrapper = mount(Details, {
            props: { id: '5e614f6e-c241-497c-988e-e1e8531aa978', data: [] },
            global: {
                mocks: {
                    useRouter: vi.fn()
                }
            }
        });
        await flushPromises();

        expect(wrapper.findComponent({ name: 'StatusTag' }).exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('square-button').exists()).toBe(true);
        expect(wrapper.findByTestId('comment-button').exists()).toBe(true);
        expect(wrapper.findByTestId('actions-button').exists()).toBe(true);

        expect(wrapper.findComponent({ name: 'Menu' }).exists()).toBe(true);

        const tabviewTitles = wrapper.findAll('.p-tab');
        expect(tabviewTitles).toHaveLength(
            import.meta.env.VITE_SHOW_INSUREDS_TAB ? 6 : 5
        );
        expect(tabviewTitles[0].text()).toBe('Business Units');
        expect(tabviewTitles[1].text()).toBe('Documents');
        expect(tabviewTitles[2].text()).toBe('Contacts');
        expect(tabviewTitles[3].text()).toBe('Users');
        expect(tabviewTitles[4].text()).toBe('Audit Log');
        if (import.meta.env.VITE_SHOW_INSUREDS_TAB) {
            expect(tabviewTitles[5].text()).toBe('Insureds');
        }

        expect(wrapper.findComponent({ name: 'BusinessUnits' }).exists()).toBe(
            true
        );
        expect(wrapper.findComponent({ name: 'DetailsPanel' }).exists()).toBe(
            true
        );
    });
});
