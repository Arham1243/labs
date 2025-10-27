import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BenefitGroupsBenefitsTable from '@/modules/plans/components/benefit-groups/tables/BenefitGroupsBenefitsTable.vue';
import { nextTick } from 'vue';

// Mock the BenefitStore
const mockBenefits = [
    {
        id: '1',
        name: { en: 'Benefit 1' },
        benefit_category: { name: { en: 'Category 1' } },
        pivot: {
            coverage: 75,
            max_amount: 500,
            note: 'Test note'
        },
        effective_date: '2023-01-01',
        end_date: '2023-12-31'
    },
    {
        id: '2',
        name: { en: 'Benefit 2' },
        benefit_category: { name: { en: 'Category 2' } },
        pivot: {
            coverage: 80,
            max_amount: 1000,
            note: null
        },
        effective_date: '2023-02-01',
        end_date: null
    }
];

const mockGetBenefitGroup = vi.fn().mockResolvedValue({
    data: {
        id: '123',
        name: { en: 'Test Group' },
        max_amount: 2000
    }
});

const mockSearchBenefitGroupBenefits = vi.fn().mockResolvedValue({
    data: mockBenefits,
    meta: { total: 2 }
});

const mockUpdateBenefitGroupBenefitPivot = vi.fn().mockResolvedValue({});
const mockDetachBenefitGroupWithBenefits = vi.fn().mockResolvedValue({});

vi.mock('@/modules/plans/stores/Benefit', () => ({
    useBenefitStore: vi.fn(() => ({
        getBenefitGroup: mockGetBenefitGroup,
        searchBenefitGroupBenefits: mockSearchBenefitGroupBenefits,
        updateBenefitGroupBenefitPivot: mockUpdateBenefitGroupBenefitPivot,
        detachBenefitGroupWithBenefits: mockDetachBenefitGroupWithBenefits,
        setCurrentBenefitGroup: vi.fn(),
        currentBenefitGroup: { max_amount: 2000 }
    }))
}));

// Mock the helpers
vi.mock('@/composables', () => ({
    useHelpers: vi.fn(() => ({
        getLocaleValue: vi.fn((value) => value?.en || value),
        formatDate: vi.fn((date) => date),
        moneyFormat: vi.fn((amount) => `$${amount}`)
    }))
}));

// Mock the event bus
const mockEmit = vi.fn();
vi.mock('@/composables/event-bus', () => ({
    default: vi.fn(() => ({
        bus: { value: { get: vi.fn() } },
        emit: mockEmit
    }))
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key) => key,
        locale: { value: 'en' }
    }))
}));

