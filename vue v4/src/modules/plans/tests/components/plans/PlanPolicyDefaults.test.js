import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import PlanPolicyDefaults from '@/modules/plans/components/plans/PlanPolicyDefaults.vue';
import { nextTick } from 'vue';

// Mock the PlanStore
const mockUpdatePlan = vi.fn().mockResolvedValue({
    data: {
        id: '123',
        name: { en: 'Updated Plan' },
        minimum_age: 18,
        minimum_age_type: { id: 'years', name: 'common.years' },
        maximum_age: 65,
        maximum_age_type: { id: 'years', name: 'common.years' },
        enrolment_period: 30,
        enrolment_period_type: { id: 'days', name: 'common.days' },
        policy_term: 90,
        policy_term_type: { id: 'days', name: 'common.days' }
    }
});

vi.mock('@/modules/plans/stores/Plan', () => ({
    usePlanStore: vi.fn(() => ({
        updatePlan: mockUpdatePlan,
        transferPayload: vi.fn((data) => data)
    }))
}));

// Mock the event bus
const mockEmit = vi.fn();
vi.mock('@/composables/event-bus', () => ({
    default: vi.fn(() => ({
        emit: mockEmit
    }))
}));

// Mock vue-i18n
vi.mock('vue-i18n', () => ({
    useI18n: vi.fn(() => ({
        t: (key) => key
    }))
}));

// Mock vue-router
import { useRoute } from 'vue-router';
const mockRoute = { name: 'Plan Details' };
vi.mock('vue-router', () => ({
    useRoute: vi.fn(() => mockRoute)
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

describe('PlanPolicyDefaults - Rendering Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        minimum_age: 18,
        minimum_age_type: { id: 'years', name: 'common.years' },
        maximum_age: 65,
        maximum_age_type: { id: 'years', name: 'common.years' },
        enrolment_period: 30,
        enrolment_period_type: { id: 'days', name: 'common.days' },
        policy_term: 90,
        policy_term_type: { id: 'days', name: 'common.days' }
    };

    beforeEach(async () => {
        wrapper = mount(PlanPolicyDefaults, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'plan-policy-defaults',
                isReview: false
            },
            global: {
                stubs: {
                    PolicyDefaultForm: {
                        template:
                            '<div data-testid="policy-default-form"></div>',
                        props: ['modelValue', 'isNew'],
                        emits: ['update:modelValue']
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
                    }
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        await nextTick();
    });

    it('renders the component', () => {
        expect(wrapper.exists()).toBe(true);
    });

    it('displays the policy defaults details when not editing', () => {
        // Check for section titles
        expect(wrapper.text()).toContain('plans.policy_defaults');

        // Check for policy defaults
        expect(wrapper.text()).toContain('plans.main_applicant_minimum_age');
        expect(wrapper.text()).toContain('18');
        expect(wrapper.text()).toContain('common.years');

        expect(wrapper.text()).toContain('plans.main_applicant_maximum_age');
        expect(wrapper.text()).toContain('65');
        expect(wrapper.text()).toContain('common.years');

        expect(wrapper.text()).toContain('plans.enrolment_period');
        expect(wrapper.text()).toContain('30');
        expect(wrapper.text()).toContain('common.days');

        expect(wrapper.text()).toContain('plans.policy_term');
        expect(wrapper.text()).toContain('90');
        expect(wrapper.text()).toContain('common.days');
    });

    it('does not display the policy default form when not editing', () => {
        const form = wrapper.find('[data-testid="policy-default-form"]');
        expect(form.exists()).toBe(false);
    });

    it('displays the edit button when not editing', () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        expect(editButton.exists()).toBe(true);
    });

    it('does not display the save and cancel buttons when not editing', () => {
        const saveButton = wrapper.find('[data-testid="save-button"]');
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        expect(saveButton.exists()).toBe(false);
        expect(cancelButton.exists()).toBe(false);
    });
});

describe('PlanPolicyDefaults - Interaction Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        minimum_age: 18,
        minimum_age_type: { id: 'years', name: 'common.years' },
        maximum_age: 65,
        maximum_age_type: { id: 'years', name: 'common.years' },
        enrolment_period: 30,
        enrolment_period_type: { id: 'days', name: 'common.days' },
        policy_term: 90,
        policy_term_type: { id: 'days', name: 'common.days' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanPolicyDefaults, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'plan-policy-defaults',
                isReview: false
            },
            global: {
                stubs: {
                    PolicyDefaultForm: {
                        template:
                            '<div data-testid="policy-default-form"></div>',
                        props: ['modelValue', 'isNew'],
                        emits: ['update:modelValue']
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
                    }
                },
                mocks: {
                    $t: (key) => key
                }
            }
        });

        await nextTick();
    });

    it('registers cancel callback on mount', () => {
        expect(mockRegisterCancelCallback).toHaveBeenCalledWith(
            'plan-policy-defaults',
            expect.any(Function)
        );
    });

    it('unregisters cancel callback on unmount', async () => {
        wrapper.unmount();
        expect(mockUnregisterCancelCallback).toHaveBeenCalledWith(
            'plan-policy-defaults'
        );
    });

    it('enters edit mode when edit button is clicked', async () => {
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        expect(wrapper.vm.isEditing).toBe(true);
        expect(mockSetActiveComponent).toHaveBeenCalledWith(
            'plan-policy-defaults'
        );

        // Form should be visible in edit mode
        const form = wrapper.find('[data-testid="policy-default-form"]');
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
        const form = wrapper.find('[data-testid="policy-default-form"]');
        expect(form.exists()).toBe(false);
    });

    it('saves changes when save button is clicked', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            minimum_age: 21
        };
        await nextTick();

        // Now click save
        const saveButton = wrapper.find('[data-testid="save-button"]');
        await saveButton.trigger('click');

        expect(mockUpdatePlan).toHaveBeenCalledWith('123', expect.any(Object));
        expect(wrapper.vm.isEditing).toBe(false);
        expect(mockClearActiveComponent).toHaveBeenCalled();
        expect(mockEmit).toHaveBeenCalledWith('reloadPlanDetails');
    });

    it('handles unsaved changes when canceling', async () => {
        // Enter edit mode first
        const editButton = wrapper.find('[data-testid="edit-button"]');
        await editButton.trigger('click');

        // Modify the data to simulate changes
        wrapper.vm.itemToUpdate = {
            ...mockData,
            minimum_age: 21
        };
        await nextTick();

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        expect(mockHandleUnsavedChanges).toHaveBeenCalled();
        expect(wrapper.vm.isEditing).toBe(false);
    });
});

