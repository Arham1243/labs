import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RoleTable from '@/modules/administration/components/teams/tables/RoleTable.vue';
import { searchRolesMock } from '@/modules/administration/tests/mocks/TeamRole.service.mocks';
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

describe('Teams > Roles Table View', () => {
    let wrapper;

    beforeEach(() => {
        searchRolesMock();
    });

    afterEach(async () => {
        if (wrapper) {
            wrapper.unmount();
            await flushPromises();
        }
    });

    it('renders the table with correct headers', async () => {
        updateAbility(['update teams']);
        wrapper = mount(RoleTable, {
            props: { action: 'included', entity_id: '1' }
        });

        await flushPromises();
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('bulk-actions-button').exists()).toBe(true);
        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe(
            'Role Name'
        );
        expect(wrapper.findByTestId('table-header-last-updated').text()).toBe(
            'Last Updated'
        );
    });

    it('disables bulk actions button when no roles selected', async () => {
        updateAbility(['update teams']);
        wrapper = mount(RoleTable, {
            props: { action: 'included', entity_id: '1' }
        });

        await flushPromises();
        await wrapper.vm.$nextTick();
        expect(
            wrapper.findByTestId('bulk-actions-button').element.disabled
        ).toBe(true);

        wrapper.vm.selectedItems = [{ id: 1, name: 'Role 1' }];
        await wrapper.vm.$nextTick();
        expect(
            wrapper.findByTestId('bulk-actions-button').element.disabled
        ).toBe(false);
    });

    it('shows empty state if no roles', async () => {
        wrapper = mount(RoleTable, {
            props: { action: 'included', entity_id: '1' }
        });

        await flushPromises();
        wrapper.vm.items = [];
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
    });

    it('toggles selectAll checkbox selects/deselects current page roles', async () => {
        updateAbility(['update teams']);
        wrapper = mount(RoleTable, {
            props: { action: 'included', entity_id: '1' }
        });

        await flushPromises();
        wrapper.vm.items = [
            { id: '1', name: 'Role 1', type: 'company' },
            { id: '2', name: 'Role 2', type: 'company' }
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
        wrapper = mount(RoleTable, {
            props: { action: 'included', entity_id: '1' }
        });
        await flushPromises();
        const searchInput = wrapper.findByTestId('search-input');

        await searchInput.setValue('test');
        expect(wrapper.vm.searchText).toBe('test');
    });

    it('shows confirmation when bulk action triggered', async () => {
        updateAbility(['update teams']);
        wrapper = mount(RoleTable, {
            props: { action: 'excluded', entity_id: '1' },
            global: {
                components: { Confirmation }
            }
        });
        await flushPromises();
        wrapper.vm.selectedItems = [
            { id: 1, name: 'Role 1' },
            { id: 2, name: 'Role 2' }
        ];

        await wrapper.vm.$nextTick();
        wrapper.vm.showConfirm('bulk');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.confirmationVisible).toBe(true);
        expect(wrapper.vm.confirmationMode).toBe('bulk');
    });
});
