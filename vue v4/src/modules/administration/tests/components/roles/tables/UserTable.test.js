import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/roles/tables/UserTable.vue';
import { searchUsersMock } from '@/modules/administration/tests/mocks/RoleUser.service.mocks';
import { updateAbility } from '@/plugins/ability';

vi.mock('@/modules/administration/stores', async (importOriginal) => {
    const mod = await importOriginal();
    return {
        ...mod,
        useRoleStore: () => ({
            currentRole: { id: 1 }
        })
    };
});

describe('Role > Users Table View', () => {
    beforeEach(() => {
        searchUsersMock();
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['update roles']);

        const wrapper = mount(TableView);
        const searchContainer = wrapper.findByTestId('search-input');
        const searchInput = searchContainer.find('input');
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('bulk-actions-button').exists()).toBe(true);
        expect(searchInput.exists()).toBe(true);
        expect(searchInput.attributes('placeholder')).toBe('Search');

        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe('Name');

        expect(wrapper.findByTestId('table-header-last-updated').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('table-header-last-updated').text()).toBe(
            'Last Updated'
        );
    });

    it('hides create button without permission', async () => {
        updateAbility([]);
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('add-new-user-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        const wrapper = mount(TableView, {
            props: { action: 'included', entity_id: '1' }
        });

        wrapper.vm.items = [];
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
    });

    it('updates the search input when searchText changes', async () => {
        const wrapper = mount(TableView);
        wrapper.vm.searchText = 'dev user';

        await wrapper.vm.$nextTick();

        const searchContainer = wrapper.findByTestId('search-input');
        const input = searchContainer.find('input');
        expect(input.element.value).toBe('dev user');
        expect(wrapper.vm.searchText).toBe('dev user');
    });
});
