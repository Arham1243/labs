import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/PaymentMethodsTable.vue';
import {
    searchPaymentMethodsMock,
    createPaymentMethodMock,
    updatePaymentMethodMock,
    updatePaymentMethodStatusMock,
    deletePaymentMethodMock
} from '@/modules/administration/tests/mocks/PaymentMethods.service.mocks';
import { getAppsByCategoryMock } from '@/../tests/mocks/Common.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { PaymentMethodsService } from '@/modules/administration/services';

describe('PaymentMethodsTable', () => {
    beforeEach(() => {
        searchPaymentMethodsMock();
        getAppsByCategoryMock();
        vi.clearAllMocks();
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['create payment methods']);
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('search-input').exists()).toBe(true);
        expect(
            wrapper.findByTestId('search-input').attributes('placeholder')
        ).toBe('Search');
        expect(wrapper.findByTestId('create-new-button').text()).toBe(
            'New Payment Method'
        );

        expect(
            wrapper.findByTestId('table-header-payment-provider').exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('table-header-payment-provider').text()
        ).toBe('Payment Provider');

        expect(wrapper.findByTestId('table-header-payment-type').exists()).toBe(
            true
        );
        expect(wrapper.findByTestId('table-header-payment-type').text()).toBe(
            'Payment Type'
        );

        expect(
            wrapper.findByTestId('table-header-enrollment-types').exists()
        ).toBe(true);
        expect(
            wrapper.findByTestId('table-header-enrollment-types').text()
        ).toBe('Enrollment Type');

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

    it('hides create button without permission', async () => {
        updateAbility([]);
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('create-new-button').exists()).toBe(false);
    });

    it('displays empty state when no data is available', async () => {
        const wrapper = mount(TableView);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No payment methods found.'
        );
    });

    it('renders new payment method in the table after adding to state', async () => {
        updateAbility(['update payment methods']);
        const wrapper = mount(TableView);

        const newItem = {
            id: '1743178806659944558',
            payment_provider_id: 'paypal',
            payment_type: 'COD',
            enrollment_types: ['file transfer'],
            system: 1,
            status: 'inactive',
            updated_at: '2025-04-03T00:55:34.000000Z'
        };

        wrapper.vm.paymentMethods.push(newItem);

        await wrapper.vm.$nextTick();

        expect(
            wrapper.findByTestId('payment-provider-data-table-0').text()
        ).toBe(newItem.payment_provider_id);
        expect(wrapper.findByTestId('payment-type-data-table-0').text()).toBe(
            newItem.payment_type
        );
        expect(
            wrapper.findByTestId('payment-enrollment-data-table-0').text()
        ).toBe(newItem.enrollment_types[0]);
        expect(wrapper.findByTestId('status-tag-0').text()).toBe(
            newItem.status.toUpperCase()
        );
        expect(wrapper.findByTestId('last-updated-data-table-0').text()).toBe(
            wrapper.vm.helpers.formatDate(newItem.updated_at)
        );
        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(true);
        expect(wrapper.findByTestId('system-data-table-0').exists()).toBe(true);
    });

    it('hides actions button without update permission', async () => {
        updateAbility([]);
        const wrapper = mount(TableView);

        const newItem = {
            payment_provider_id: 'paypal',
            payment_type: 'COD',
            enrollment_types: ['file transfer'],
            status: 'active',
            updated_at: '2025-04-03T00:55:34.000000Z'
        };

        wrapper.vm.paymentMethods.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });

    it('updates the search input when searchText changes', async () => {
        const wrapper = mount(TableView);
        wrapper.vm.searchText = 'stripe';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.element.value).toBe('stripe');
        expect(wrapper.vm.searchText).toBe('stripe');
    });

    it('opens the edit dialog when editItem is called', async () => {
        updateAbility(['update payment methods']);
        updatePaymentMethodMock();
        const wrapper = mount(TableView);

        // Mock paymentProviders to make the provider valid
        wrapper.vm.paymentProviders = [{ id: 'stripe' }];

        const paymentMethod = {
            id: '1',
            payment_provider_id: 'stripe',
            payment_type: 'credit_card',
            enrollment_types: ['file_transfer'],
            status: 'active'
        };

        wrapper.vm.selectedItem = paymentMethod;
        wrapper.vm.editItem();

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.isDialogVisible).toBe(true);
        expect(wrapper.vm.isEditMode).toBe(true);
        expect(wrapper.vm.formData.payment_provider_id).toBe('stripe');
        expect(wrapper.vm.formData.payment_type).toBe('credit_card');
        expect(wrapper.vm.formData.enrollment_types).toEqual(['file_transfer']);
        expect(wrapper.vm.formData.status).toBe(true);
    });

    it('shows the status update dialog when showStatusUpdateDialog is called', async () => {
        updateAbility(['update payment methods']);
        updatePaymentMethodStatusMock();
        const wrapper = mount(TableView);

        const paymentMethod = {
            id: '1',
            payment_provider_id: 'stripe',
            payment_type: 'credit_card',
            enrollment_types: ['file_transfer'],
            status: 'active'
        };

        wrapper.vm.selectedItem = paymentMethod;
        wrapper.vm.showStatusUpdateDialog();

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.statusUpdateDialog).toBe(true);
        expect(wrapper.vm.isItemActive).toBe(true);
    });

    it('updates the status when updateStatus is called', async () => {
        updateAbility(['update payment methods']);
        updatePaymentMethodStatusMock();
        const wrapper = mount(TableView);

        const paymentMethod = {
            id: '1',
            payment_provider_id: 'stripe',
            payment_type: 'credit_card',
            enrollment_types: ['file_transfer'],
            status: 'active'
        };

        wrapper.vm.selectedItem = paymentMethod;
        await wrapper.vm.updateStatus();

        expect(PaymentMethodsService.updateStatus).toHaveBeenCalledWith('1', {
            status: 'inactive'
        });
    });

    it('shows the delete dialog when showDeleteDialog is called', async () => {
        updateAbility(['delete payment methods']);
        deletePaymentMethodMock();
        const wrapper = mount(TableView);

        const paymentMethod = {
            id: '1',
            payment_provider_id: 'stripe',
            payment_type: 'credit_card',
            enrollment_types: ['file_transfer'],
            status: 'inactive'
        };

        wrapper.vm.selectedItem = paymentMethod;
        wrapper.vm.showDeleteDialog();

        await wrapper.vm.$nextTick();

        expect(wrapper.vm.deleteDialog).toBe(true);
    });

    it('deletes the payment method when deleteItem is called', async () => {
        updateAbility(['delete payment methods']);
        deletePaymentMethodMock();
        const wrapper = mount(TableView);

        const paymentMethod = {
            id: '1',
            payment_provider_id: 'stripe',
            payment_type: 'credit_card',
            enrollment_types: ['file_transfer'],
            status: 'inactive'
        };

        wrapper.vm.selectedItem = paymentMethod;
        await wrapper.vm.deleteItem();

        expect(PaymentMethodsService.deleteItem).toHaveBeenCalledWith('1');
    });

    it('shows actions menu when showActions is called', async () => {
        updateAbility(['update payment methods', 'delete payment methods']);
        const wrapper = mount(TableView);

        // Mock the menu reference
        wrapper.vm.menu = {
            toggle: vi.fn()
        };

        const paymentMethod = {
            id: '1',
            payment_provider_id: 'stripe',
            payment_type: 'credit_card',
            enrollment_types: ['file_transfer'],
            status: 'inactive'
        };

        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() };
        wrapper.vm.showActions(event, paymentMethod);

        expect(wrapper.vm.selectedItem).toEqual(paymentMethod);
        expect(wrapper.vm.menu.toggle).toHaveBeenCalledWith(event);
    });

    it('resets form when resetForm is called', async () => {
        const wrapper = mount(TableView);

        wrapper.vm.formData.payment_provider_id = 'stripe';
        wrapper.vm.formData.payment_type = 'credit_card';
        wrapper.vm.formData.enrollment_types = ['file_transfer'];
        wrapper.vm.formData.status = true;
        wrapper.vm.selectedItem = { id: '1' };

        wrapper.vm.resetForm();

        expect(wrapper.vm.formData.payment_provider_id).toBe('');
        expect(wrapper.vm.formData.payment_type).toBe('');
        expect(wrapper.vm.formData.enrollment_types).toBe('');
        expect(wrapper.vm.formData.status).toBe(true);
        expect(wrapper.vm.selectedItem).toEqual({});
    });

    it('closes dialog when closeDialog is called', async () => {
        const wrapper = mount(TableView);

        wrapper.vm.isDialogVisible = true;
        wrapper.vm.closeDialog();

        expect(wrapper.vm.isDialogVisible).toBe(false);
    });

    it('handles pagination when onPageChange is called', async () => {
        const wrapper = mount(TableView);

        // Set initial page to a known value
        wrapper.vm.pagination.page = 1;

        const event = { page: 2, rows: 10 };
        await wrapper.vm.onPageChange(event);

        // Check if the page was updated from the event
        expect(wrapper.vm.pagination.page).toBe(3);
        expect(wrapper.vm.pagination.limit).toBe(10);
    });

    it('handles sorting when onSortChange is called', async () => {
        const wrapper = mount(TableView);

        const event = { sortField: 'payment_provider_id', sortOrder: 1 };
        await wrapper.vm.onSortChange(event);

        // Check if the sort array has been updated correctly
        expect(wrapper.vm.sortFilters.sort.length).toBe(1);
        expect(wrapper.vm.sortFilters.sort[0].field).toBe(
            'payment_provider_id'
        );
        expect(wrapper.vm.sortFilters.sort[0].direction).toBe('asc');
    });

    it('creates a new payment method when save is called in add mode', async () => {
        updateAbility(['create payment methods']);
        createPaymentMethodMock();
        const wrapper = mount(TableView);

        wrapper.vm.isEditMode = false;
        wrapper.vm.formData = {
            payment_provider_id: 'stripe',
            payment_type: 'credit_card',
            enrollment_types: ['file_transfer'],
            status: true
        };

        await wrapper.vm.save();

        expect(PaymentMethodsService.create).toHaveBeenCalledWith({
            payment_provider_id: 'stripe',
            payment_type: 'credit_card',
            enrollment_types: ['file_transfer'],
            status: 'active'
        });
    });

    it('updates an existing payment method when save is called in edit mode', async () => {
        updateAbility(['update payment methods']);
        updatePaymentMethodMock();
        const wrapper = mount(TableView);

        wrapper.vm.isEditMode = true;
        wrapper.vm.selectedItem = { id: '1' };
        wrapper.vm.formData = {
            payment_provider_id: 'stripe',
            payment_type: 'credit_card',
            enrollment_types: ['file_transfer'],
            status: false
        };

        await wrapper.vm.save();

        expect(PaymentMethodsService.update).toHaveBeenCalledWith('1', {
            payment_provider_id: 'stripe',
            payment_type: 'credit_card',
            enrollment_types: ['file_transfer'],
            status: 'inactive'
        });
    });

    it('fetches payment methods when getItems is called', async () => {
        const wrapper = mount(TableView);

        await wrapper.vm.getItems();

        expect(wrapper.vm.loading).toBe(false);
        expect(PaymentMethodsService.search).toHaveBeenCalled();
    });

    it('opens dialog in add mode when openDialog is called with "add"', async () => {
        const wrapper = mount(TableView);

        wrapper.vm.openDialog('add');

        expect(wrapper.vm.isEditMode).toBe(false);
        expect(wrapper.vm.isDialogVisible).toBe(true);
    });

    it('computes correct dialog header based on mode', async () => {
        const wrapper = mount(TableView);

        wrapper.vm.isEditMode = false;
        expect(wrapper.vm.dialogHeader).toContain('New');

        wrapper.vm.isEditMode = true;
        expect(wrapper.vm.dialogHeader).toContain('Edit');
    });

    it('computes correct status dialog content based on item status', async () => {
        const wrapper = mount(TableView);

        wrapper.vm.selectedItem = {
            payment_provider_id: 'stripe',
            status: 'active'
        };
        expect(wrapper.vm.statusDialogContent).toContain('inactive');

        wrapper.vm.selectedItem = {
            payment_provider_id: 'stripe',
            status: 'inactive'
        };
        expect(wrapper.vm.statusDialogContent).toContain('active');
    });

    it('computes correct status dialog button class based on item status', async () => {
        const wrapper = mount(TableView);

        wrapper.vm.selectedItem = { status: 'active' };
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-danger');

        wrapper.vm.selectedItem = { status: 'inactive' };
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-success');
    });

    it('computes correct status dialog button text based on item status', async () => {
        const wrapper = mount(TableView);

        wrapper.vm.selectedItem = { status: 'active' };
        expect(wrapper.vm.statusDialogButtonText).toContain('Make Inactive');

        wrapper.vm.selectedItem = { status: 'inactive' };
        expect(wrapper.vm.statusDialogButtonText).toContain('Make Active');
    });

    it('computes correct delete confirm content based on selected item', async () => {
        const wrapper = mount(TableView);

        wrapper.vm.selectedItem = { payment_provider_id: 'stripe' };
        expect(wrapper.vm.deleteConfirmContent).toContain('stripe');
    });

    it('computes correct menu items based on permissions and item status', async () => {
        updateAbility(['update payment methods', 'delete payment methods']);
        const wrapper = mount(TableView);

        wrapper.vm.selectedItem = {
            id: '1',
            payment_provider_id: 'stripe',
            status: 'active',
            system: 0
        };

        expect(wrapper.vm.menuItems.length).toBe(3); // Edit, Make Inactive, Delete (disabled)
        expect(wrapper.vm.menuItems[0].label).toContain('Edit');
        expect(wrapper.vm.menuItems[1].label).toContain('Make Inactive');
        expect(wrapper.vm.menuItems[2].label).toContain('Delete');
        expect(wrapper.vm.menuItems[2].disabled).toBeTruthy();

        wrapper.vm.selectedItem.status = 'inactive';
        expect(wrapper.vm.menuItems[1].label).toContain('Make Active');
        // Check if the disabled property is falsy (0 or false)
        expect(Boolean(wrapper.vm.menuItems[2].disabled)).toBe(false);

        wrapper.vm.selectedItem.system = 1;
        expect(wrapper.vm.menuItems[1].disabled).toBeTruthy();
        expect(wrapper.vm.menuItems[2].disabled).toBeTruthy();
    });
});
