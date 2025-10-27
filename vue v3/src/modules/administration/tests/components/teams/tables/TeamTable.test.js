import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/teams/tables/TeamTable.vue';
import { searchMock } from '@/modules/administration/tests/mocks/Team.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { nextTick } from 'vue';
import { TeamService } from '@/modules/administration/services';
// Mock vue-router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush
    })),
    useRoute: vi.fn(() => ({
        fullPath: '/administration/teams'
    }))
}));

describe('Teams Table View', () => {
    let wrapper;

    beforeEach(() => {
        // Clear mock calls before each test
        mockPush.mockClear();

        searchMock();
        vi.spyOn(TeamService, 'create').mockResolvedValue({
            data: { data: { id: 1, name: 'Test Team', type: 'company' } }
        });
        vi.spyOn(TeamService, 'update').mockResolvedValue({
            data: {
                data: { id: 1, name: 'Test Team Updated', type: 'company' }
            }
        });
        vi.spyOn(TeamService, 'deleteItem').mockResolvedValue({
            data: { data: { name: 'Test Team' } }
        });

        wrapper = mount(TableView);
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['create teams']);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('type-filter-dropdown').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(
            wrapper.findByTestId('search-input').attributes('placeholder')
        ).toBe('Search');
        expect(wrapper.findByTestId('add-new-team-button').text()).toBe(
            'New Team'
        );

        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe(
            'Team Name'
        );

        expect(wrapper.findByTestId('table-header-type').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-type').text()).toBe('Type');

        expect(wrapper.findByTestId('table-header-last-updated').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('table-header-last-updated').text()).toBe(
            'Last Updated'
        );
    });

    it('hides create button without permission', async () => {
        updateAbility([]);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('add-new-team-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No teams found.'
        );
    });

    it('renders a new teams after adding to state', async () => {
        updateAbility(['update teams']);

        const newItem = {
            id: 1,
            name: 'Admin',
            type: 'administrator',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').text()).toBe('Admin');
        expect(wrapper.findByTestId('type-data-table-0').text()).toBe(
            'Administrator'
        );
        expect(wrapper.findByTestId('last-updated-data-table-0').text()).toBe(
            wrapper.vm.helpers.formatDate(newItem.updated_at)
        );
        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(true);
    });

    it('hides actions button without update permission', async () => {
        updateAbility([]);

        const newItem = {
            id: 1,
            name: 'Admin',
            type: 'administrator',
            updated_at: '2025-04-04T14:26:39.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });

    it('updates the search input when searchText changes', async () => {
        wrapper.vm.searchText = 'admin';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.element.value).toBe('admin');
        expect(wrapper.vm.searchText).toBe('admin');
    });

    // Test for formatType function
    it('formats type string correctly', () => {
        expect(wrapper.vm.formatType('company')).toBe('Company');
        expect(wrapper.vm.formatType('business_unit')).toBe('Business Unit');
        expect(wrapper.vm.formatType('service_provider')).toBe(
            'Service Provider'
        );
    });

    // Test for dialog header computation
    it('computes dialog header based on (create/edit) mode', () => {
        wrapper.vm.isEditMode = false;
        expect(wrapper.vm.dialogHeader).toContain('Create Team');

        wrapper.vm.isEditMode = true;
        expect(wrapper.vm.dialogHeader).toContain('Edit Team');
    });

    // Test for menu items with permissions
    it('computes menu items with permissions', () => {
        updateAbility(['view teams', 'update teams', 'delete teams']);
        wrapper.vm.selectedItem = {
            id: 1,
            name: 'Test Team',
            type: 'company'
        };
        const items = wrapper.vm.menuItems;
        expect(Array.isArray(items)).toBe(true);

        // Find items by their labels
        const viewItem = items.find((item) => item.label === 'View');
        const editItem = items.find((item) => item.label === 'Edit');
        const deleteItem = items.find((item) => item.label === 'Delete');

        // Verify all expected items exist
        expect(viewItem).toBeTruthy();
        expect(editItem).toBeTruthy();
        expect(deleteItem).toBeTruthy();
    });

    // Tests for dialog operations
    it('calls openDialog and sets add mode by default', () => {
        wrapper.vm.openDialog();
        expect(wrapper.vm.isDialogVisible).toBe(true);
        expect(wrapper.vm.isEditMode).toBe(false);
    });

    it('calls openDialog and sets edit mode when "edit" is passed', () => {
        wrapper.vm.openDialog('edit');
        expect(wrapper.vm.isDialogVisible).toBe(true);
        expect(wrapper.vm.isEditMode).toBe(true);
    });

    it('calls closeDialog and closes the form', () => {
        wrapper.vm.isDialogVisible = true;
        wrapper.vm.closeDialog();
        expect(wrapper.vm.isDialogVisible).toBe(false);
    });

    it('calls resetForm and clears form data', () => {
        wrapper.vm.formData.type = 'company';
        wrapper.vm.formData.name = 'Test Team';
        wrapper.vm.formData.description = 'Test Description';
        wrapper.vm.resetForm();
        expect(wrapper.vm.formData.type).toBe('');
        expect(wrapper.vm.formData.name).toBe('');
        expect(wrapper.vm.formData.description).toBe('');
    });

    // Test for item editing
    it('calls editItem and populates formData and opens dialog in edit mode', () => {
        wrapper.vm.selectedItem = {
            id: 1,
            name: 'Test Team',
            type: 'company',
            description: 'Test Description'
        };
        wrapper.vm.editItem();
        expect(wrapper.vm.formData.type).toBe('company');
        expect(wrapper.vm.formData.name).toBe('Test Team');
        expect(wrapper.vm.formData.description).toBe('Test Description');
        expect(wrapper.vm.isEditMode).toBe(true);
    });

    // Test for showDeleteDialog
    it('calls showDeleteDialog and sets deleteDialog to true', () => {
        wrapper.vm.deleteDialog = false;
        wrapper.vm.showDeleteDialog();
        expect(wrapper.vm.deleteDialog).toBe(true);
    });

    // Tests for API operations
    it('calls save and creates a new team', async () => {
        wrapper.vm.isEditMode = false;
        wrapper.vm.formData = {
            type: 'Company',
            name: 'Test Team',
            description: 'Test Description'
        };
        await wrapper.vm.save();
        expect(TeamService.create).toHaveBeenCalledWith({
            type: 'company',
            name: 'Test Team',
            description: 'Test Description'
        });
    });

    it('calls save and updates an existing team', async () => {
        wrapper.vm.isEditMode = true;
        wrapper.vm.selectedItem = {
            id: 1
        };
        wrapper.vm.formData = {
            type: 'Company',
            name: 'Test Team Updated',
            description: 'Test Description Updated'
        };
        await wrapper.vm.save();
        expect(TeamService.update).toHaveBeenCalledWith(1, {
            type: 'company',
            name: 'Test Team Updated',
            description: 'Test Description Updated'
        });
    });

    it('calls deleteItem and deletes a team', async () => {
        wrapper.vm.selectedItem = {
            id: 1
        };
        await wrapper.vm.deleteItem();
        expect(TeamService.deleteItem).toHaveBeenCalledWith(1);
    });

    // Test for navigation
    it('navigates to team details when goToView is called', () => {
        wrapper.vm.selectedItem = {
            id: 1
        };
        wrapper.vm.goToView();
        expect(mockPush).toHaveBeenCalledWith({
            name: 'TeamUsers',
            params: { id: 1 }
        });
    });

    it('navigates to team details when row is clicked', () => {
        wrapper.vm.rowClicked({ data: { id: 1 } });
        expect(mockPush).toHaveBeenCalledWith({
            name: 'TeamUsers',
            params: { id: 1 }
        });
    });
});
