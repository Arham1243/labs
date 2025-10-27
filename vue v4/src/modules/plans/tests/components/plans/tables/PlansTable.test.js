import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import PlansTable from '@/modules/plans/components/plans/tables/PlansTable.vue';

// Mock the PlanStore
const mockSearchPlans = vi.fn().mockResolvedValue({
    data: [
        {
            id: '1',
            name: { en: 'Test Plan 1' },
            effective_date: '2024-01-01',
            end_date: '2024-12-31',
            status: 'active'
        },
        {
            id: '2',
            name: { en: 'Test Plan 2' },
            effective_date: '2024-02-01',
            end_date: '2024-12-31',
            status: 'inactive'
        }
    ],
    meta: {
        total: 2,
        current_page: 1,
        per_page: 10
    }
});

const mockUpdatePlanStatus = vi.fn().mockResolvedValue({});
const mockDeletePlan = vi.fn().mockResolvedValue({});

vi.mock('@/modules/plans/stores/Plan', () => ({
    usePlanStore: vi.fn(() => ({
        searchPlans: mockSearchPlans,
        updatePlanStatus: mockUpdatePlanStatus,
        deletePlan: mockDeletePlan
    }))
}));

// Mock the router
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
    useRouter: vi.fn(() => ({
        push: mockPush
    }))
}));

// Mock the i18n
vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key, params) => {
            const translations = {
                'common.name': 'Name',
                'common.effective_date': 'Effective Date',
                'common.end_date': 'End Date',
                'common.status': 'Status',
                'common.view': 'View',
                'common.make_inactive': 'Make Inactive',
                'common.make_active': 'Make Active',
                'buttons.delete': 'Delete',
                'plans.title': 'Plans',
                'plans.title_singular': 'Plan',
                'common.datatable_no_found': `No ${
                    params?.item || 'items'
                } found`,
                'common.datatable_loading': `Loading ${
                    params?.item || 'items'
                }...`,
                'common.make_item_inactive': `Make ${
                    params?.item || 'item'
                } inactive`,
                'common.make_item_active': `Make ${
                    params?.item || 'item'
                } active`,
                'common.are_you_sure_inactive': `Are you sure you want to make ${
                    params?.item || 'this item'
                } inactive?`,
                'common.are_you_sure_active': `Are you sure you want to make ${
                    params?.item || 'this item'
                } active?`,
                'plans.delete_header': 'Delete Plan',
                'plans.delete_content': `Are you sure you want to delete ${
                    params?.item || 'this plan'
                }?`
            };
            return translations[key] || key;
        },
        locale: { value: 'en' }
    }))
}));

// Mock the helpers
vi.mock('@/composables', () => ({
    useHelpers: vi.fn(() => ({
        getLocaleValue: (value) => value?.en || '',
        formatDate: (date) => date || ''
    }))
}));

