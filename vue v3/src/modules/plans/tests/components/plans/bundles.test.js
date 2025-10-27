import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Bundles from '@/modules/plans/components/plans/Bundles.vue';
import { ref } from 'vue';

// Mock the useEditState composable
const mockSetActiveComponent = vi.fn();
const mockClearActiveComponent = vi.fn();
const mockHandleUnsavedChanges = vi.fn();
const mockRegisterCancelCallback = vi.fn();
const mockUnregisterCancelCallback = vi.fn();
const activeEditComponent = ref(null);

vi.mock('@/modules/plans/composables/useEditState', () => ({
    useEditState: () => ({
        activeEditComponent,
        showUnsavedDialog: ref(false),
        setActiveComponent: mockSetActiveComponent,
        clearActiveComponent: mockClearActiveComponent,
        handleUnsavedChanges: mockHandleUnsavedChanges,
        confirmDiscard: vi.fn(),
        cancelDiscard: vi.fn(),
        registerCancelCallback: mockRegisterCancelCallback,
        unregisterCancelCallback: mockUnregisterCancelCallback,
        triggerCancelEdit: vi.fn()
    })
}));

// Mock the PlanStore
const mockUpdatePlan = vi.fn().mockResolvedValue({});
const mockTransferPayload = vi.fn().mockReturnValue({});

vi.mock('@/modules/plans/stores/Plan', () => ({
    usePlanStore: vi.fn(() => ({
        updatePlan: mockUpdatePlan,
        transferPayload: mockTransferPayload
    }))
}));

// Mock the AssociatedPlanStore
const mockUpdateAssociatedPlan = vi.fn().mockResolvedValue({});
const mockAssociatedTransferPayload = vi.fn().mockReturnValue({});

vi.mock('@/modules/plans/stores/AssociatedPlan', () => ({
    useAssociatedPlanStore: vi.fn(() => ({
        updateAssociatedPlan: mockUpdateAssociatedPlan,
        transferPayload: mockAssociatedTransferPayload,
        parentPlan: { id: 'parent-1' },
        currentPlan: { id: 'current-1' }
    }))
}));

// Mock the event bus
const mockEmit = vi.fn();

vi.mock('@/composables/event-bus', () => ({
    default: vi.fn(() => ({
        emit: mockEmit
    }))
}));

// Mock the router
vi.mock('vue-router', () => ({
    useRoute: vi.fn(() => ({
        name: 'Plan Details'
    }))
}));

// Mock the helpers
vi.mock('@/utils/helpers', () => ({
    default: {
        getLocaleValue: (value) => value?.en || ''
    }
}));

describe('Bundles - Rendering Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        non_insurance_products: []
    };

    beforeEach(() => {
        vi.clearAllMocks();
        activeEditComponent.value = null;
    });

    it('component renders correctly in view mode', async () => {
        wrapper = mount(Bundles, {
            props: {
                data: mockData,
                componentId: 'bundles-1'
            }
        });

        expect(wrapper.findByTestId('bundles-title').text()).toBe('Bundles');
        expect(wrapper.findByTestId('edit-button').text()).toBe('Edit');
        expect(
            wrapper.findByTestId('include-non-insurance-product-label').text()
        ).toBe('Include Non-Insurance Products');
        expect(
            wrapper.findByTestId('no-non-insurance-products-icon').exists()
        ).toBe(true); // No NonInsuranceProduct indicator
        expect(wrapper.findByTestId('bundles-form').exists()).toBe(false);
    });

    it('renders Non-Insurance Product when they exist', async () => {
        wrapper = mount(Bundles, {
            props: {
                data: {
                    id: '123',
                    non_insurance_products: [
                        { id: '1', name: { en: 'Non-Insurance Product 1' } },
                        { id: '2', name: { en: 'Non-Insurance Product 2' } }
                    ]
                },
                componentId: 'bundles-1'
            }
        });

        expect(
            wrapper.findByTestId('no-non-insurance-products-icon').exists()
        ).toBe(false);
        expect(wrapper.text()).toContain(
            'Non-Insurance Product 1, Non-Insurance Product 2'
        );
    });

    it('disables edit button when another component is being edited', async () => {
        activeEditComponent.value = 'other-component';

        wrapper = mount(Bundles, {
            props: {
                data: mockData,
                componentId: 'bundles-1'
            }
        });

        const editButton = wrapper.findByTestId('edit-button');
        expect(editButton.attributes('disabled')).toBeDefined();
    });
});