describe('PlanPolicyDefaults - Review Mode Tests', () => {
    let wrapper;
    const mockData = {
        id: '123',
        name: { en: 'Test Plan' },
        minimum_age: 18,
        minimum_age_type: { id: 'years', name: 'common.years' },
        maximum_age: 65,
        maximum_age_type: { id: 'years', name: 'common.years' },
        enrolment_period: 30,
        enrolment_period_type: { id: 'days', name: 'common.days' },
        policy_term: 90,
        policy_term_type: { id: 'days', name: 'common.days' }
    };

    beforeEach(async () => {
        vi.clearAllMocks();

        wrapper = mount(PlanPolicyDefaults, {
            props: {
                data: mockData,
                isNew: false,
                componentId: 'plan-policy-defaults',
                isReview: true
            },
            global: {
                stubs: {
                    PolicyDefaultForm: {
                        template:
                            '<div data-testid="policy-default-form"></div>',
                        props: ['modelValue', 'isNew'],
                        emits: ['update:modelValue']
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
                    }
                },
                mocks: {
                    $t: (key) => key
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
            minimum_age: 21
        };
        await nextTick();

        // Now click cancel
        const cancelButton = wrapper.find('[data-testid="cancel-button"]');
        await cancelButton.trigger('click');

        // In review mode, handleUnsavedChanges should not be called
        expect(mockHandleUnsavedChanges).not.toHaveBeenCalled();
        expect(wrapper.vm.isEditing).toBe(false);
    });

    it('emits reloadReviewPlanDetails event when saving in review mode', async () => {
        // Change the route name to be different from 'Plan Details'
        const originalRouteName = mockRoute.name;
        mockRoute.name = 'Review Plan';

        try {
            // Enter edit mode first
            const editButton = wrapper.find('[data-testid="edit-button"]');
            await editButton.trigger('click');

            // Modify the data to simulate changes
            wrapper.vm.itemToUpdate = {
                ...mockData,
                minimum_age: 21
            };
            await nextTick();

            // Now click save
            const saveButton = wrapper.find('[data-testid="save-button"]');
            await saveButton.trigger('click');

            expect(mockUpdatePlan).toHaveBeenCalledWith(
                '123',
                expect.any(Object)
            );
            expect(wrapper.vm.isEditing).toBe(false);
            expect(mockClearActiveComponent).toHaveBeenCalled();
            // With the proper mock of useRoute, it should emit 'reloadReviewPlanDetails'
            expect(mockEmit).toHaveBeenCalledWith('reloadReviewPlanDetails');
        } finally {
            // Restore the original route name
            mockRoute.name = originalRouteName;
        }
    });
});