describe('BenefitGroupsBenefitsTable - Rendering Tests', () => {
    let wrapper;

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(BenefitGroupsBenefitsTable, {
            props: {
                id: '123',
                isEditable: false
            },
            global: {
                stubs: {
                    BaseTable: {
                        template: `
                            <div data-testid="benefits-table">
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
                            'totalRecords',
                            'editingRows',
                            'editMode'
                        ],
                        emits: [
                            'row-edit-save',
                            'row-edit-cancel',
                            'page',
                            'sort',
                            'update:editingRows'
                        ]
                    },
                    Search: {
                        template:
                            '<input data-testid="input-search" v-model="modelValue" @input="$emit(\'search\')" />',
                        props: ['modelValue'],
                        emits: ['search', 'update:modelValue']
                    },
                    Column: {
                        template:
                            '<div><slot name="header"></slot><slot name="body" :data="data" :index="index"></slot><slot name="editor" :data="data" :index="index"></slot></div>',
                        props: ['field', 'header', 'sortable'],
                        data() {
                            return {
                                data: mockBenefits[0],
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
                        props: ['icon', 'dataTestid'],
                        emits: ['click']
                    },
                    InputField: {
                        template:
                            '<input :data-testid="dataTestid" v-model="modelValue" />',
                        props: [
                            'modelValue',
                            'addonAfter',
                            'addonBefore',
                            'variant',
                            'dataTestid'
                        ],
                        emits: ['update:modelValue']
                    },
                    MaxAmountWarningIcon: {
                        template:
                            '<span v-if="show" data-testid="max-amount-warning">Warning</span>',
                        props: ['show', 'tooltipText']
                    },
                    Confirmation: {
                        template:
                            '<div v-if="modelValue" data-testid="confirmation-dialog"><button @click="$emit(\'confirm\')">Confirm</button></div>',
                        props: [
                            'modelValue',
                            'header',
                            'content',
                            'confirmButtonClass'
                        ],
                        emits: ['confirm', 'update:modelValue']
                    },
                    BenefitDetailsDialog: {
                        template:
                            '<div v-if="modelValue" data-testid="benefit-details-dialog"></div>',
                        props: ['modelValue', 'id'],
                        emits: ['update:modelValue']
                    },
                    BenefitNotesDialog: {
                        template:
                            '<div v-if="shouldDialogBeVisible" data-testid="benefit-notes-dialog"></div>',
                        props: [
                            'shouldDialogBeVisible',
                            'formData',
                            'benefitGroupId'
                        ],
                        emits: [
                            'update:shouldDialogBeVisible',
                            'update:formData'
                        ]
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

    it('loads benefit group and benefits on mount', () => {
        expect(mockGetBenefitGroup).toHaveBeenCalledWith('123');
        expect(mockSearchBenefitGroupBenefits).toHaveBeenCalled();
    });

    it('renders the benefits table', () => {
        const table = wrapper.find('[data-testid="benefits-table"]');
        expect(table.exists()).toBe(true);
    });

    it('renders the search input', () => {
        const searchInput = wrapper.find('[data-testid="input-search"]');
        expect(searchInput.exists()).toBe(true);
    });

    it('emits setTotalBenefitIncluded event with total records', () => {
        expect(wrapper.emitted('setTotalBenefitIncluded')).toBeTruthy();
        expect(wrapper.emitted('setTotalBenefitIncluded')[0]).toEqual([2]);
    });

    it('shows max amount warning when benefit max amount exceeds group max amount', () => {
        // Set up a benefit with max amount exceeding the group max amount
        wrapper.vm.shouldShowMaxAmountWarning(3000);

        // Warning should be shown
        expect(wrapper.vm.shouldShowMaxAmountWarning(3000)).toBe(true);
    });

    it('does not show max amount warning when benefit max amount is less than group max amount', () => {
        // Set up a benefit with max amount less than the group max amount
        wrapper.vm.shouldShowMaxAmountWarning(1000);

        // Warning should not be shown
        expect(wrapper.vm.shouldShowMaxAmountWarning(1000)).toBe(false);
    });
});

describe('BenefitGroupsBenefitsTable - Interaction Tests', () => {
    let wrapper;

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(BenefitGroupsBenefitsTable, {
            props: {
                id: '123',
                isEditable: true
            },
            global: {
                stubs: {
                    BaseTable: {
                        template: `
                            <div data-testid="benefits-table">
                                <slot name="header"></slot>
                                <slot v-for="(item, index) in value" :data="item" :index="index" />
                                <slot name="empty" v-if="!value || value.length === 0"></slot>
                                <button data-testid="trigger-row-edit-save" @click="$emit('row-edit-save', { newData: value[0], index: 0 })">Save</button>
                                <button data-testid="trigger-row-edit-cancel" @click="$emit('row-edit-cancel', { index: 0 })">Cancel</button>
                                <button data-testid="trigger-page" @click="$emit('page', { page: 2 })">Page</button>
                                <button data-testid="trigger-sort" @click="$emit('sort', { field: 'name', order: 1 })">Sort</button>
                            </div>
                        `,
                        props: [
                            'value',
                            'loading',
                            'page',
                            'rows',
                            'totalRecords',
                            'editingRows',
                            'editMode'
                        ],
                        emits: [
                            'row-edit-save',
                            'row-edit-cancel',
                            'page',
                            'sort',
                            'update:editingRows'
                        ]
                    },
                    Search: {
                        template:
                            '<input data-testid="input-search" v-model="modelValue" @input="$emit(\'search\')" />',
                        props: ['modelValue'],
                        emits: ['search', 'update:modelValue']
                    },
                    Column: {
                        template:
                            '<div><slot name="header"></slot><slot name="body" :data="data" :index="index"></slot><slot name="editor" :data="data" :index="index"></slot></div>',
                        props: ['field', 'header', 'sortable', 'rowEditor'],
                        data() {
                            return {
                                data: mockBenefits[0],
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
                        props: ['icon', 'dataTestid'],
                        emits: ['click']
                    },
                    InputField: {
                        template:
                            '<input :data-testid="dataTestid" v-model="modelValue" />',
                        props: [
                            'modelValue',
                            'addonAfter',
                            'addonBefore',
                            'variant',
                            'dataTestid'
                        ],
                        emits: ['update:modelValue']
                    },
                    MaxAmountWarningIcon: {
                        template:
                            '<span v-if="show" data-testid="max-amount-warning">Warning</span>',
                        props: ['show', 'tooltipText']
                    },
                    Confirmation: {
                        template:
                            '<div v-if="modelValue" data-testid="confirmation-dialog"><button data-testid="confirm-button" @click="$emit(\'confirm\')">Confirm</button></div>',
                        props: [
                            'modelValue',
                            'header',
                            'content',
                            'confirmButtonClass'
                        ],
                        emits: ['confirm', 'update:modelValue']
                    },
                    BenefitDetailsDialog: {
                        template:
                            '<div v-if="modelValue" data-testid="benefit-details-dialog"></div>',
                        props: ['modelValue', 'id'],
                        emits: ['update:modelValue']
                    },
                    BenefitNotesDialog: {
                        template:
                            '<div v-if="shouldDialogBeVisible" data-testid="benefit-notes-dialog"></div>',
                        props: [
                            'shouldDialogBeVisible',
                            'formData',
                            'benefitGroupId'
                        ],
                        emits: [
                            'update:shouldDialogBeVisible',
                            'update:formData'
                        ]
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

    it('updates item when row edit is saved', async () => {
        // Trigger row edit save
        await wrapper
            .find('[data-testid="trigger-row-edit-save"]')
            .trigger('click');

        expect(mockUpdateBenefitGroupBenefitPivot).toHaveBeenCalledWith(
            '123',
            '1',
            {
                pivot: {
                    coverage: 75,
                    max_amount: 500,
                    note: 'Test note'
                }
            }
        );

        // Should reload items after update
        expect(mockSearchBenefitGroupBenefits).toHaveBeenCalledTimes(2);
    });

    it('cancels item edit when row edit is canceled', async () => {
        // Trigger row edit cancel
        await wrapper
            .find('[data-testid="trigger-row-edit-cancel"]')
            .trigger('click');

        // Original item should be restored
        expect(wrapper.vm.items[0]).toEqual(mockBenefits[0]);
    });

    it('updates pagination when page changes', async () => {
        // Trigger page change
        await wrapper.find('[data-testid="trigger-page"]').trigger('click');

        // Should reload items with new page
        expect(mockSearchBenefitGroupBenefits).toHaveBeenCalledTimes(2);
    });

    it('updates sorting when sort changes', async () => {
        // Trigger sort change
        await wrapper.find('[data-testid="trigger-sort"]').trigger('click');

        // Should reload items with new sort
        expect(mockSearchBenefitGroupBenefits).toHaveBeenCalledTimes(2);
    });

    it('searches items when search is triggered', async () => {
        // Set search text
        wrapper.vm.searchText = 'test';

        // Trigger search
        await wrapper.vm.search();

        // Should reload items with search
        expect(mockSearchBenefitGroupBenefits).toHaveBeenCalledTimes(2);
    });

    it('shows delete dialog when delete button is clicked', async () => {
        // Set selected item
        wrapper.vm.selectedItem = mockBenefits[0];

        // Show delete dialog
        await wrapper.vm.showDeleteDialog();

        // Delete dialog should be visible
        expect(wrapper.vm.deleteDialog).toBe(true);

        const dialog = wrapper.find('[data-testid="confirmation-dialog"]');
        expect(dialog.exists()).toBe(true);
    });

    it('deletes item when delete is confirmed', async () => {
        // Set selected item
        wrapper.vm.selectedItem = mockBenefits[0];

        // Show delete dialog
        await wrapper.vm.showDeleteDialog();

        // Confirm delete
        await wrapper.find('[data-testid="confirm-button"]').trigger('click');

        expect(mockDetachBenefitGroupWithBenefits).toHaveBeenCalledWith('123', {
            resources: ['1']
        });

        // Should reload items after delete
        expect(mockSearchBenefitGroupBenefits).toHaveBeenCalledTimes(2);

        // Should emit events
        expect(wrapper.emitted('setTotalBenefitIncluded')).toBeTruthy();
        expect(mockEmit).toHaveBeenCalledWith('openSyncPricesDialog');
    });

    it('shows benefit details dialog when benefit name is clicked', async () => {
        // Show benefit details dialog
        await wrapper.vm.showBenefitDetailsDialog(mockBenefits[0]);

        // Selected item should be set
        expect(wrapper.vm.selectedItem).toEqual(mockBenefits[0]);

        // Benefit details dialog should be visible
        expect(wrapper.vm.benefitDetailsDialog).toBe(true);

        const dialog = wrapper.find('[data-testid="benefit-details-dialog"]');
        expect(dialog.exists()).toBe(true);
    });

    it('shows benefit notes dialog when note button is clicked', async () => {
        // Show benefit notes dialog
        await wrapper.vm.showBenefitNotesDialog(0);

        // Selected benefit note should be set
        expect(wrapper.vm.selectedBenefitNote).toEqual(mockBenefits[0]);

        // Benefit notes dialog should be visible
        expect(wrapper.vm.shouldShowBenefitNotesDialog).toBe(true);

        const dialog = wrapper.find('[data-testid="benefit-notes-dialog"]');
        expect(dialog.exists()).toBe(true);
    });
});
