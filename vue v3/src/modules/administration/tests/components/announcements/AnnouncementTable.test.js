import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TableView from '@/modules/administration/components/announcements/AnnouncementTable.vue';
import { searchAnnouncementMock } from '@/modules/administration/tests/mocks/Announcement.service.mocks';
import { updateAbility } from '@/plugins/ability';
import { AnnouncementService } from '@/modules/administration/services';

describe('AnnouncementTable', () => {
    let wrapper;
    beforeEach(() => {
        searchAnnouncementMock();
        vi.spyOn(AnnouncementService, 'create').mockResolvedValue({});
        vi.spyOn(AnnouncementService, 'update').mockResolvedValue({});
        vi.spyOn(AnnouncementService, 'updateStatus').mockResolvedValue({});
        vi.spyOn(AnnouncementService, 'deleteItem').mockResolvedValue({});
        wrapper = mount(TableView);
    });

    it('renders the table with correct headers and elements', async () => {
        updateAbility(['create announcements']);
        await wrapper.vm.$nextTick();

        const search = wrapper.findByTestId('search-input');
        expect(search.exists()).toBe(true);

        const addBtn = wrapper.findByTestId('add-new-announcement-button');
        expect(addBtn.exists()).toBe(true);
        expect(addBtn.text()).toBe('New Announcement');

        const startHeader = wrapper.findByTestId(
            'table-header-start-date-time'
        );
        expect(startHeader.exists()).toBe(true);
        expect(startHeader.text()).toBe('Start Date/Time');

        const endHeader = wrapper.findByTestId('table-header-end-date-time');
        expect(endHeader.exists()).toBe(true);
        expect(endHeader.text()).toBe('End Date/Time');

        const portalHeader = wrapper.findByTestId('table-header-portal');
        expect(portalHeader.exists()).toBe(true);
        expect(portalHeader.text()).toBe('Portal');

        const messageHeader = wrapper.findByTestId('table-header-message');
        expect(messageHeader.exists()).toBe(true);
        expect(messageHeader.text()).toBe('Message');

        const typeHeader = wrapper.findByTestId('table-header-type');
        expect(typeHeader.exists()).toBe(true);
        expect(typeHeader.text()).toBe('Type');

        const statusHeader = wrapper.findByTestId('table-header-status');
        expect(statusHeader.exists()).toBe(true);
        expect(statusHeader.text()).toBe('Status');
    });

    it('hides create button without create permission', async () => {
        updateAbility([]);

        await wrapper.vm.$nextTick();

        expect(
            wrapper.findByTestId('add-new-announcement-button').exists()
        ).toBe(false);
    });

    it('displays empty state when no data is available', async () => {
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('empty-data-table').exists()).toBe(true);
        expect(wrapper.findByTestId('empty-data-table').text()).toBe(
            'No announcement found.'
        );
    });

    it('renders new announcement in the table after adding to state', async () => {
        updateAbility(['update announcements']);

        const newItem = {
            id: '789395253214175232',
            start_at: '2025-07-29 10:45:13',
            end_at: '2025-07-29 12:40:59',
            portals: ['insured', 'service_provider', 'client'],
            type: 'critical',
            message: '<h1>title</h1><p>short msg</p>',
            status: 'inactive',
            is_expired: false
        };

        wrapper.vm.items.push(newItem);
        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('start-date-time-0').text()).toContain(
            wrapper.vm.helpers.formatDate(
                newItem.start_at,
                'DD-MMM-YYYY hh:mm:ss A'
            )
        );

        expect(wrapper.findByTestId('end-date-time-0').text()).toContain(
            wrapper.vm.helpers.formatDate(
                newItem.end_at,
                'DD-MMM-YYYY hh:mm:ss A'
            )
        );

        const expectedGroups = wrapper.vm.chunkedPortals(newItem.portals);
        const groupTexts = expectedGroups.map((g) =>
            wrapper.vm.humanizeList(g)
        );
        const portalText = wrapper.findByTestId('portal-0').text();

        groupTexts.forEach((text) => {
            expect(portalText).toContain(text);
        });

        expect(wrapper.findByTestId('message-0').html()).toContain('title');
        expect(wrapper.findByTestId('type-0').text()).toBe('Critical');
        expect(wrapper.findByTestId('status-tag-0').exists()).toBe(true);
        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(true);
    });
    it('hides actions button without update permission', async () => {
        updateAbility([]);

        const newItem = {
            id: '789395253214175232',
            start_at: '2025-07-29 10:45:13',
            end_at: '2025-07-29 12:40:59',
            portals: ['insured', 'service_provider', 'client'],
            type: 'critical',
            message: '<h1>title</h1><p>short msg</p>',
            status: 'inactive',
            is_expired: false
        };

        wrapper.vm.items.push(newItem);

        await wrapper.vm.$nextTick();

        expect(wrapper.findByTestId('actions-button-0').exists()).toBe(false);
    });

    it('updates the search input when searchText changes', async () => {
        wrapper.vm.searchText = 'Test announcement';

        await wrapper.vm.$nextTick();

        const searchInput = wrapper.findByTestId('search-input');
        expect(searchInput.element.value).toBe('Test announcement');

        expect(wrapper.vm.searchText).toBe('Test announcement');
    });

    it('computes status dialog texts and class for active status', () => {
        wrapper.vm.selectedItem = { status: 'active', id: '1' };
        expect(wrapper.vm.statusDialogHeader).toContain(
            'Make Announcement Inactive'
        );
        expect(wrapper.vm.statusDialogContent).toContain(
            'Are you sure you want to make this announcement active?'
        );
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-danger');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Inactive');
    });

    it('computes status dialog texts and class for inactive status', () => {
        wrapper.vm.selectedItem = { status: 'inactive', id: '1' };
        expect(wrapper.vm.statusDialogHeader).toContain(
            'Make Announcement Active'
        );
        expect(wrapper.vm.statusDialogContent).toContain(
            'Are you sure you want to make this announcement inactive?'
        );
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-success');
        expect(wrapper.vm.statusDialogButtonText).toBe('Make Active');
    });

    it('computes isItemActive property based on (active/inactive) state', () => {
        wrapper.vm.selectedItem = { status: 'active', id: '1' };
        expect(wrapper.vm.isItemActive).toBe(true);

        wrapper.vm.selectedItem = { status: 'inactive', id: '1' };
        expect(wrapper.vm.isItemActive).toBe(false);
    });

    it('computes menu items with permissions', () => {
        updateAbility([
            'view announcements',
            'update announcements',
            'delete announcements'
        ]);
        wrapper.vm.selectedItem = { status: 'active', id: '1' };
        const items = wrapper.vm.menuItems;
        expect(Array.isArray(items)).toBe(true);
        expect(items[0].label).toBe('Edit');
        expect(items[1].label).toBe('Make Inactive');
        expect(items[2].label).toBe('Delete');
    });

    it('calls showDeleteDialog and sets deleteDialog to true', () => {
        wrapper.vm.deleteDialog = false;
        wrapper.vm.showDeleteDialog();
        expect(wrapper.vm.deleteDialog).toBe(true);
    });

    it('calls updateStatus and updates the status of a announcement', async () => {
        wrapper.vm.selectedItem = {
            id: '1',
            status: 'active'
        };
        await wrapper.vm.updateStatus();
        expect(AnnouncementService.updateStatus).toHaveBeenCalledWith('1', {
            status: 'inactive'
        });
    });
});
