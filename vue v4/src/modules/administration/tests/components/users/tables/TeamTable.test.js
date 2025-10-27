import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TeamTable from '@/modules/administration/components/users/tables/TeamTable.vue';
import { searchTeamsMock } from '@/modules/administration/tests/mocks/UserTeam.service.mocks';
import { updateAbility } from '@/plugins/ability';
import Confirmation from '@/components/common/Confirmation.vue';

vi.mock('vue-i18n', () => ({
    useI18n: () => {
        const dict = {
            'common.team_name': 'Team Name',
            'common.last_updated': 'Last Updated'
        };
        return {
            t: (key) => dict[key] ?? key
        };
    }
}));

vi.mock('@/modules/administration/stores', async (importOriginal) => {
    const mod = await importOriginal();
    return {
        ...mod,
        useUserStore: () => ({
            currentUser: { id: 1, type: 'company' }
        })
    };
});

describe('Users > Teams Table View', () => {
    beforeEach(() => {
        searchTeamsMock();
    });

    it('renders the table with correct headers', async () => {
        updateAbility(['update users']);
        const wrapper = mount(TeamTable, {
            props: { action: 'included', entity_id: '1' }
        });

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('bulk-actions-button').exists()).toBe(true);
        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe(
            'Team Name'
        );
        expect(wrapper.findByTestId('table-header-last-updated').text()).toBe(
            'Last Updated'
        );
    });

    it('disables bulk actions button when no teams selected', async () => {
        updateAbility(['update users']);
        const wrapper = mount(TeamTable, {
            props: { action: 'included', entity_id: '1' }
        });

        await wrapper.vm.$nextTick();
        expect(
            wrapper.findByTestId('bulk-actions-button').element.disabled
        ).toBe(true);

        wrapper.vm.selectedItems = [{ id: 1, name: 'Team 1' }];
        await wrapper.vm.$nextTick();
        expect(
            wrapper.findByTestId('bulk-actions-button').element.disabled
        ).toBe(false);
    });

    it('shows empty state if no teams', async () => {
        const wrapper = mount(TeamTable, {
            props: { action: 'included', entity_id: '1' }
        });

        wrapper.vm.items = [];
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
    });

    it('toggles selectAll checkbox selects/deselects current page teams', async () => {
        updateAbility(['update users']);
        const wrapper = mount(TeamTable, {
            props: { action: 'included', entity_id: '1' }
        });

        wrapper.vm.items = [
            { id: '1', name: 'Team 1', type: 'company' },
            { id: '2', name: 'Team 2', type: 'company' }
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
        const wrapper = mount(TeamTable, {
            props: { action: 'included', entity_id: '1' }
        });
        const searchInput = wrapper.find('[data-testid="search-input"] input');

        await searchInput.setValue('test');
        expect(wrapper.vm.searchText).toBe('test');
    });

    it('shows confirmation when bulk action triggered', async () => {
        updateAbility(['update users']);
        const wrapper = mount(TeamTable, {
            props: { action: 'excluded', entity_id: '1' },
            global: {
                stubs: {
                    Confirmation: true,
                    Dialog: true
                }
            }
        });
        wrapper.vm.selectedItems = [
            { id: 1, name: 'Team 1' },
            { id: 2, name: 'Team 2' }
        ];

        await wrapper.vm.$nextTick();
        wrapper.vm.showConfirm('bulk');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.confirmationVisible).toBe(true);
        expect(wrapper.vm.confirmationMode).toBe('bulk');
    });
});
