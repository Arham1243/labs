import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BenefitGroupsTable from '@/modules/plans/components/benefit-groups/tables/BenefitGroupsTable.vue';
import { nextTick } from 'vue';

// Mock the BenefitStore
const mockBenefitGroups = [
    {
        id: '1',
        name: { en: 'Benefit Group 1' },
        coverage: 75,
        max_amount: 500,
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        status: 'active'
    },
    {
        id: '2',
        name: { en: 'Benefit Group 2' },
        coverage: 80,
        max_amount: 1000,
        effective_date: '2023-02-01',
        end_date: null,
        status: 'inactive'
    }
];

const mockSearchBenefitGroups = vi.fn().mockResolvedValue({
    data: mockBenefitGroups,
    meta: { total: 2 }
});

const mockUpdateBenefitGroupStatus = vi.fn().mockResolvedValue({});
const mockDeleteBenefitGroup = vi.fn().mockResolvedValue({});

vi.mock('@/modules/plans/stores/Benefit', () => ({
    useBenefitStore: vi.fn(() => ({
        searchBenefitGroups: mockSearchBenefitGroups,
        updateBenefitGroupStatus: mockUpdateBenefitGroupStatus,
        deleteBenefitGroup: mockDeleteBenefitGroup
    }))
}));

// Mock the helpers
vi.mock('@/composables', () => ({
    useHelpers: vi.fn(() => ({
        getLocaleValue: vi.fn((value) => value?.en || value),
        formatDate: vi.fn((date) => date),
        moneyFormat: vi.fn((amount) => `$${amount}`),
        filterByPermission: vi.fn((items) => items)
    }))
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key) => key,
        locale: { value: 'en' }
    }))
}));

// Mock vue-router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush
    }))
}));

describe('BenefitGroupsTable - Rendering Tests', () => {
    let wrapper;

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(BenefitGroupsTable, {
            global: {
                stubs: {
                    BaseTable: {
                        template: `
                            <div data-testid="benefit-groups-table">
                                <slot name="header"></slot>
                                <slot v-for="(item, index) in value" :data="item" :index="index" />
                                <slot name="empty" v-if="!value || value.length === 0"></slot>
                            </div>
                        `,
                        props: [
                            'value',
                            'loading',
                            'page',
                            'rows',
                            'totalRecords'
                        ],
                        emits: ['row-click', 'page', 'sort']
                    },
                    Search: {
                        template:
                            '<input data-testid="input-search" v-model="modelValue" @input="$emit(\'search\')" />',
                        props: ['modelValue'],
                        emits: ['search', 'update:modelValue']
                    },
                    Column: {
                        template:
                            '<div><slot name="header"></slot><slot name="body" :data="data" :index="index"></slot></div>',
                        props: ['field', 'header', 'sortable'],
                        data() {
                            return {
                                data: mockBenefitGroups[0],
                                index: 0
                            };
                        }
                    },
                    Label: {
                        template: '<span><slot /></span>',
                        props: ['testId']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')"><slot /></button>',
                        props: [
                            'label',
                            'icon',
                            'iconPos',
                            'size',
                            'class',
                            'dataTestid'
                        ],
                        emits: ['click']
                    },
                    Menu: {
                        template:
                            '<div data-testid="actions-menu"><slot /></div>',
                        props: ['model', 'popup'],
                        methods: {
                            toggle: vi.fn()
                        }
                    },
                    StatusTag: {
                        template:
                            '<span :data-testid="dataTestid">{{ status }}</span>',
                        props: ['status', 'dataTestid']
                    },
                    Confirmation: {
                        template:
                            '<div v-if="modelValue" data-testid="confirmation-dialog"><button data-testid="confirm-button" @click="$emit(\'confirm\')">Confirm</button></div>',
                        props: [
                            'modelValue',
                            'header',
                            'content',
                            'confirmButtonClass',
                            'confirmButtonText'
                        ],
                        emits: ['confirm', 'update:modelValue']
                    }
                },
                mocks: {
                    $t: (key) => key,
                    $ability: {
                        can: () => true
                    }
                }
            }
        });

        await nextTick();
    });

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('loads benefit groups on mount', () => {
        expect(mockSearchBenefitGroups).toHaveBeenCalled();
    });

    it('renders the benefit groups table', () => {
        const table = wrapper.find('[data-testid="benefit-groups-table"]');
        expect(table.exists()).toBe(true);
    });

    it('renders the search input', () => {
        const searchInput = wrapper.find('[data-testid="input-search"]');
        expect(searchInput.exists()).toBe(true);
    });
});

