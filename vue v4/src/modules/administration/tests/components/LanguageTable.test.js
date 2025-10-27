import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/LanguageTable.vue';
import { searchMock } from '@/modules/administration/tests/mocks/PreferredLanguage.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { nextTick } from 'vue';
import { PreferredLanguageService } from '@/modules/administration/services';

describe('LanguageTable', () => {
    let wrapper;
    beforeEach(() => {
        searchMock();
        vi.spyOn(PreferredLanguageService, 'create').mockResolvedValue({});
        vi.spyOn(PreferredLanguageService, 'update').mockResolvedValue({});
        vi.spyOn(PreferredLanguageService, 'updateStatus').mockResolvedValue(
            {}
        );
        vi.spyOn(PreferredLanguageService, 'deleteItem').mockResolvedValue({});
        wrapper = mount(TableView, {
            global: {
                stubs: {
                    Confirmation : true,
                    Dialog : true
                }
            }
        });
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['create languages']);

        await wrapper.vm.$nextTick();

      const searchWrapper = wrapper.findByTestId('search-input');
expect(searchWrapper.find('input').exists()).toBe(true);
expect(searchWrapper.find('input').attributes('placeholder')).toBe(
    'Search'
);
        expect(wrapper.findByTestId('add-new-language-button').text()).toBe(
            'New Language'
        );

        expect(wrapper.findByTestId('table-header-language').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('table-header-language').text()).toBe(
            'Language'
        );

        expect(wrapper.findByTestId('table-header-code').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-code').text()).toBe('Code');

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

        expect(wrapper.findByTestId('add-new-language-button').exists()).toBe(
            false
        );
    });

    it('displays empty state when no data is available', async () => {
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No languages found.'
        );
    });

    it('renders new language in the table after adding to state', async () => {
        updateAbility(['update languages']);

        const newItem = {
            code: 'EN',
            name: 'English',
            systemic: 1,
            default: 1,
            status: 'active',
            updated_at: '2025-03-25T15:51:26.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('language-data-table-0').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('language-data-table-0').text()).toContain(
            newItem.name
        );

        expect(wrapper.findByTestId('code-data-table-0').exists()).toBe(true);
        expect(wrapper.findByTestId('code-data-table-0').text()).toBe(
            newItem.code
        );

        expect(wrapper.findByTestId('status-tag-0').exists()).toBe(true);
        expect(wrapper.findByTestId('status-tag-0').text()).toBe('ACTIVE');

        expect(wrapper.findByTestId('last-updated-data-table-0').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('last-updated-data-table-0').text()).toBe(
            wrapper.vm.helpers.formatDate(newItem.updated_at)
        );
        expect(wrapper.findByTestId('systemic-data-table-0').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('default-tag-0').exists()).toBe(true);

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(true);
    });

    it('hides actions button without update permission', async () => {
        updateAbility([]);

        const newItem = {
            code: 'EN',
            name: 'English',
            status: 'active',
            updated_at: '2025-03-25T15:51:26.000000Z'
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });

    it('updates the search input when searchText changes', async () => {
        wrapper.vm.searchText = 'Test language';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.find('input').element.value).toBe('Test language');

        expect(wrapper.vm.searchText).toBe('Test language');
    });

    // New tests for status dialog text and class computation
    it('computes status dialog texts and class for active status', () => {
        wrapper.vm.selectedItem = { status: 'active', name: 'English' };
        expect(wrapper.vm.statusDialogHeader).toContain(
            'Make Language Inactive'
        );
        expect(wrapper.vm.statusDialogContent).toContain('English');
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-danger');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Inactive');
    });

    it('computes status dialog texts and class for inactive status', () => {
        wrapper.vm.selectedItem = { status: 'inactive', name: 'English' };
        expect(wrapper.vm.statusDialogHeader).toContain('Make Language Active');
        expect(wrapper.vm.statusDialogContent).toContain('English');
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-success');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Active');
    });

    // Test for isItemActive property
    it('computes isItemActive property based on (active/inactive) state', () => {
        wrapper.vm.selectedItem = { status: 'active', name: 'English' };
        expect(wrapper.vm.isItemActive).toBe(true);

        wrapper.vm.selectedItem = { status: 'inactive', name: 'English' };
        expect(wrapper.vm.isItemActive).toBe(false);
    });

    // Test for isDefaultLang property
    it('computes isDefaultLang property based on default flag', () => {
        wrapper.vm.selectedItem = { default: true, name: 'English' };
        expect(wrapper.vm.isDefaultLang).toBe(true);

        wrapper.vm.selectedItem = { default: false, name: 'English' };
        expect(wrapper.vm.isDefaultLang).toBe(false);
    });

    // Test for dialog header computation
    it('computes dialog header based on (create/edit) mode', () => {
        wrapper.vm.isEditMode = false;
        expect(wrapper.vm.dialogHeader).toContain('New Language');

        wrapper.vm.isEditMode = true;
        expect(wrapper.vm.dialogHeader).toContain('Edit Language');
    });

    // Test for menu items with permissions
    it('computes menu items with permissions', () => {
        updateAbility([
            'view languages',
            'update languages',
            'delete languages'
        ]);
        wrapper.vm.selectedItem = {
            status: 'active',
            name: 'English',
            systemic: false,
            default: false
        };
        const items = wrapper.vm.menuItems;
        expect(Array.isArray(items)).toBe(true);

        // Find items by their labels
        const editItem = items.find((item) => item.label === 'Edit');
        const deleteItem = items.find((item) => item.label === 'Delete');
        const statusItem = items.find((item) => item.label === 'Make Inactive');
        const defaultItem = items.find((item) => item.label === 'Make Default');
        const auditItem = items.find((item) => item.label === 'Audit Log');

        // Verify all expected items exist
        expect(editItem).toBeTruthy();
        expect(deleteItem).toBeTruthy();
        expect(statusItem).toBeTruthy();
        expect(defaultItem).toBeTruthy();
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
        wrapper.vm.formData.code = 'EN';
        wrapper.vm.formData.name = 'English';
        wrapper.vm.formData.status = false;
        wrapper.vm.formData.default = true;
        wrapper.vm.resetForm();
        expect(wrapper.vm.formData.code).toBe('');
        expect(wrapper.vm.formData.name).toBe('');
        expect(wrapper.vm.formData.status).toBe(true);
        expect(wrapper.vm.formData.default).toBe(false);
    });

    // Test for item editing
    it('calls editItem and populates formData and opens dialog in edit mode', () => {
        wrapper.vm.selectedItem = {
            code: 'EN',
            name: 'English',
            status: 'active',
            default: true
        };
        wrapper.vm.editItem(wrapper.vm.selectedItem);
        expect(wrapper.vm.formData.code).toBe('EN');
        expect(wrapper.vm.formData.name).toBe('English');
        expect(wrapper.vm.formData.status).toBe(true);
        expect(wrapper.vm.formData.default).toBe(true);
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

    it('calls showDefaultDialog and sets defaultDialog to true', () => {
        wrapper.vm.defaultDialog = false;
        wrapper.vm.showDefaultDialog();
        expect(wrapper.vm.defaultDialog).toBe(true);
    });

    // Tests for API operations
    it('calls updateStatus and updates the status of a language', async () => {
        wrapper.vm.selectedItem = {
            id: 'EN',
            status: 'active'
        };
        await wrapper.vm.updateStatus();
        expect(PreferredLanguageService.updateStatus).toHaveBeenCalledWith(
            'EN',
            {
                status: 'inactive'
            }
        );
    });

    it('calls save and creates a new language', async () => {
        wrapper.vm.isEditMode = false;
        wrapper.vm.formData = {
            code: 'EN',
            name: 'English',
            status: true,
            default: false
        };
        await wrapper.vm.save();
        expect(PreferredLanguageService.create).toHaveBeenCalledWith({
            code: 'EN',
            name: 'English',
            status: 'active',
            default: false
        });
    });

    it('calls save and updates an existing language', async () => {
        wrapper.vm.isEditMode = true;
        wrapper.vm.selectedItem = {
            id: 'EN'
        };
        wrapper.vm.formData = {
            code: 'EN',
            name: 'English',
            status: true,
            default: true
        };
        await wrapper.vm.save();
        expect(PreferredLanguageService.update).toHaveBeenCalledWith('EN', {
            code: 'EN',
            name: 'English',
            status: 'active',
            default: true
        });
    });

    it('calls deleteItem and deletes a language', async () => {
        wrapper.vm.selectedItem = {
            id: 'EN'
        };
        await wrapper.vm.deleteItem();
        expect(PreferredLanguageService.deleteItem).toHaveBeenCalledWith('EN');
    });

    it('calls makeDefault and updates a language to be default', async () => {
        wrapper.vm.selectedItem = {
            id: 'EN',
            name: 'English',
            code: 'EN',
            status: 'active'
        };
        await wrapper.vm.makeDefault();
        expect(PreferredLanguageService.update).toHaveBeenCalledWith('EN', {
            name: 'English',
            code: 'EN',
            default: true,
            status: 'active'
        });
    });
});