describe('PlansTable - Rendering Tests', () => {
    let wrapper;

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlansTable, {
            global: {
                stubs: {
                    BaseTable: {
                        template: `
                            <div class="base-table">
                                <div class="header"><slot name="header"></slot></div>
                                <div class="empty" data-testid="empty" v-if="!value.length && !loading"><slot name="empty"></slot></div>
                                <div class="loading" data-testid="loading" v-if="loading"><slot name="loading"></slot></div>
                                <table data-testid="table" v-if="value.length && !loading">
                                    <thead>
                                        <tr>
                                            <th v-for="(col, i) in columns" :key="i">
                                                <slot :name="col"></slot>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, index) in value" :key="index" @click="rowClick(item)">
                                            <td v-for="(col, i) in columns" :key="i">
                                                <slot :name="col" :data="item" :index="index"></slot>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="pagination">
                                    <button @click="changePage(page - 1)" :disabled="page === 1">Previous</button>
                                    <span>Page {{ page }} of {{ Math.ceil(totalRecords / rows) }}</span>
                                    <button @click="changePage(page + 1)" :disabled="page >= Math.ceil(totalRecords / rows)">Next</button>
                                </div>
                            </div>
                        `,
                        props: [
                            'value',
                            'loading',
                            'page',
                            'rows',
                            'totalRecords'
                        ],
                        emits: ['row-click', 'page', 'sort'],
                        data() {
                            return {
                                columns: [
                                    'name',
                                    'effective_date',
                                    'end_date',
                                    'status',
                                    'actions'
                                ]
                            };
                        },
                        methods: {
                            rowClick(item) {
                                this.$emit('row-click', { data: item });
                            },
                            changePage(newPage) {
                                this.$emit('page', { page: newPage });
                            },
                            changeSort(field, order) {
                                this.$emit('sort', { field, order });
                            }
                        }
                    },
                    Column: {
                        template:
                            '<div><slot></slot><slot name="body" v-bind="{ data: {}, index: 0 }"></slot></div>',
                        props: ['field', 'header', 'sortable']
                    },
                    Search: {
                        template:
                            '<div class="search" data-testid="search"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><button @click="$emit(\'search\')">Search</button></div>',
                        props: ['modelValue'],
                        emits: ['update:modelValue', 'search']
                    },
                    StatusTag: {
                        template:
                            '<span class="status-tag">{{ status }}</span>',
                        props: ['status']
                    },
                    Button: {
                        template:
                            '<button @click="$emit(\'click\', $event)">{{ label }}</button>',
                        props: ['label', 'icon', 'iconPos', 'size', 'class'],
                        emits: ['click']
                    },
                    Menu: {
                        template:
                            '<div class="menu"><div v-for="(item, i) in model" :key="i" @click="item.command && item.command()">{{ item.label }}</div></div>',
                        props: ['model', 'popup'],
                        methods: {
                            toggle: vi.fn()
                        }
                    },
                    Confirmation: {
                        template: `
                            <div v-if="modelValue" class="confirmation-dialog">
                                <div class="header">{{ header }}</div>
                                <div class="content">{{ content }}</div>
                                <div class="footer">
                                    <button @click="$emit('update:modelValue', false)">Cancel</button>
                                    <button :class="confirmButtonClass" @click="$emit('confirm')">{{ confirmButtonText || 'Confirm' }}</button>
                                </div>
                            </div>
                        `,
                        props: [
                            'modelValue',
                            'header',
                            'content',
                            'confirmButtonClass',
                            'confirmButtonText',
                            'showAlertIcon'
                        ],
                        emits: ['update:modelValue', 'confirm']
                    }
                }
            }
        });

        await nextTick();
    });

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('calls searchPlans on mount', () => {
        expect(mockSearchPlans).toHaveBeenCalled();
    });

    it('renders the search input', () => {
        expect(wrapper.findByTestId('input-search').exists()).toBe(true);
    });

    it('renders the table when data is loaded', async () => {
        // Set items
        wrapper.vm.items = [
            {
                id: '1',
                name: { en: 'Test Plan 1' },
                effective_date: '2024-01-01',
                end_date: '2024-12-31',
                status: 'active'
            }
        ];
        wrapper.vm.loading = false;
        await nextTick();

        expect(wrapper.findByTestId('table').exists()).toBe(true);
    });

    it('shows loading state when loading', async () => {
        wrapper.vm.loading = true;
        await nextTick();

        expect(wrapper.findByTestId('loading').exists()).toBe(true);
        expect(wrapper.findByTestId('loading').text()).toContain(
            'Loading plans'
        );
    });

    it('shows empty state when no data', async () => {
        wrapper.vm.items = [];
        wrapper.vm.loading = false;
        await nextTick();

        expect(wrapper.findByTestId('empty').exists()).toBe(true);
        expect(wrapper.findByTestId('empty').text()).toContain('No plans');
    });
});

