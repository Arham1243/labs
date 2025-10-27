import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import IndexView from '@/modules/clients/views/index.vue';
import { updateAbility } from '@/plugins/ability';

describe('Holding index view', () => {
    it('renders correctly', async () => {
        updateAbility(['create clients']);
        const wrapper = mount(IndexView);

        expect(wrapper.findByTestId('page-title').text()).toBe('Clients');
        expect(wrapper.findByTestId('add-new-clients-button').text()).toBe(
            'New'
        );

        expect(wrapper.findComponent({ name: 'Menu' }).exists()).toBe(true);
        expect(wrapper.findComponent({ name: 'Tabs' }).exists()).toBe(true);
    });
});
