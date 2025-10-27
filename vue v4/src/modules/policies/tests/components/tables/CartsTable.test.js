import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/policies/components/tables/CartsTable.vue';

describe('Carts table view', () => {
    it('renders correctly', async () => {
        const wrapper = mount(TableView);
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(wrapper.findByTestId('filter-button').text()).toBe('Filter');
    });
});
