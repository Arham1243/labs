import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Details from '@/modules/clients/views/holding/details.vue';
import { getHoldingMock } from '@/modules/clients/tests/mocks/Client.service.mocks';
import { updateAbility } from '@/plugins/ability';

describe('Details view', () => {
    beforeEach(() => {
        getHoldingMock();

        updateAbility([
            'create holdings',
            'view clients',
            'update holdings',
            'delete holdings'
        ]);
    });

    it('renders correctly', async () => {
        const wrapper = mount(Details, {
            props: { id: '5e614f6e-c241-497c-988e-e1e8531aa978' }
        });

        expect(wrapper.findComponent({ name: 'StatusTag' }).exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('square-button').exists()).toBe(true);
        expect(wrapper.findByTestId('comment-button').exists()).toBe(true);
        expect(wrapper.findByTestId('actions-button').exists()).toBe(true);

        expect(wrapper.findComponent({ name: 'Menu' }).exists()).toBe(true);

        const tabviewTitles = wrapper.findAll('.p-tabview-title');
        expect(tabviewTitles).toHaveLength(4);
        expect(tabviewTitles[0].text()).toBe('Clients');
        expect(tabviewTitles[1].text()).toBe('Documents');
        expect(tabviewTitles[2].text()).toBe('Users');
        expect(tabviewTitles[3].text()).toBe('Audit Log');

        expect(wrapper.findComponent({ name: 'DetailsPanel' }).exists()).toBe(
            true
        );
    });
});
