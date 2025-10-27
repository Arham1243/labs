import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/MenuTable.vue';
import { AllMenusMock } from '@/modules/administration/tests/mocks/AllMenus.service.mocks';
import { searchMenuMock } from '@/modules/administration/tests/mocks/Menu.service.mocks';
import { searchPermissionMock } from '@/modules/administration/tests/mocks/Permission.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { nextTick } from 'vue';
import { MenuService } from '@/modules/administration/services';

describe('MenuTable', () => {
    let wrapper;
    beforeEach(() => {
        AllMenusMock();
        searchMenuMock();
        searchPermissionMock();
        vi.spyOn(MenuService, 'create').mockResolvedValue({});
        vi.spyOn(MenuService, 'update').mockResolvedValue({});
        vi.spyOn(MenuService, 'updateStatus').mockResolvedValue({});
        vi.spyOn(MenuService, 'updateOrder').mockResolvedValue({});
        vi.spyOn(MenuService, 'deleteItem').mockResolvedValue({});
        wrapper = mount(TableView);
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['create menu items']);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(
            wrapper.findByTestId('search-input').attributes('placeholder')
        ).toBe('Search');
        expect(wrapper.findByTestId('add-new-menu-button').text()).toBe(
            'New Item'
        );

        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe('Name');

        expect(wrapper.findByTestId('table-header-url').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-url').text()).toBe('URL');

        expect(wrapper.findByTestId('table-header-permission').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('table-header-permission').text()).toBe(
            'Permission'
        );

        expect(wrapper.findByTestId('table-header-status').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-status').text()).toBe(
            'Status'
        );
    });

    it('hides create button without permission', async () => {
        updateAbility([]);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('add-new-menu-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No menus found.'
        );
    });

    it('updates the search input when searchText changes', async () => {
        wrapper.vm.searchText = 'Test menu';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.element.value).toBe('Test menu');

        expect(wrapper.vm.searchText).toBe('Test menu');
    });

    // New tests for status dialog text and class computation
    it('computes status dialog texts and class for active status', () => {
        wrapper.vm.selectedItem = { status: 'active', name: 'Dashboard' };
        expect(wrapper.vm.statusDialogHeader).toContain(
            'Make Menu Item Inactive'
        );
        expect(wrapper.vm.statusDialogContent).toContain('Dashboard');
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-danger');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Inactive');
    });

    it('computes status dialog texts and class for inactive status', () => {
        wrapper.vm.selectedItem = { status: 'inactive', name: 'Dashboard' };
        expect(wrapper.vm.statusDialogHeader).toContain(
            'Make Menu Item Active'
        );
        expect(wrapper.vm.statusDialogContent).toContain('Dashboard');
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-success');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Active');
    });

    // Test for isItemActive property
    it('computes isItemActive property based on (active/inactive) state', () => {
        wrapper.vm.selectedItem = { status: 'active', name: 'Dashboard' };
        expect(wrapper.vm.isItemActive).toBe(true);

        wrapper.vm.selectedItem = { status: 'inactive', name: 'Dashboard' };
        expect(wrapper.vm.isItemActive).toBe(false);
    });

    // Test for isItemSystem property
    it('computes isItemSystem property based on system flag', () => {
        wrapper.vm.selectedItem = { system: 1, name: 'Dashboard' };
        expect(wrapper.vm.isItemSystem).toBe(true);

        wrapper.vm.selectedItem = { system: 0, name: 'Dashboard' };
        expect(wrapper.vm.isItemSystem).toBe(false);
    });

    // Test for menu items with permissions
    it('computes menu items with permissions', () => {
        updateAbility([
            'view menu items',
            'update menu items',
            'delete menu items'
        ]);
        wrapper.vm.selectedItem = {
            status: 'active',
            name: 'Dashboard',
            system: 0
        };
        const items = wrapper.vm.menuItems;
        expect(Array.isArray(items)).toBe(true);

        // Find items by their labels
        const editItem = items.find((item) => item.label === 'Edit');
        const statusItem = items.find((item) => item.label === 'Make Inactive');
        const deleteItem = items.find((item) => item.label === 'Delete');

        // Verify all expected items exist
        expect(editItem).toBeTruthy();
        expect(statusItem).toBeTruthy();
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
        wrapper.vm.formData.name = 'Dashboard';
        wrapper.vm.formData.url = '/dashboard';
        wrapper.vm.formData.icon = { icon: 'pi pi-home' };
        wrapper.vm.formData.permission_ids = [
            { id: 1, name: 'view_dashboard' }
        ];
        wrapper.vm.formData.status = true;
        wrapper.vm.resetForm();
        expect(wrapper.vm.formData.name).toBe('');
        expect(wrapper.vm.formData.url).toBe('');
        expect(wrapper.vm.formData.icon).toBe(null);
        expect(wrapper.vm.formData.permission_ids).toEqual([]);
        expect(wrapper.vm.formData.status).toBe(false);
    });

    // Test for item editing
    it('calls editItem and populates formData and opens dialog in edit mode', () => {
        wrapper.vm.selectedItem = {
            id: 1,
            icon: 'pi pi-home',
            name: 'Dashboard',
            url: '/dashboard',
            permissions: [{ id: 1, name: 'view_dashboard' }],
            status: 'active',
            system: 0,
            order: 1
        };
        wrapper.vm.icons.value = [{ icon: 'pi pi-home' }];
        wrapper.vm.editItem();
        expect(wrapper.vm.isEditMode).toBe(true);
    });

    // Tests for dialog operations
    it('calls showStatusUpdateDialog and sets statusUpdateDialog to true', () => {
        wrapper.vm.statusUpdateDialog = false;
        wrapper.vm.showStatusUpdateDialog();
        expect(wrapper.vm.statusUpdateDialog).toBe(true);
    });

    it('calls showDeleteDialog and sets deleteDialog to true', () => {
        wrapper.vm.deleteDialog = false;
        wrapper.vm.showDeleteDialog();
        expect(wrapper.vm.deleteDialog).toBe(true);
    });

    // Tests for API operations
    it('calls updateStatus and updates the status of a menu item', async () => {
        wrapper.vm.selectedItem = {
            id: 1,
            status: 'active'
        };
        await wrapper.vm.updateStatus();
        expect(MenuService.updateStatus).toHaveBeenCalledWith(1, {
            status: 'inactive'
        });
    });

    it('calls save and creates a new menu item', async () => {
        wrapper.vm.isEditMode = false;
        wrapper.vm.formData = {
            name: 'Dashboard',
            url: '/dashboard',
            icon: { icon: 'pi pi-home' },
            permission_ids: [{ id: 1, name: 'view_dashboard' }],
            status: true,
            system: 0,
            order: null
        };
        wrapper.vm.allItems = [{ order: 1 }];
        await wrapper.vm.save();
        expect(MenuService.create).toHaveBeenCalled();
    });

    it('calls save and updates an existing menu item', async () => {
        wrapper.vm.isEditMode = true;
        wrapper.vm.selectedItem = {
            id: 1
        };
        wrapper.vm.formData = {
            name: 'Dashboard Updated',
            url: '/dashboard-updated',
            icon: { icon: 'pi pi-home' },
            permission_ids: [{ id: 1, name: 'view_dashboard' }],
            status: true,
            system: 0,
            order: 1
        };
        await wrapper.vm.save();
        expect(MenuService.update).toHaveBeenCalled();
    });

    it('calls deleteItem and deletes a menu item', async () => {
        wrapper.vm.selectedItem = {
            id: 1
        };
        await wrapper.vm.deleteItem();
        expect(MenuService.deleteItem).toHaveBeenCalledWith(1);
    });
});
