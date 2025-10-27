import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/policies/components/tables/PoliciesTable.vue';

describe('Policies table view', () => {
    it('renders correctly', async () => {
        const wrapper = mount(TableView);
        wrapper.vm.policies = [
            { id: 1, name: 'Test Policy', status: 'active' }
        ];
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(wrapper.findByTestId('bulk-actions-button').text()).toBe(
            'Bulk Actions'
        );
    });
});
