import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/VendorTable.vue';
import { searchMock } from '@/modules/administration/tests/mocks/Vendor.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { nextTick } from 'vue';
import { VendorService } from '@/modules/administration/services';

describe('VendorTable', () => {
    let wrapper;
    beforeEach(() => {
        searchMock();
        vi.spyOn(VendorService, 'create').mockResolvedValue({});
        vi.spyOn(VendorService, 'update').mockResolvedValue({});
        vi.spyOn(VendorService, 'updateStatus').mockResolvedValue({});
        vi.spyOn(VendorService, 'deleteItem').mockResolvedValue({});
        wrapper = mount(TableView);
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['create vendors']);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(
            wrapper.findByTestId('search-input').attributes('placeholder')
        ).toBe('Search');
        expect(wrapper.findByTestId('add-new-vendor-button').text()).toBe(
            'New Vendor'
        );

        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe(
            'Vendor Name'
        );

        expect(wrapper.findByTestId('table-header-status').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-status').text()).toBe(
            'Status'
        );

        expect(wrapper.findByTestId('table-header-last-updated').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('table-header-last-updated').text()).toBe(
            'Last Updated'
        );
    });

    it('hides create button without create permission', async () => {
        updateAbility([]);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('add-new-vendor-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No vendors found.'
        );
    });

    it('renders new vendor in the table after adding to state', async () => {
        updateAbility(['update vendors']);

        const newItem = {
            id: '1738607032944782331',
            name: 'Test',
            status: 'active',
            updated_at: '2025-02-03T20:29:12.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').exists()).toBe(true);
        expect(wrapper.findByTestId('name-data-table-0').text()).toBe(
            newItem.name
        );

        expect(wrapper.findByTestId('status-tag-0').exists()).toBe(true);
        expect(wrapper.findByTestId('status-tag-0').text()).toBe('ACTIVE');

        expect(wrapper.findByTestId('last-updated-data-table-0').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('last-updated-data-table-0').text()).toBe(
            wrapper.vm.helpers.formatDate(newItem.updated_at)
        );

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(true);
    });

    it('updates the search input when searchText changes', async () => {
        wrapper.vm.searchText = 'Test vendor';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.element.value).toBe('Test vendor');

        expect(wrapper.vm.searchText).toBe('Test vendor');
    });

    // New tests for status dialog text and class computation
    it('computes status dialog texts and class for active status', () => {
        wrapper.vm.selectedItem = { status: 'active', name: 'Test Vendor' };
        expect(wrapper.vm.statusDialogHeader).toContain('Make Vendor Inactive');
        expect(wrapper.vm.statusDialogContent).toContain('Test Vendor');
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-danger');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Inactive');
    });

    it('computes status dialog texts and class for inactive status', () => {
        wrapper.vm.selectedItem = { status: 'inactive', name: 'Test Vendor' };
        expect(wrapper.vm.statusDialogHeader).toContain('Make Vendor Active');
        expect(wrapper.vm.statusDialogContent).toContain('Test Vendor');
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-success');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Active');
    });

    // Test for isItemActive property
    it('computes isItemActive property based on (active/inactive) state', () => {
        wrapper.vm.selectedItem = { status: 'active', name: 'Test Vendor' };
        expect(wrapper.vm.isItemActive).toBe(true);

        wrapper.vm.selectedItem = { status: 'inactive', name: 'Test Vendor' };
        expect(wrapper.vm.isItemActive).toBe(false);
    });

    // Test for dialog header computation
    it('computes dialog header based on (create/edit) mode', () => {
        wrapper.vm.isEditMode = false;
        expect(wrapper.vm.dialogHeader).toContain('New Vendor');

        wrapper.vm.isEditMode = true;
        expect(wrapper.vm.dialogHeader).toContain('Edit Vendor');
    });

    // Test for menu items with permissions
    it('computes menu items with permissions', () => {
        updateAbility(['view vendors', 'update vendors', 'delete vendors']);
        wrapper.vm.selectedItem = {
            status: 'active',
            name: 'Test Vendor'
        };
        const items = wrapper.vm.menuItems;
        expect(Array.isArray(items)).toBe(true);

        // Find items by their labels
        const editItem = items.find((item) => item.label === 'Edit');
        const statusItem = items.find((item) => item.label === 'Make Inactive');
        const deleteItem = items.find((item) => item.label === 'Delete');
        const auditItem = items.find((item) => item.label === 'Audit Log');

        // Verify all expected items exist
        expect(editItem).toBeTruthy();
        expect(statusItem).toBeTruthy();
        expect(deleteItem).toBeTruthy();
        expect(auditItem).toBeTruthy();
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
        wrapper.vm.formData.name = 'Test Vendor';
        wrapper.vm.formData.status = false;
        wrapper.vm.resetForm();
        expect(wrapper.vm.formData.name).toBe('');
        expect(wrapper.vm.formData.status).toBe(true);
    });

    // Test for item editing
    it('calls editItem and populates formData and opens dialog in edit mode', () => {
        wrapper.vm.selectedItem = {
            name: 'Test Vendor',
            status: 'active'
        };
        wrapper.vm.editItem();
        expect(wrapper.vm.formData.name).toBe('Test Vendor');
        expect(wrapper.vm.formData.status).toBe(true);
        expect(wrapper.vm.isEditMode).toBe(true);
    });

    // Tests for dialog operations
    it('calls showStatusUpdateDialog and sets statusUpdateDialog to true', () => {
        wrapper.vm.statusUpdateDialog = false;
        wrapper.vm.showStatusUpdateDialog();
        expect(wrapper.vm.statusUpdateDialog).toBe(true);
    });

    it('calls showAuditTableDialog and sets statusAuditTableDialog to true', () => {
        wrapper.vm.statusAuditTableDialog = false;
        wrapper.vm.showAuditTableDialog();
        expect(wrapper.vm.statusAuditTableDialog).toBe(true);
    });

    it('calls showDeleteDialog and sets deleteDialog to true', () => {
        wrapper.vm.deleteDialog = false;
        wrapper.vm.showDeleteDialog();
        expect(wrapper.vm.deleteDialog).toBe(true);
    });

    // Tests for API operations
    it('calls updateStatus and updates the status of a vendor', async () => {
        wrapper.vm.selectedItem = {
            id: '123',
            status: 'active'
        };
        await wrapper.vm.updateStatus();
        expect(VendorService.updateStatus).toHaveBeenCalledWith('123', {
            status: 'inactive'
        });
    });

    it('calls save and creates a new vendor', async () => {
        wrapper.vm.isEditMode = false;
        wrapper.vm.formData = {
            name: 'Test Vendor',
            status: true
        };
        await wrapper.vm.save();
        expect(VendorService.create).toHaveBeenCalledWith({
            name: 'Test Vendor',
            status: 'active'
        });
    });

    it('calls save and updates an existing vendor', async () => {
        wrapper.vm.isEditMode = true;
        wrapper.vm.selectedItem = {
            id: '123'
        };
        wrapper.vm.formData = {
            name: 'Test Vendor Updated',
            status: true
        };
        await wrapper.vm.save();
        expect(VendorService.update).toHaveBeenCalledWith('123', {
            name: 'Test Vendor Updated',
            status: 'active'
        });
    });

    it('calls deleteItem and deletes a vendor', async () => {
        wrapper.vm.selectedItem = {
            id: '123'
        };
        await wrapper.vm.deleteItem();
        expect(VendorService.deleteItem).toHaveBeenCalledWith('123');
    });
});