describe('PlansTable - Interaction Tests', () => {
    let wrapper;

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlansTable, {
            global: {
                stubs: {
                    BaseTable: {
                        template: `
                            <div class="base-table">
                                <div class="header"><slot name="header"></slot></div>
                                <div class="empty" data-testid="empty" v-if="!value.length && !loading"><slot name="empty"></slot></div>
                                <div class="loading" data-testid="loading" v-if="loading"><slot name="loading"></slot></div>
                                <table data-testid="table" v-if="value.length && !loading">
                                    <thead>
                                        <tr>
                                            <th v-for="(col, i) in columns" :key="i">
                                                <slot :name="col"></slot>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, index) in value" :key="index" @click="rowClick(item)">
                                            <td v-for="(col, i) in columns" :key="i">
                                                <slot :name="col" :data="item" :index="index"></slot>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div class="pagination">
                                    <button @click="changePage(page - 1)" :disabled="page === 1">Previous</button>
                                    <span>Page {{ page }} of {{ Math.ceil(totalRecords / rows) }}</span>
                                    <button @click="changePage(page + 1)" :disabled="page >= Math.ceil(totalRecords / rows)">Next</button>
                                </div>
                            </div>
                        `,
                        props: [
                            'value',
                            'loading',
                            'page',
                            'rows',
                            'totalRecords'
                        ],
                        emits: ['row-click', 'page', 'sort'],
                        data() {
                            return {
                                columns: [
                                    'name',
                                    'effective_date',
                                    'end_date',
                                    'status',
                                    'actions'
                                ]
                            };
                        },
                        methods: {
                            rowClick(item) {
                                this.$emit('row-click', { data: item });
                            },
                            changePage(newPage) {
                                this.$emit('page', { page: newPage });
                            },
                            changeSort(field, order) {
                                this.$emit('sort', { field, order });
                            }
                        }
                    },
                    Column: {
                        template:
                            '<div><slot></slot><slot name="body" v-bind="{ data: {}, index: 0 }"></slot></div>',
                        props: ['field', 'header', 'sortable']
                    },
                    Search: {
                        template:
                            '<div class="search" data-testid="search"><input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" /><button @click="$emit(\'search\')">Search</button></div>',
                        props: ['modelValue'],
                        emits: ['update:modelValue', 'search']
                    },
                    StatusTag: {
                        template:
                            '<span class="status-tag">{{ status }}</span>',
                        props: ['status']
                    },
                    Button: {
                        template:
                            '<button @click="$emit(\'click\', $event)">{{ label }}</button>',
                        props: ['label', 'icon', 'iconPos', 'size', 'class'],
                        emits: ['click']
                    },
                    Menu: {
                        template:
                            '<div class="menu"><div v-for="(item, i) in model" :key="i" @click="item.command && item.command()">{{ item.label }}</div></div>',
                        props: ['model', 'popup'],
                        methods: {
                            toggle: vi.fn()
                        }
                    },
                    Confirmation: {
                        template: `
                            <div v-if="modelValue" class="confirmation-dialog">
                                <div class="header">{{ header }}</div>
                                <div class="content">{{ content }}</div>
                                <div class="footer">
                                    <button @click="$emit('update:modelValue', false)">Cancel</button>
                                    <button :class="confirmButtonClass" @click="$emit('confirm')">{{ confirmButtonText || 'Confirm' }}</button>
                                </div>
                            </div>
                        `,
                        props: [
                            'modelValue',
                            'header',
                            'content',
                            'confirmButtonClass',
                            'confirmButtonText',
                            'showAlertIcon'
                        ],
                        emits: ['update:modelValue', 'confirm']
                    }
                }
            }
        });

        // Set items
        wrapper.vm.items = [
            {
                id: '1',
                name: { en: 'Test Plan 1' },
                effective_date: '2024-01-01',
                end_date: '2024-12-31',
                status: 'active'
            },
            {
                id: '2',
                name: { en: 'Test Plan 2' },
                effective_date: '2024-02-01',
                end_date: '2024-12-31',
                status: 'inactive'
            }
        ];
        wrapper.vm.loading = false;
        await nextTick();
    });

    it('navigates to plan details when row is clicked', async () => {
        // Trigger row click
        await wrapper.vm.rowClicked({ data: { id: '1' } });

        // Check that router.push was called with correct params
        expect(mockPush).toHaveBeenCalledWith({
            name: 'Plan Details',
            params: { id: '1' }
        });
    });

    it('shows actions menu when actions button is clicked', async () => {
        // Mock the menu toggle method
        wrapper.vm.menu = { toggle: vi.fn() };

        // Create a mock event
        const mockEvent = { preventDefault: vi.fn() };

        // Call showActions
        wrapper.vm.showActions(mockEvent, { id: '1', status: 'active' });

        // Check that menu.toggle was called
        expect(wrapper.vm.menu.toggle).toHaveBeenCalledWith(mockEvent);

        // Check that selectedItem was set
        expect(wrapper.vm.selectedItem).toEqual({ id: '1', status: 'active' });

        // Check that menuItems was updated
        expect(wrapper.vm.menuItems[1].label).toBe('Make Inactive');
    });

    it('shows delete confirmation dialog when delete is clicked', async () => {
        // Set selectedItem
        wrapper.vm.selectedItem = { id: '1', name: { en: 'Test Plan 1' } };

        // Call showDeleteDialog
        wrapper.vm.showDeleteDialog();

        // Check that deleteDialog was set to true
        expect(wrapper.vm.deleteDialog).toBe(true);
    });

    it('shows status update confirmation dialog when status update is clicked', async () => {
        // Set selectedItem
        wrapper.vm.selectedItem = {
            id: '1',
            name: { en: 'Test Plan 1' },
            status: 'active'
        };

        // Call showStatusUpdateDialog
        wrapper.vm.showStatusUpdateDialog();

        // Check that statusUpdateDialog was set to true
        expect(wrapper.vm.statusUpdateDialog).toBe(true);
    });

    it('calls updatePlanStatus when status update is confirmed', async () => {
        // Set selectedItem
        wrapper.vm.selectedItem = {
            id: '1',
            name: { en: 'Test Plan 1' },
            status: 'active'
        };

        // Call updateStatus
        await wrapper.vm.updateStatus();

        // Check that updatePlanStatus was called with correct params
        expect(mockUpdatePlanStatus).toHaveBeenCalledWith('1', {
            id: '1',
            name: { en: 'Test Plan 1' },
            status: 'inactive'
        });

        // Check that getItems was called
        expect(mockSearchPlans).toHaveBeenCalled();
    });

    it('calls deletePlan when delete is confirmed', async () => {
        // Set selectedItem
        wrapper.vm.selectedItem = { id: '1', name: { en: 'Test Plan 1' } };

        // Call deleteItem
        await wrapper.vm.deleteItem();

        // Check that deletePlan was called with correct params
        expect(mockDeletePlan).toHaveBeenCalledWith('1');

        // Check that getItems was called
        expect(mockSearchPlans).toHaveBeenCalled();
    });

    it('searches plans when search is triggered', async () => {
        // Set searchText
        wrapper.vm.searchText = 'test';

        // Call search
        await wrapper.vm.search();

        // Check that searchPlans was called with correct params
        expect(mockSearchPlans).toHaveBeenCalled();
        expect(wrapper.vm.sortFilters.search).toBe('test');
    });

    it('updates pagination when page changes', async () => {
        // Trigger page change
        await wrapper.vm.onPageChange({ page: 1 });

        // Check that pagination was updated
        expect(wrapper.vm.pagination.page).toBe(2);

        // Check that getItems was called
        expect(mockSearchPlans).toHaveBeenCalled();
    });

    it('updates sort filters when sort changes', async () => {
        // Trigger sort change
        await wrapper.vm.onSortChange({ sortField: 'name', sortOrder: 1 });

        // Check that sortFilters was updated
        expect(wrapper.vm.sortFilters.sort[0].field).toBe('name');
        expect(wrapper.vm.sortFilters.sort[0].direction).toBe('asc');

        // Check that getItems was called
        expect(mockSearchPlans).toHaveBeenCalled();
    });
});
