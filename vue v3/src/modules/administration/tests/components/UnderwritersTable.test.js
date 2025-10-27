import { beforeEach, describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/UnderwritersTable.vue';
import { searchUnderwritersMock } from '@/modules/administration/tests/mocks/Underwriter.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { nextTick } from 'vue';

describe('UnderwritersTable', () => {
    let wrapper;
    beforeEach(() => {
        searchUnderwritersMock();
        wrapper = mount(TableView);
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['create underwriters']);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(
            wrapper.findByTestId('search-input').attributes('placeholder')
        ).toBe('Search');
        expect(wrapper.findByTestId('create-new-button').text()).toBe(
            'New Underwriter'
        );

        expect(wrapper.findByTestId('table-header-name').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-name').text()).toBe('Name');

        expect(wrapper.findByTestId('table-header-code').exists()).toBe(true);
        expect(wrapper.findByTestId('table-header-code').text()).toBe('Code');

        expect(
            wrapper.findByTestId('table-header-benefits-count').exists()
        ).toBe(true);
        expect(wrapper.findByTestId('table-header-benefits-count').text()).toBe(
            'Benefit Groups'
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

        expect(wrapper.findByTestId('create-new-button').exists()).toBe(false);
    });

    it('displays empty state when no data is available', async () => {
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No underwriters found.'
        );
    });

    it('renders new underwriter in the table after adding to state', async () => {
        updateAbility(['update underwriters']);

        const newItem = {
            name: 'Test Underwriter',
            code: 'Test Code',
            benefits_count: 0,
            status: 'active',
            updated_at: '2025-03-25T15:51:26.000000Z'
        };

        wrapper.vm.underwriters.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('name-data-table-0').exists()).toBe(true);
        expect(wrapper.findByTestId('name-data-table-0').text()).toBe(
            newItem.name
        );

        expect(wrapper.findByTestId('code-data-table-0').exists()).toBe(true);
        expect(wrapper.findByTestId('code-data-table-0').text()).toBe(
            newItem.code
        );

        expect(
            wrapper.findByTestId('benefits-count-data-table-0').exists()
        ).toBe(true);
        expect(wrapper.findByTestId('benefits-count-data-table-0').text()).toBe(
            newItem.benefits_count.toString()
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
            name: 'Test Underwriter',
            code: 'Test Code',
            benefits_count: 0,
            status: 'active',
            updated_at: '2025-03-25T15:51:26.000000Z'
        };

        wrapper.vm.underwriters.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });
    it('updates the search input when searchText changes', async () => {
        wrapper.vm.searchText = 'Test Underwriter';
        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.element.value).toBe('Test Underwriter');

        expect(wrapper.vm.searchText).toBe('Test Underwriter');
    });

    it('computes status dialog texts and class for active status', () => {
        wrapper.vm.selectedItem = { status: 'active', name: 'test' };
        expect(wrapper.vm.statusDialogHeader).toContain(
            'Make Underwriter Inactive'
        );
        expect(wrapper.vm.statusDialogContent).toContain('test');
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-danger');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Inactive');
    });

    it('computes status dialog texts and class for inactive status', () => {
        wrapper.vm.selectedItem = { status: 'inactive', name: 'test' };
        expect(wrapper.vm.statusDialogHeader).toContain(
            'Make Underwriter Active'
        );
        expect(wrapper.vm.statusDialogContent).toContain('test');
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-success');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Active');
    });

    it('computes isItemActive property based on (active/inactive) state', () => {
        wrapper.vm.selectedItem = { status: 'active', name: 'test' };
        expect(wrapper.vm.isItemActive).toBe(true);

        wrapper.vm.selectedItem = { status: 'inactive', name: 'test' };
        expect(wrapper.vm.isItemActive).toBe(false);
    });

    it('computes dialog header based on (create/edit) mode', () => {
        wrapper.vm.isEditMode = false;
        expect(wrapper.vm.dialogHeader).toContain('New Underwriter');

        wrapper.vm.isEditMode = true;
        expect(wrapper.vm.dialogHeader).toContain('Edit Underwriter');
    });

    it('computes menu items with permissions', () => {
        updateAbility(['view underwriters', 'update underwriters']);
        wrapper.vm.selectedItem = { status: 'active', name: 'test' };
        const items = wrapper.vm.menuItems;
        expect(Array.isArray(items)).toBe(true);
        expect(items[0].label).toBe('Edit');
        expect(items[1].label).toBe('Make Inactive');
        expect(items[2].label).toBe('Audit Log');
    });

    it('watches formData.code and converts it to uppercase', async () => {
        wrapper.vm.formData.code = 'test';
        await nextTick();
        expect(wrapper.vm.formData.code).toBe('TEST');
    });

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
        wrapper.vm.formData.code = 'XYZ';
        wrapper.vm.formData.name = 'Something';
        wrapper.vm.formData.status = false;
        wrapper.vm.resetForm();
        expect(wrapper.vm.formData.code).toBe('');
        expect(wrapper.vm.formData.name).toBe('');
        expect(wrapper.vm.formData.status).toBe(true);
    });

    it('calls editItem and populates formData and opens dialog in edit mode', () => {
        wrapper.vm.selectedItem = {
            code: '123',
            name: 'Test Name',
            status: 'active'
        };
        wrapper.vm.editItem();
        expect(wrapper.vm.formData.code).toBe('123');
        expect(wrapper.vm.formData.name).toBe('Test Name');
        expect(wrapper.vm.formData.status).toBe(true);
        expect(wrapper.vm.isEditMode).toBe(true);
    });

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
});