describe('Bundles - Interaction Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        non_insurance_products: [
            { id: '1', name: { en: 'Non-Insurance Product 1' } }
        ]
    };

    beforeEach(async () => {
        vi.clearAllMocks();
        activeEditComponent.value = null;

        wrapper = mount(Bundles, {
            props: {
                data: mockData,
                componentId: 'bundles-1'
            },
            global: {
                stubs: {
                    BundlesForm: {
                        template: '<div class="bundles-form"><slot /></div>',
                        props: ['modelValue', 'isNew'],
                        emits: [
                            'update:modelValue',
                            'nonInsuranceProductChanged'
                        ]
                    }
                }
            }
        });
    });

    it('switches to edit mode when edit button is clicked', async () => {
        const editButton = wrapper.findByTestId('edit-button');
        await editButton.trigger('click');

        expect(wrapper.vm.isEditing).toBe(true);
        expect(mockSetActiveComponent).toHaveBeenCalledWith('bundles-1');
        expect(wrapper.findByTestId('bundles-form').exists()).toBe(true);
        expect(wrapper.findByTestId('cancel-button').exists()).toBe(true);
    });

    it('cancels editing when cancel button is clicked with no changes', async () => {
        // Enter edit mode
        await wrapper.findByTestId('edit-button').trigger('click');

        // Click cancel
        await wrapper.findByTestId('cancel-button').trigger('click');

        expect(wrapper.vm.isEditing).toBe(false);
        expect(mockClearActiveComponent).toHaveBeenCalled();
        expect(wrapper.find('.bundles-form').exists()).toBe(false);
    });

    it('shows unsaved changes dialog when cancel button is clicked with changes', async () => {
        // Enter edit mode
        await wrapper.findByTestId('edit-button').trigger('click');

        // Make changes
        wrapper.vm.itemToUpdate = {
            id: '123',
            non_insurance_products: [
                { id: '1', name: { en: 'Non-Insurance Product 1' } },
                { id: '2', name: { en: 'Non-Insurance Product 2' } }
            ]
        };

        // Click cancel
        await wrapper.findByTestId('cancel-button').trigger('click');

        expect(mockHandleUnsavedChanges).toHaveBeenCalled();
    });

    it('saves changes when save button is clicked (plan variant)', async () => {
        // Enter edit mode
        await wrapper.findByTestId('edit-button').trigger('click');

        // Make changes
        wrapper.vm.itemToUpdate = {
            id: '123',
            non_insurance_products: [
                { id: '1', name: { en: 'Non-Insurance Product 1' } },
                { id: '2', name: { en: 'Non-Insurance Product 2' } }
            ]
        };
        await nextTick();

        // Manually call save method
        await wrapper.vm.save();
        await nextTick();

        expect(mockUpdatePlan).toHaveBeenCalledWith('123', expect.any(Object));
        expect(wrapper.emitted('nonInsuranceProductChanged')).toBeTruthy();
        expect(wrapper.emitted('nonInsuranceProductChanged')[0][0]).toBe(
            'added'
        );
        expect(mockEmit).toHaveBeenCalledWith('reloadPlanDetails');
        expect(wrapper.vm.isEditing).toBe(false);
    });

    it('saves changes when save button is clicked (associatedPlan variant)', async () => {
        // Create a new wrapper with associatedPlan variant
        const associatedWrapper = mount(Bundles, {
            props: {
                data: mockData,
                componentId: 'bundles-1',
                variant: 'associatedPlan'
            },
            global: {
                stubs: {
                    BundlesForm: {
                        template: '<div class="bundles-form"><slot /></div>',
                        props: ['modelValue', 'isNew'],
                        emits: [
                            'update:modelValue',
                            'nonInsuranceProductChanged'
                        ]
                    }
                }
            }
        });

        // Enter edit mode
        await associatedWrapper.findByTestId('edit-button').trigger('click');

        // Make changes
        associatedWrapper.vm.itemToUpdate = {
            id: '123',
            non_insurance_products: [
                { id: '1', name: { en: 'Non-Insurance Product 1' } },
                { id: '2', name: { en: 'Non-Insurance Product 2' } }
            ]
        };
        await nextTick();

        // Manually call save method
        await associatedWrapper.vm.save();
        await nextTick();

        expect(mockUpdateAssociatedPlan).toHaveBeenCalledWith(
            'parent-1',
            'current-1',
            expect.any(Object)
        );
        expect(
            associatedWrapper.emitted('nonInsuranceProductChanged')
        ).toBeTruthy();
        expect(
            associatedWrapper.emitted('nonInsuranceProductChanged')[0][0]
        ).toBe('added');
        expect(mockEmit).toHaveBeenCalledWith('reloadPlan');
    });

    it('detects when Non-Insurance Product are removed', async () => {
        // Enter edit mode
        await wrapper.findByTestId('edit-button').trigger('click');

        // Remove all NonInsuranceProduct
        wrapper.vm.itemToUpdate = {
            id: '123',
            non_insurance_products: []
        };
        await nextTick();

        // Manually call save method
        await wrapper.vm.save();
        await nextTick();

        expect(wrapper.emitted('nonInsuranceProductChanged')).toBeTruthy();
        expect(wrapper.emitted('nonInsuranceProductChanged')[0][0]).toBe(
            'removed'
        );
    });

    it('detects when Non-Insurance Product are changed', async () => {
        // Create a wrapper with multiple NonInsuranceProduct
        const multiWrapper = mount(Bundles, {
            props: {
                data: {
                    id: '123',
                    non_insurance_products: [
                        { id: '1', name: { en: 'Non-Insurance Product 1' } },
                        { id: '2', name: { en: 'Non-Insurance Product 2' } }
                    ]
                },
                componentId: 'bundles-1'
            },
            global: {
                stubs: {
                    BundlesForm: {
                        template: '<div class="bundles-form"><slot /></div>',
                        props: ['modelValue', 'isNew'],
                        emits: [
                            'update:modelValue',
                            'nonInsuranceProductChanged'
                        ]
                    }
                }
            }
        });

        // Enter edit mode
        await multiWrapper.findByTestId('edit-button').trigger('click');

        // Change NonInsuranceProduct (same count but different IDs)
        multiWrapper.vm.itemToUpdate = {
            id: '123',
            non_insurance_products: [
                { id: '1', name: { en: 'Non-Insurance Product 1' } },
                { id: '3', name: { en: 'Non-Insurance Product 3' } }
            ]
        };
        await nextTick();

        // Manually call save method
        await multiWrapper.vm.save();
        await nextTick();

        expect(multiWrapper.emitted('nonInsuranceProductChanged')).toBeTruthy();
        expect(multiWrapper.emitted('nonInsuranceProductChanged')[0][0]).toBe(
            'changed'
        );
    });

    it('registers and unregisters cancel callback on mount and unmount', async () => {
        expect(mockRegisterCancelCallback).toHaveBeenCalledWith(
            'bundles-1',
            expect.any(Function)
        );

        // Unmount the component
        wrapper.unmount();

        expect(mockUnregisterCancelCallback).toHaveBeenCalledWith('bundles-1');
    });
});