describe('BenefitGroupsTable - Interaction Tests', () => {
    let wrapper;

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(BenefitGroupsTable, {
            global: {
                stubs: {
                    BaseTable: {
                        template: `
                            <div data-testid="benefit-groups-table">
                                <slot name="header"></slot>
                                <slot v-for="(item, index) in value" :data="item" :index="index" />
                                <slot name="empty" v-if="!value || value.length === 0"></slot>
                                <button data-testid="trigger-row-click" @click="$emit('row-click', { data: value[0] })">Row Click</button>
                                <button data-testid="trigger-page" @click="$emit('page', { page: 2 })">Page</button>
                                <button data-testid="trigger-sort" @click="$emit('sort', { field: 'name', order: 1 })">Sort</button>
                            </div>
                        `,
                        props: [
                            'value',
                            'loading',
                            'page',
                            'rows',
                            'totalRecords'
                        ],
                        emits: ['row-click', 'page', 'sort']
                    },
                    Search: {
                        template:
                            '<input data-testid="input-search" v-model="modelValue" @input="$emit(\'search\')" />',
                        props: ['modelValue'],
                        emits: ['search', 'update:modelValue']
                    },
                    Column: {
                        template:
                            '<div><slot name="header"></slot><slot name="body" :data="data" :index="index"></slot></div>',
                        props: ['field', 'header', 'sortable'],
                        data() {
                            return {
                                data: mockBenefitGroups[0],
                                index: 0
                            };
                        }
                    },
                    Label: {
                        template: '<span><slot /></span>',
                        props: ['testId']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\', $event)"><slot /></button>',
                        props: [
                            'label',
                            'icon',
                            'iconPos',
                            'size',
                            'class',
                            'dataTestid'
                        ],
                        emits: ['click']
                    },
                    Menu: {
                        template:
                            '<div data-testid="actions-menu"><slot /></div>',
                        props: ['model', 'popup'],
                        methods: {
                            toggle: vi.fn()
                        }
                    },
                    StatusTag: {
                        template:
                            '<span :data-testid="dataTestid">{{ status }}</span>',
                        props: ['status', 'dataTestid']
                    },
                    Confirmation: {
                        template:
                            '<div v-if="modelValue" data-testid="confirmation-dialog"><button data-testid="confirm-button" @click="$emit(\'confirm\')">Confirm</button></div>',
                        props: [
                            'modelValue',
                            'header',
                            'content',
                            'confirmButtonClass',
                            'confirmButtonText'
                        ],
                        emits: ['confirm', 'update:modelValue']
                    }
                },
                mocks: {
                    $t: (key) => key,
                    $ability: {
                        can: () => true
                    }
                }
            }
        });

        await nextTick();
    });

    it('navigates to benefit group details when row is clicked', async () => {
        // Trigger row click
        await wrapper
            .find('[data-testid="trigger-row-click"]')
            .trigger('click');

        expect(mockPush).toHaveBeenCalledWith({
            name: 'Benefit Group Details',
            params: { id: '1' }
        });
    });

    it('updates pagination when page changes', async () => {
        // Trigger page change
        await wrapper.find('[data-testid="trigger-page"]').trigger('click');

        // Should reload items with new page
        expect(mockSearchBenefitGroups).toHaveBeenCalledTimes(2);
    });

    it('updates sorting when sort changes', async () => {
        // Trigger sort change
        await wrapper.find('[data-testid="trigger-sort"]').trigger('click');

        // Should reload items with new sort
        expect(mockSearchBenefitGroups).toHaveBeenCalledTimes(2);
    });

    it('searches items when search is triggered', async () => {
        // Set search text
        wrapper.vm.searchText = 'test';

        // Trigger search
        await wrapper.vm.search();

        // Should reload items with search
        expect(mockSearchBenefitGroups).toHaveBeenCalledTimes(2);
    });

    it('shows actions menu when actions button is clicked', async () => {
        // Mock the menu toggle method
        const toggleSpy = vi.spyOn(wrapper.vm.menu, 'toggle');

        // Set selected item and show actions
        await wrapper.vm.showActions({}, mockBenefitGroups[0]);

        // Selected item should be set
        expect(wrapper.vm.selectedItem).toEqual(mockBenefitGroups[0]);

        // Menu toggle should be called
        expect(toggleSpy).toHaveBeenCalled();
    });

    it('navigates to view when view action is clicked', async () => {
        // Set selected item
        wrapper.vm.selectedItem = mockBenefitGroups[0];

        // Call goToView
        await wrapper.vm.goToView();

        expect(mockPush).toHaveBeenCalledWith({
            name: 'Benefit Group Details',
            params: { id: '1' }
        });
    });

    it('shows status update dialog with correct content for active item', async () => {
        // Set selected item (active)
        wrapper.vm.selectedItem = mockBenefitGroups[0];

        // Show status update dialog
        await wrapper.vm.showStatusUpdateDialog();

        // Status update dialog should be visible
        expect(wrapper.vm.statusUpdateDialog).toBe(true);

        // Dialog content should be for making inactive
        expect(wrapper.vm.statusDialogHeader).toContain(
            'make_benefit_group_inactive'
        );
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-danger');

        const dialog = wrapper.find('[data-testid="confirmation-dialog"]');
        expect(dialog.exists()).toBe(true);
    });

    it('shows status update dialog with correct content for inactive item', async () => {
        // Set selected item (inactive)
        wrapper.vm.selectedItem = mockBenefitGroups[1];

        // Show status update dialog
        await wrapper.vm.showStatusUpdateDialog();

        // Status update dialog should be visible
        expect(wrapper.vm.statusUpdateDialog).toBe(true);

        // Dialog content should be for making active
        expect(wrapper.vm.statusDialogHeader).toContain(
            'make_benefit_group_active'
        );
        expect(wrapper.vm.statusDialogButtonClass).toBe('p-button-success');

        const dialog = wrapper.find('[data-testid="confirmation-dialog"]');
        expect(dialog.exists()).toBe(true);
    });

    it('updates status when status update is confirmed', async () => {
        // Set selected item
        wrapper.vm.selectedItem = mockBenefitGroups[0];

        // Show status update dialog
        await wrapper.vm.showStatusUpdateDialog();

        // Confirm status update
        await wrapper.find('[data-testid="confirm-button"]').trigger('click');

        expect(mockUpdateBenefitGroupStatus).toHaveBeenCalledWith('1', {
            ...mockBenefitGroups[0],
            status: 'inactive'
        });

        // Should reload items after update
        expect(mockSearchBenefitGroups).toHaveBeenCalledTimes(2);
    });

    it('shows delete dialog when delete button is clicked', async () => {
        // Set selected item
        wrapper.vm.selectedItem = mockBenefitGroups[0];

        // Show delete dialog
        await wrapper.vm.showDeleteDialog();

        // Delete dialog should be visible
        expect(wrapper.vm.deleteDialog).toBe(true);

        const dialog = wrapper.find('[data-testid="confirmation-dialog"]');
        expect(dialog.exists()).toBe(true);
    });

    it('deletes item when delete is confirmed', async () => {
        // Set selected item
        wrapper.vm.selectedItem = mockBenefitGroups[0];

        // Show delete dialog
        await wrapper.vm.showDeleteDialog();

        // Confirm delete
        await wrapper.find('[data-testid="confirm-button"]').trigger('click');

        expect(mockDeleteBenefitGroup).toHaveBeenCalledWith('1');

        // Should reload items after delete
        expect(mockSearchBenefitGroups).toHaveBeenCalledTimes(2);
    });
});
