import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BenefitGroupsBenefits from '@/modules/plans/components/benefit-groups/BenefitGroupsBenefits.vue';
import { nextTick } from 'vue';

// Mock the BenefitStore
vi.mock('@/modules/plans/stores/Benefit', () => ({
    useBenefitStore: vi.fn(() => ({
        searchBenefitGroupPrices: vi.fn().mockResolvedValue({
            data: [{ id: '1', price: 100 }]
        }),
        syncPrices: vi.fn().mockResolvedValue({})
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

// Mock the useEditState composable
const mockSetActiveComponent = vi.fn();
const mockClearActiveComponent = vi.fn();
const mockRegisterCancelCallback = vi.fn();
const mockUnregisterCancelCallback = vi.fn();

vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: vi.fn(() => ({
        activeEditComponent: { value: null },
        setActiveComponent: mockSetActiveComponent,
        clearActiveComponent: mockClearActiveComponent,
        registerCancelCallback: mockRegisterCancelCallback,
        unregisterCancelCallback: mockUnregisterCancelCallback
    }))
}));

describe('BenefitGroupsBenefits - Rendering Tests', () => {
    let wrapper;

    beforeEach(async () => {
        wrapper = mount(BenefitGroupsBenefits, {
            props: {
                id: '123',
                isNew: false,
                componentId: 'benefit-groups-benefits',
                isReview: false
            },
            global: {
                stubs: {
                    BenefitGroupsBenefitsTable: {
                        template: '<div data-testid="benefits-table"></div>',
                        props: ['isEditable', 'id'],
                        emits: ['setTotalBenefitIncluded']
                    },
                    BenefitGroupsBenefitsForm: {
                        template: '<div data-testid="benefits-form"></div>',
                        props: ['id'],
                        emits: ['setTotalBenefitIncluded']
                    },
                    SyncPricesDialog: {
                        template:
                            '<div data-testid="sync-prices-dialog"></div>',
                        props: ['openDialog', 'id', 'store'],
                        emits: ['closeDialog']
                    },
                    Label: {
                        template: '<span><slot /></span>',
                        props: ['testId']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')"><slot /></button>',
                        props: ['label', 'icon', 'dataTestid'],
                        emits: ['click']
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

    it('renders the benefits table', () => {
        const table = wrapper.find('[data-testid="benefits-table"]');
        expect(table.exists()).toBe(true);
    });

    it('does not render the benefits form when not editing', () => {
        const form = wrapper.find('[data-testid="benefits-form"]');
        expect(form.exists()).toBe(false);
    });

    it('does not render the sync prices dialog by default', () => {
        const dialog = wrapper.find('[data-testid="sync-prices-dialog"]');
        expect(dialog.exists()).toBe(false);
    });

    it('renders the edit button when not editing', () => {
        const editButton = wrapper.find('[data-testid="button-edit"]');
        expect(editButton.exists()).toBe(true);
    });

    it('does not render the cancel button when not editing', () => {
        const cancelButton = wrapper.find('[data-testid="button-cancel"]');
        expect(cancelButton.exists()).toBe(false);
    });
});

describe('BenefitGroupsBenefits - Interaction Tests', () => {
    let wrapper;

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(BenefitGroupsBenefits, {
            props: {
                id: '123',
                isNew: false,
                componentId: 'benefit-groups-benefits',
                isReview: false
            },
            global: {
                stubs: {
                    BenefitGroupsBenefitsTable: {
                        template: '<div data-testid="benefits-table"></div>',
                        props: ['isEditable', 'id'],
                        emits: ['setTotalBenefitIncluded']
                    },
                    BenefitGroupsBenefitsForm: {
                        template: '<div data-testid="benefits-form"></div>',
                        props: ['id'],
                        emits: ['setTotalBenefitIncluded']
                    },
                    SyncPricesDialog: {
                        template:
                            '<div data-testid="sync-prices-dialog"></div>',
                        props: ['openDialog', 'id', 'store'],
                        emits: ['closeDialog']
                    },
                    Label: {
                        template: '<span><slot /></span>',
                        props: ['testId']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')"><slot /></button>',
                        props: ['label', 'icon', 'dataTestid'],
                        emits: ['click']
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

    it('registers cancel callback on mount', () => {
        expect(mockRegisterCancelCallback).toHaveBeenCalledWith(
            'benefit-groups-benefits',
            expect.any(Function)
        );
    });

    it('unregisters cancel callback on unmount', async () => {
        wrapper.unmount();
        expect(mockUnregisterCancelCallback).toHaveBeenCalledWith(
            'benefit-groups-benefits'
        );
    });

    it('enters edit mode when edit button is clicked', async () => {
        const editButton = wrapper.find('[data-testid="button-edit"]');
        await editButton.trigger('click');

        expect(wrapper.vm.isEditing).toBe(true);
        expect(mockSetActiveComponent).toHaveBeenCalledWith(
            'benefit-groups-benefits'
        );

        // Form should be visible in edit mode
        const form = wrapper.find('[data-testid="benefits-form"]');
        expect(form.exists()).toBe(true);

        // Cancel button should be visible in edit mode
        const cancelButton = wrapper.find('[data-testid="button-cancel"]');
        expect(cancelButton.exists()).toBe(true);
    });

    it('exits edit mode when cancel button is clicked', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="button-edit"]');
        await editButton.trigger('click');

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="button-cancel"]');
        await cancelButton.trigger('click');

        expect(wrapper.vm.isEditing).toBe(false);
        expect(mockClearActiveComponent).toHaveBeenCalled();

        // Form should not be visible after canceling
        const form = wrapper.find('[data-testid="benefits-form"]');
        expect(form.exists()).toBe(false);
    });

    it('updates totalBenefitIncluded when setTotalBenefitIncluded is called', async () => {
        wrapper.vm.setTotalBenefitIncluded(5);
        expect(wrapper.vm.totalBenefitIncluded).toBe(5);
    });
});

describe('BenefitGroupsBenefits - New Benefit Group Tests', () => {
    let wrapper;

    beforeEach(async () => {
        wrapper = mount(BenefitGroupsBenefits, {
            props: {
                id: '123',
                isNew: true,
                componentId: 'benefit-groups-benefits',
                isReview: false
            },
            global: {
                stubs: {
                    BenefitGroupsBenefitsTable: {
                        template: '<div data-testid="benefits-table"></div>',
                        props: ['isEditable', 'id'],
                        emits: ['setTotalBenefitIncluded']
                    },
                    BenefitGroupsBenefitsForm: {
                        template: '<div data-testid="benefits-form"></div>',
                        props: ['id'],
                        emits: ['setTotalBenefitIncluded']
                    },
                    SyncPricesDialog: {
                        template:
                            '<div data-testid="sync-prices-dialog"></div>',
                        props: ['openDialog', 'id', 'store'],
                        emits: ['closeDialog']
                    },
                    Label: {
                        template: '<span><slot /></span>',
                        props: ['testId']
                    },
                    Button: {
                        template:
                            '<button :data-testid="dataTestid" @click="$emit(\'click\')"><slot /></button>',
                        props: ['label', 'icon', 'dataTestid'],
                        emits: ['click']
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

    it('renders the benefits form when isNew is true', () => {
        const form = wrapper.find('[data-testid="benefits-form"]');
        expect(form.exists()).toBe(true);
    });

    it('shows benefit count message when totalBenefitIncluded is greater than 0', async () => {
        wrapper.vm.setTotalBenefitIncluded(3);
        await nextTick();

        const message = wrapper.text();
        expect(message).toContain('3');
        expect(message).toContain('benefit_groups.benefits_included');
    });

    it('uses singular form when totalBenefitIncluded is 1', async () => {
        wrapper.vm.setTotalBenefitIncluded(1);
        await nextTick();

        const message = wrapper.text();
        expect(message).toContain('1');
        expect(message).toContain('benefit_groups.benefit_included');
    });
});
