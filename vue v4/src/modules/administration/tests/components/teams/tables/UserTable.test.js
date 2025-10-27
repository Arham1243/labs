import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import UserTable from '@/modules/administration/components/teams/tables/UserTable.vue';
import { searchUsersMock } from '@/modules/administration/tests/mocks/TeamUser.service.mocks';
import { updateAbility } from '@/plugins/ability';
import Confirmation from '@/components/common/Confirmation.vue';

vi.mock('@/modules/administration/stores', async (importOriginal) => {
    const mod = await importOriginal();
    return {
        ...mod,
        useTeamStore: () => ({
            currentTeam: { id: 1, type: 'company' }
        })
    };
});

describe('Teams > Users Table View', () => {
    beforeEach(() => {
        searchUsersMock();
    });

    it('renders the table with correct headers', async () => {
        updateAbility(['update teams']);
        const wrapper = mount(UserTable, {
            props: { action: 'included', entity_id: '1' }
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('bulk-actions-button').exists()).toBe(true);
        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe('Name');
        expect(wrapper.findByTestId('table-header-last-updated').text()).toBe(
            'Last Updated'
        );
    });

    it('disables bulk actions button when no users selected', async () => {
        updateAbility(['update teams']);
        const wrapper = mount(UserTable, {
            props: { action: 'included', entity_id: '1' }
        });

        await wrapper.vm.$nextTick();
        expect(
            wrapper.findByTestId('bulk-actions-button').element.disabled
        ).toBe(true);

        wrapper.vm.selectedItems = [{ id: 1, name: 'User 1' }];
        await wrapper.vm.$nextTick();
        expect(
            wrapper.findByTestId('bulk-actions-button').element.disabled
        ).toBe(false);
    });

    it('shows empty state if no users', async () => {
        const wrapper = mount(UserTable, {
            props: { action: 'included', entity_id: '1' }
        });

        wrapper.vm.items = [];
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
    });

    it('toggles selectAll checkbox selects/deselects current page users', async () => {
        updateAbility(['update teams']);
        const wrapper = mount(UserTable, {
            props: { action: 'included', entity_id: '1' }
        });

        wrapper.vm.items = [
            { id: '1', name: 'User 1', type: 'company' },
            { id: '2', name: 'User 2', type: 'company' }
        ];
        wrapper.vm.totalRecords = 2;
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.selectAll).toBe(false);

        await wrapper.vm.toggleSelectAll();
        expect(wrapper.vm.selectAll).toBe(true);
        expect(wrapper.vm.selectedItems.length).toBe(2);

        await wrapper.vm.toggleSelectAll();
        expect(wrapper.vm.selectAll).toBe(false);
        expect(wrapper.vm.selectedItems.length).toBe(0);
    });

    it('updates searchText model value on input change', async () => {
        const wrapper = mount(UserTable, {
            props: { action: 'included', entity_id: '1' }
        });
        const searchInput = wrapper.find('[data-testid="search-input"] input');

        await searchInput.setValue('test');
        expect(wrapper.vm.searchText).toBe('test');
    });

    it('shows confirmation when bulk action triggered', async () => {
        updateAbility(['update teams']);
        const wrapper = mount(UserTable, {
            props: { action: 'excluded', entity_id: '1' },
            global: {
                stubs: {
                    Confirmation: true,
                    Dialog: true
                }
            }
        });
        wrapper.vm.selectedItems = [
            { id: 1, name: 'User 1' },
            { id: 2, name: 'User 2' }
        ];

        await wrapper.vm.$nextTick();
        wrapper.vm.showConfirm('bulk');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.confirmationVisible).toBe(true);
        expect(wrapper.vm.confirmationMode).toBe('bulk');
    });
});
