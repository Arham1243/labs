import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/CurrencyTable.vue';
import { searchMock } from '@/modules/administration/tests/mocks/Currency.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { nextTick } from 'vue';
import { CurrencyService } from '@/modules/administration/services';

describe('CurrencyTable', () => {
    let wrapper;
    beforeEach(() => {
        searchMock();
        vi.spyOn(CurrencyService, 'create').mockResolvedValue({});
        vi.spyOn(CurrencyService, 'update').mockResolvedValue({});
        vi.spyOn(CurrencyService, 'updateStatus').mockResolvedValue({});
        vi.spyOn(CurrencyService, 'deleteItem').mockResolvedValue({});
        wrapper = mount(TableView);
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['create currencies']);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(
            wrapper.findByTestId('search-input').attributes('placeholder')
        ).toBe('Search');
        expect(wrapper.findByTestId('add-new-currency-button').text()).toBe(
            'New Currency'
        );

        expect(wrapper.findByTestId('table-header-code').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-code').text()).toBe('Code');

        expect(wrapper.findByTestId('table-header-description').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('table-header-description').text()).toBe(
            'Description'
        );

        expect(wrapper.findByTestId('table-header-symbol').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-symbol').text()).toBe(
            'Symbol'
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

        expect(wrapper.findByTestId('add-new-currency-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No currencies found.'
        );
    });

    it('renders new currency in the table after adding to state', async () => {
        updateAbility(['update currencies']);

        const newItem = {
            id: 'CVS',
            name: 'Test Description',
            symbol: '$',
            status: 'active',
            updated_at: '2025-03-25T15:51:26.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').exists()).toBe(true);
        expect(wrapper.findByTestId('name-data-table-0').text()).toBe(
            newItem.name
        );

        expect(wrapper.findByTestId('code-data-table-0').exists()).toBe(true);
        expect(wrapper.findByTestId('code-data-table-0').text()).toBe(
            newItem.id
        );

        expect(wrapper.findByTestId('symbol-data-table-0').exists()).toBe(true);
        expect(wrapper.findByTestId('symbol-data-table-0').text()).toBe(
            newItem.symbol.toString()
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

    it('hides actions button without update permission', async () => {
        updateAbility([]);

        const newItem = {
            id: 'CVS',
            name: 'Test Description',
            symbol: '$',
            status: 'active',
            updated_at: '2025-03-25T15:51:26.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });
    it('updates the search input when searchText changes', async () => {
        wrapper.vm.searchText = 'Test currency';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.element.value).toBe('Test currency');

        expect(wrapper.vm.searchText).toBe('Test currency');
    });

    // New tests for status dialog text and class computation
    it('computes status dialog texts and class for active status', () => {
        wrapper.vm.selectedItem = { status: 'active', id: 'USD' };
        expect(wrapper.vm.statusDialogHeader).toContain(
            'Make Currency Inactive'
        );
        expect(wrapper.vm.statusDialogContent).toContain('USD');
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-danger');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Inactive');
    });

    it('computes status dialog texts and class for inactive status', () => {
        wrapper.vm.selectedItem = { status: 'inactive', id: 'USD' };
        expect(wrapper.vm.statusDialogHeader).toContain('Make Currency Active');
        expect(wrapper.vm.statusDialogContent).toContain('USD');
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-success');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Active');
    });

    // Test for isItemActive property
    it('computes isItemActive property based on (active/inactive) state', () => {
        wrapper.vm.selectedItem = { status: 'active', id: 'USD' };
        expect(wrapper.vm.isItemActive).toBe(true);

        wrapper.vm.selectedItem = { status: 'inactive', id: 'USD' };
        expect(wrapper.vm.isItemActive).toBe(false);
    });

    // Test for dialog header computation
    it('computes dialog header based on (create/edit) mode', () => {
        wrapper.vm.isEditMode = false;
        expect(wrapper.vm.dialogHeader).toContain('New Currency');

        wrapper.vm.isEditMode = true;
        expect(wrapper.vm.dialogHeader).toContain('Edit Currency');
    });

    // Test for menu items with permissions
    it('computes menu items with permissions', () => {
        updateAbility(['view currencies', 'update currencies']);
        wrapper.vm.selectedItem = { status: 'active', id: 'USD' };
        const items = wrapper.vm.menuItems;
        expect(Array.isArray(items)).toBe(true);
        expect(items[0].label).toBe('Edit');
        expect(items[1].label).toBe('Make Inactive');
        expect(items[2].label).toBe('Audit Log');
    });

    // Test for form data handling
    it('watches formData.id and converts it to uppercase', async () => {
        wrapper.vm.formData.id = 'usd';
        await nextTick();
        expect(wrapper.vm.formData.id).toBe('USD');
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
        wrapper.vm.formData.id = 'USD';
        wrapper.vm.formData.name = 'US Dollar';
        wrapper.vm.formData.symbol = '$';
        wrapper.vm.resetForm();
        expect(wrapper.vm.formData.id).toBe('');
        expect(wrapper.vm.formData.name).toBe('');
        expect(wrapper.vm.formData.symbol).toBe('');
    });

    // Test for item editing
    it('calls editItem and populates formData and opens dialog in edit mode', () => {
        wrapper.vm.selectedItem = {
            id: 'USD',
            name: 'US Dollar',
            symbol: '$',
            status: 'active'
        };
        wrapper.vm.editItem();
        expect(wrapper.vm.formData.id).toBe('USD');
        expect(wrapper.vm.formData.name).toBe('US Dollar');
        expect(wrapper.vm.formData.symbol).toBe('$');
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
    it('calls updateStatus and updates the status of a currency', async () => {
        wrapper.vm.selectedItem = {
            id: 'USD',
            status: 'active'
        };
        await wrapper.vm.updateStatus();
        expect(CurrencyService.updateStatus).toHaveBeenCalledWith('USD', {
            status: 'inactive'
        });
    });

    it('calls save and creates a new currency', async () => {
        wrapper.vm.isEditMode = false;
        wrapper.vm.formData = {
            id: 'USD',
            name: 'US Dollar',
            symbol: '$',
            status: true
        };
        await wrapper.vm.save();
        expect(CurrencyService.create).toHaveBeenCalledWith({
            id: 'USD',
            name: 'US Dollar',
            symbol: '$',
            status: 'active'
        });
    });

    it('calls save and updates an existing currency', async () => {
        wrapper.vm.isEditMode = true;
        wrapper.vm.selectedItem = {
            id: 'USD'
        };
        wrapper.vm.formData = {
            id: 'USD',
            name: 'US Dollar',
            symbol: '$',
            status: true
        };
        await wrapper.vm.save();
        expect(CurrencyService.update).toHaveBeenCalledWith('USD', {
            id: 'USD',
            name: 'US Dollar',
            symbol: '$',
            status: 'active'
        });
    });

    it('calls deleteItem and deletes a currency', async () => {
        wrapper.vm.selectedItem = {
            id: 'USD'
        };
        await wrapper.vm.deleteItem();
        expect(CurrencyService.deleteItem).toHaveBeenCalledWith('USD');
    });
});
