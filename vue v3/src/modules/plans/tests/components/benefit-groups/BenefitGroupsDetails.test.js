import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import BenefitGroupsDetails from '@/modules/plans/components/benefit-groups/BenefitGroupsDetails.vue';
import { nextTick } from 'vue';

// Mock the BenefitStore
const mockUpdateBenefitGroup = vi.fn().mockResolvedValue({
    data: {
        id: '123',
        name: { en: 'Updated Group' },
        coverage: 80,
        max_amount: 1000,
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        bound: { value: 'in' },
        type: { value: 'domestic' }
    }
});

vi.mock('@/modules/plans/stores/Benefit', () => ({
    useBenefitStore: vi.fn(() => ({
        updateBenefitGroup: mockUpdateBenefitGroup,
        processPayload: vi.fn((data) => data),
        processResponse: vi.fn((data) => data)
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
        emit: mockEmit
    }))
}));

// Mock the useEditState composable
const mockSetActiveComponent = vi.fn();
const mockClearActiveComponent = vi.fn();
const mockRegisterCancelCallback = vi.fn();
const mockUnregisterCancelCallback = vi.fn();
const mockHandleUnsavedChanges = vi.fn((callback) => callback());

vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: vi.fn(() => ({
        activeEditComponent: { value: null },
        setActiveComponent: mockSetActiveComponent,
        clearActiveComponent: mockClearActiveComponent,
        registerCancelCallback: mockRegisterCancelCallback,
        unregisterCancelCallback: mockUnregisterCancelCallback,
        handleUnsavedChanges: mockHandleUnsavedChanges
    }))
}));

describe('BenefitGroupsDetails - Rendering Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Group' },
        coverage: 75,
        max_amount: 500,
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        bound: { value: 'in' },
        type: { value: 'domestic' }
    };

    beforeEach(async () => {
        wrapper = mount(BenefitGroupsDetails, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'benefit-groups-details',
                isReview: false
            },
            global: {
                stubs: {
                    BenefitGroupsDetailsForm: {
                        template: '<div data-testid="details-form"></div>',
                        props: ['modelValue', 'isNew'],
                        emits: ['update:modelValue']
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
                            'dataTestid',
                            'loading',
                            'disabled'
                        ],
                        emits: ['click']
                    },
                    Loader: {
                        template: '<div data-testid="loader"></div>'
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

    it('displays the benefit group details', () => {
        const text = wrapper.text();
        expect(text).toContain('Test Group'); // name
        expect(text).toContain('75 %'); // coverage
        expect(text).toContain('$500'); // max_amount
        expect(text).toContain('Yes'); // inbound (bound.value === 'in')
        expect(text).toContain('No'); // international (type.value === 'domestic')
    });

    it('does not render the details form when not editing', () => {
        const form = wrapper.find('[data-testid="details-form"]');
        expect(form.exists()).toBe(false);
    });

    it('renders the edit button when not editing', () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        expect(editButton.exists()).toBe(true);
    });

    it('does not render the save and cancel buttons when not editing', () => {
        const saveButton = wrapper.find('[data-testid="save-button"]');
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        expect(saveButton.exists()).toBe(false);
        expect(cancelButton.exists()).toBe(false);
    });
});

describe('BenefitGroupsDetails - Interaction Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Group' },
        coverage: 75,
        max_amount: 500,
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        bound: { value: 'in' },
        type: { value: 'domestic' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(BenefitGroupsDetails, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'benefit-groups-details',
                isReview: false
            },
            global: {
                stubs: {
                    BenefitGroupsDetailsForm: {
                        template: '<div data-testid="details-form"></div>',
                        props: ['modelValue', 'isNew'],
                        emits: ['update:modelValue']
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
                            'dataTestid',
                            'loading',
                            'disabled'
                        ],
                        emits: ['click']
                    },
                    Loader: {
                        template: '<div data-testid="loader"></div>'
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
            'benefit-groups-details',
            expect.any(Function)
        );
    });

    it('unregisters cancel callback on unmount', async () => {
        wrapper.unmount();
        expect(mockUnregisterCancelCallback).toHaveBeenCalledWith(
            'benefit-groups-details'
        );
    });

    it('enters edit mode when edit button is clicked', async () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        expect(wrapper.vm.isEditing).toBe(true);
        expect(mockSetActiveComponent).toHaveBeenCalledWith(
            'benefit-groups-details'
        );

        // Form should be visible in edit mode
        const form = wrapper.find('[data-testid="details-form"]');
        expect(form.exists()).toBe(true);

        // Save and cancel buttons should be visible in edit mode
        const saveButton = wrapper.find('[data-testid="save-button"]');
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        expect(saveButton.exists()).toBe(true);
        expect(cancelButton.exists()).toBe(true);
    });

    it('exits edit mode when cancel button is clicked', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        expect(wrapper.vm.isEditing).toBe(false);
        expect(mockClearActiveComponent).toHaveBeenCalled();

        // Form should not be visible after canceling
        const form = wrapper.find('[data-testid="details-form"]');
        expect(form.exists()).toBe(false);
    });

    it('saves changes when save button is clicked', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            coverage: 80,
            name: { en: 'Updated Group' }
        };
        await nextTick();

        // Now click save
        const saveButton = wrapper.find('[data-testid="save-button"]');
        await saveButton.trigger('click');

        expect(mockUpdateBenefitGroup).toHaveBeenCalledWith(
            '123',
            expect.any(Object)
        );
        expect(wrapper.vm.isEditing).toBe(false);
        expect(mockClearActiveComponent).toHaveBeenCalled();
        expect(mockEmit).toHaveBeenCalledWith('reloadBenefitGroupDetails');
    });

    it('handles unsaved changes when canceling', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            coverage: 80
        };
        await nextTick();

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        expect(mockHandleUnsavedChanges).toHaveBeenCalled();
        expect(wrapper.vm.isEditing).toBe(false);
    });
});

describe('BenefitGroupsDetails - Review Mode Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Group' },
        coverage: 75,
        max_amount: 500,
        effective_date: '2023-01-01',
        end_date: '2023-12-31',
        bound: { value: 'in' },
        type: { value: 'domestic' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(BenefitGroupsDetails, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'benefit-groups-details',
                isReview: true
            },
            global: {
                stubs: {
                    BenefitGroupsDetailsForm: {
                        template: '<div data-testid="details-form"></div>',
                        props: ['modelValue', 'isNew'],
                        emits: ['update:modelValue']
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
                            'dataTestid',
                            'loading',
                            'disabled'
                        ],
                        emits: ['click']
                    },
                    Loader: {
                        template: '<div data-testid="loader"></div>'
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

    it('skips unsaved changes check in review mode', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            coverage: 80
        };
        await nextTick();

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        // In review mode, handleUnsavedChanges should not be called
        expect(mockHandleUnsavedChanges).not.toHaveBeenCalled();
        expect(wrapper.vm.isEditing).toBe(false);
    });
});
